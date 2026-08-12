import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ||
      "";

    const paymentStatus =
      searchParams.get(
        "paymentStatus"
      ) || "all";

    const category =
      searchParams.get("category") ||
      "all";

    /*
     * Build filters
     */
    const query = {};

    /*
     * Payment filter
     */
    if (
      paymentStatus &&
      paymentStatus !== "all"
    ) {
      query.paymentStatus =
        paymentStatus;
    }

    /*
     * Category filter
     */
    if (
      category &&
      category !== "all"
    ) {
      query.category = category;
    }

    /*
     * Search filter
     */
    if (search) {
      query.$or = [
        {
          bookingReference: {
            $regex: search,
            $options: "i",
          },
        },
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
          mobileNumber: {
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
    }

    /*
     * Fetch ALL matching bookings.
     *
     * Important:
     * No pagination is applied here.
     */
    const bookings =
      await Booking.find(query)
        .sort({
          createdAt: -1,
        })
        .lean();

    /*
     * CSV headers
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
     * Convert a value safely
     * into a CSV field.
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

      /*
       * Escape double quotes
       */
      const escaped =
        stringValue.replaceAll(
          '"',
          '""'
        );

      return `"${escaped}"`;
    }

    /*
     * Build rows
     */
    const rows = bookings.map(
      (booking) => {
        /*
         * Calculate add-on amount.
         *
         * This supports the common
         * structures used by the booking
         * document.
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
                   * quantity * price, don't
                   * multiply again.
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
         * Determine stall amount.
         */
        const totalAmount =
          Number(
            booking.total || 0
          );

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
         * Create readable add-on
         * text for the CSV.
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

        return [
          csvValue(
            booking.bookingReference
          ),

          csvValue(
            booking.businessName
          ),

          csvValue(
            booking.contactPerson
          ),

          csvValue(
            booking.email
          ),

          csvValue(
            booking.mobileNumber
          ),

          csvValue(
            booking.category
          ),

          csvValue(
            booking.slotNumber
          ),

          csvValue(addOns),

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
            booking.razorpayPaymentId ||
              booking.paymentId
          ),

          csvValue(
            booking.razorpayOrderId ||
              booking.orderId
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
     * UTF-8 BOM.
     *
     * This helps Microsoft Excel
     * correctly recognize UTF-8.
     */
    const csv = [
      "\uFEFF",
      headers
        .map(csvValue)
        .join(","),
      ...rows,
    ].join("\r\n");

    /*
     * Generate filename
     */
    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    const filename =
      `exhibition-bookings-${date}.csv`;

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