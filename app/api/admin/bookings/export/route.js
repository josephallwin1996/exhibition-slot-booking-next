import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Application from "@/models/Application";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ||
      "";

    const paymentStatus =
      searchParams.get("paymentStatus") ||
      "all";

    const category =
      searchParams.get("category") ||
      "all";

    /*
     * ----------------------------------------------------
     * BUILD BOOKING QUERY
     * ----------------------------------------------------
     */

    const bookingQuery = {};

    /*
     * Payment filter
     */
    if (
      paymentStatus &&
      paymentStatus !== "all"
    ) {
      bookingQuery.paymentStatus =
        paymentStatus;
    }

    /*
     * ----------------------------------------------------
     * FIND MATCHING APPLICATIONS
     *
     * The admin bookings API uses Application data for:
     * - businessName
     * - contactPerson
     * - email
     * - mobileNumber
     * - category
     * ----------------------------------------------------
     */

    let matchingApplicationIds = null;

    if (search || category !== "all") {
      const applicationQuery = {};

      /*
       * Search applicant information
       */
      if (search) {
        applicationQuery.$or = [
          {
            businessName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            contactPerson: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            mobile: {
              $regex: search,
              $options: "i",
            },
          },
          {
            bookingToken: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      /*
       * Category filter
       *
       * category from the admin UI is expected
       * to be the Category document ID.
       */
      if (
        category &&
        category !== "all"
      ) {
        applicationQuery.categoryId =
          category;
      }

      const matchingApplications =
        await Application.find(
          applicationQuery
        )
          .select(
            "_id businessName contactPerson email mobile categoryId"
          )
          .lean();

      matchingApplicationIds =
        matchingApplications.map(
          (application) =>
            application._id
        );
    }

    /*
     * ----------------------------------------------------
     * SEARCH
     * ----------------------------------------------------
     *
     * Search can match:
     * - booking reference
     * - slot number
     * - applicant information
     *
     * If application filtering was performed,
     * include those application IDs.
     */

    if (search) {
      const searchConditions = [
        {
          bookingReference: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slotNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];

      /*
       * Application matches
       */
      if (
        matchingApplicationIds &&
        matchingApplicationIds.length > 0
      ) {
        searchConditions.push({
          applicationId: {
            $in: matchingApplicationIds,
          },
        });
      }

      bookingQuery.$or =
        searchConditions;
    } else if (
      category &&
      category !== "all"
    ) {
      /*
       * Category-only filtering
       */
      bookingQuery.applicationId = {
        $in:
          matchingApplicationIds || [],
      };
    }

    /*
     * ----------------------------------------------------
     * FETCH ALL MATCHING BOOKINGS
     *
     * No pagination.
     * ----------------------------------------------------
     */

    const bookings =
      await Booking.find(bookingQuery)
        .sort({
          createdAt: -1,
        })
        .lean();

    /*
     * ----------------------------------------------------
     * FETCH APPLICATION DATA
     * ----------------------------------------------------
     */

    const applicationIds =
      bookings
        .map(
          (booking) =>
            booking.applicationId
        )
        .filter(Boolean);

    const applications =
      await Application.find({
        _id: {
          $in: applicationIds,
        },
      })
        .populate(
          "categoryId",
          "name slug"
        )
        .lean();

    /*
     * Create quick lookup map
     */
    const applicationMap =
      new Map(
        applications.map(
          (application) => [
            String(
              application._id
            ),
            application,
          ]
        )
      );

    /*
     * ----------------------------------------------------
     * CSV HEADERS
     * ----------------------------------------------------
     */

    const headers = [
      "Booking Reference",
      "Business Name",
      "Contact Person",
      "Email",
      "Mobile Number",
      "Category",
      "Stall Number",
      "Add-ons",
      "Stall Amount",
      "Add-on Amount",
      "Total Amount",
      "Payment Status",
      "Payment ID",
      "Order ID",
      "Booking Status",
      "Booking Date",
    ];

    /*
     * ----------------------------------------------------
     * CSV VALUE HELPER
     * ----------------------------------------------------
     */

    function csvValue(value) {
      if (
        value === null ||
        value === undefined
      ) {
        return '""';
      }

      const stringValue =
        String(value);

      const escaped =
        stringValue.replaceAll(
          '"',
          '""'
        );

      return `"${escaped}"`;
    }

    /*
     * ----------------------------------------------------
     * BUILD CSV ROWS
     * ----------------------------------------------------
     */

    const rows = bookings.map(
      (booking) => {
        const application =
          applicationMap.get(
            String(
              booking.applicationId
            )
          );

        /*
         * -----------------------------------------------
         * ADD-ON AMOUNT
         * -----------------------------------------------
         */

        const addOnAmount =
          Array.isArray(
            booking.addOns
          )
            ? booking.addOns.reduce(
                (sum, addOn) => {
                  const quantity =
                    Number(
                      addOn.quantity ||
                        1
                    );

                  const amount =
                    Number(
                      addOn.total ??
                        addOn.amount ??
                        addOn.price ??
                        0
                    );

                  /*
                   * If total already represents
                   * quantity × price, don't multiply
                   * again.
                   */
                  const lineTotal =
                    addOn.total !==
                    undefined
                      ? amount
                      : amount *
                        quantity;

                  return (
                    sum + lineTotal
                  );
                },
                0
              )
            : 0;

        /*
         * -----------------------------------------------
         * TOTAL AMOUNT
         * -----------------------------------------------
         */

        const totalAmount =
          Number(
            booking.total || 0
          );

        /*
         * -----------------------------------------------
         * STALL AMOUNT
         * -----------------------------------------------
         */

        const stallAmount =
          Number(
            booking.stallAmount ??
              booking.slotAmount ??
              booking.baseAmount ??
              Math.max(
                0,
                totalAmount -
                  addOnAmount
              )
          );

        /*
         * -----------------------------------------------
         * ADD-ON TEXT
         * -----------------------------------------------
         */

        const addOns =
          Array.isArray(
            booking.addOns
          )
            ? booking.addOns
                .map(
                  (addOn) => {
                    const name =
                      addOn.name ||
                      addOn.title ||
                      "Add-on";

                    const quantity =
                      Number(
                        addOn.quantity ||
                          1
                      );

                    return `${name} x${quantity}`;
                  }
                )
                .join("; ")
            : "";

        /*
         * -----------------------------------------------
         * APPLICATION DATA
         * -----------------------------------------------
         */

        const businessName =
          application?.businessName ||
          "—";

        const contactPerson =
          application?.contactPerson ||
          "—";

        const email =
          application?.email ||
          "—";

        const mobileNumber =
          application?.mobile ||
          "—";

        const categoryName =
          application?.categoryId?.name ||
          booking.category ||
          "—";

        /*
         * -----------------------------------------------
         * PAYMENT / ORDER IDs
         *
         * Supports current Cashfree fields
         * and older legacy fields.
         * -----------------------------------------------
         */

        const paymentId =
          booking.cashfreePaymentId ||
          booking.paymentId ||
          booking.razorpayPaymentId ||
          "";

        const orderId =
          booking.cashfreeOrderId ||
          booking.orderId ||
          booking.razorpayOrderId ||
          "";

        /*
         * -----------------------------------------------
         * CSV ROW
         * -----------------------------------------------
         */

        return [
          csvValue(
            booking.bookingReference
          ),

          csvValue(
            businessName
          ),

          csvValue(
            contactPerson
          ),

          csvValue(
            email
          ),

          csvValue(
            mobileNumber
          ),

          csvValue(
            categoryName
          ),

          csvValue(
            booking.slotNumber
          ),

          csvValue(
            addOns
          ),

          csvValue(
            stallAmount
          ),

          csvValue(
            addOnAmount
          ),

          csvValue(
            totalAmount
          ),

          csvValue(
            booking.paymentStatus
          ),

          csvValue(
            paymentId
          ),

          csvValue(
            orderId
          ),

          csvValue(
            booking.status
          ),

          csvValue(
            booking.createdAt
              ? new Date(
                  booking.createdAt
                ).toLocaleString(
                  "en-IN"
                )
              : ""
          ),
        ].join(",");
      }
    );

    /*
     * ----------------------------------------------------
     * BUILD CSV
     * ----------------------------------------------------
     *
     * UTF-8 BOM helps Excel correctly
     * recognize Indian/Unicode text.
     */

    const csv = [
      "\uFEFF",
      headers
        .map(csvValue)
        .join(","),
      ...rows,
    ].join("\r\n");

    /*
     * ----------------------------------------------------
     * FILENAME
     * ----------------------------------------------------
     */

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    const filename =
      `exhibition-bookings-${date}.csv`;

    /*
     * ----------------------------------------------------
     * RESPONSE
     * ----------------------------------------------------
     */

    return new Response(csv, {
      status: 200,

      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control":
          "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Booking export error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to export bookings.",
      },
      {
        status: 500,
      }
    );
  }
}