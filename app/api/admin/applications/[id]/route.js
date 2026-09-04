import crypto from "crypto";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Category from "@/models/Category";
import Slot from "@/models/Slot";

import { verifyAdminToken } from "@/lib/auth";

import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/email";

import {
  sendWhatsAppTemplate,
} from "@/lib/whatsapp";

async function authenticateAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const admin = verifyAdminToken(token);

  if (!admin || admin.role !== "admin") {
    return null;
  }

  return admin;
}

/*
 * =========================================================
 * GET APPLICATION
 * =========================================================
 */

export async function GET(
  request,
  { params }
) {
  try {
    const admin =
      await authenticateAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    await connectDB();

    const application =
      await Application.findById(id)
        .populate(
          "categoryId",
          "name slug"
        )
        .populate(
          "allowedSlotIds",
          "slotNumber price status category position row column"
        )
        .lean();

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "Application not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(
      "Get application error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load application.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =========================================================
 * PATCH APPLICATION
 * =========================================================
 */

export async function PATCH(
  request,
  { params }
) {
  try {
    const admin =
      await authenticateAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    const body =
      await request.json();

    const {
      action,
      rejectionReason,
      selectedSlotIds,
    } = body;

    if (
      !["approve", "reject"].includes(
        action
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid action.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const application =
      await Application.findById(id);

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "Application not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Only pending applications can be
     * approved or rejected.
     */
    if (
      application.status !== "pending"
    ) {
      return Response.json(
        {
          success: false,
          message: `Application has already been ${application.status}.`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =====================================================
     * APPROVE
     * =====================================================
     */

    if (action === "approve") {
      /*
       * -----------------------------------------------
       * Validate selected slots
       * -----------------------------------------------
       */

      if (
        !Array.isArray(
          selectedSlotIds
        ) ||
        selectedSlotIds.length === 0
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Please select at least one stall before approving the application.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Remove empty values and duplicates.
       */

      const uniqueSlotIds = [
        ...new Set(
          selectedSlotIds
            .map((slotId) =>
              String(slotId).trim()
            )
            .filter(Boolean)
        ),
      ];

      if (
        uniqueSlotIds.length === 0
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Please select at least one valid stall.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * -----------------------------------------------
       * Validate MongoDB ObjectIds
       * -----------------------------------------------
       */

      const invalidObjectId =
        uniqueSlotIds.find(
          (slotId) =>
            !/^[a-fA-F0-9]{24}$/.test(
              slotId
            )
        );

      if (invalidObjectId) {
        return Response.json(
          {
            success: false,
            message:
              "One or more selected stalls have an invalid ID.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * -----------------------------------------------
       * Load selected slots
       * -----------------------------------------------
       */

      const slots =
        await Slot.find({
          _id: {
            $in: uniqueSlotIds,
          },
        });

      /*
       * Every selected slot must exist.
       */

      if (
        slots.length !==
        uniqueSlotIds.length
      ) {
        return Response.json(
          {
            success: false,
            message:
              "One or more selected stalls could not be found.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * -----------------------------------------------
       * Category validation
       * -----------------------------------------------
       *
       * Only slots belonging to the
       * application's category can be assigned.
       */

      if (!application.categoryId) {
        return Response.json(
          {
            success: false,
            message:
              "This application does not have a valid category assigned.",
          },
          {
            status: 400,
          }
        );
      }

      const invalidCategorySlot =
        slots.find(
          (slot) =>
            String(slot.category) !==
            String(
              application.categoryId
            )
        );

      if (
        invalidCategorySlot
      ) {
        return Response.json(
          {
            success: false,
            message:
              "One or more selected stalls do not belong to this application's category.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * -----------------------------------------------
       * Availability validation
       * -----------------------------------------------
       *
       * A slot must still be available at the
       * exact moment of approval.
       */

      const unavailableSlot =
        slots.find(
          (slot) =>
            slot.status !==
            "available"
        );

      if (
        unavailableSlot
      ) {
        return Response.json(
          {
            success: false,
            message:
              `Stall ${unavailableSlot.slotNumber} is no longer available. Please refresh and select the available stalls again.`,
          },
          {
            status: 409,
          }
        );
      }

      /*
       * -----------------------------------------------
       * Generate booking token
       * -----------------------------------------------
       */

      const bookingToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      application.status =
        "approved";

      /*
       * IMPORTANT:
       *
       * These slots are only the slots the applicant
       * is ALLOWED to choose from.
       *
       * They are NOT booked yet.
       */

      application.allowedSlotIds =
        uniqueSlotIds;

      application.bookingToken =
        bookingToken;

      application.approvedAt =
        new Date();

      application.rejectedAt =
        null;

      application.rejectionReason =
        "";

      await application.save();

      /*
       * -----------------------------------------------
       * Booking link
       * -----------------------------------------------
       */

      const appUrl =
        process.env
          .NEXT_PUBLIC_APP_URL;

      if (!appUrl) {
        console.error(
          "NEXT_PUBLIC_APP_URL is not configured."
        );
      }

      const bookingLink =
        appUrl
          ? `${appUrl}/book/${bookingToken}`
          : null;

      /*
       * -----------------------------------------------
       * Get category name
       * -----------------------------------------------
       */

      let categoryName =
        application.categoryName ||
        "";

      if (
        application.categoryId
      ) {
        const category =
          await Category.findById(
            application.categoryId
          )
            .select("name")
            .lean();

        if (category) {
          categoryName =
            category.name;
        }
      }

      /*
       * -----------------------------------------------
       * Approval Email
       * -----------------------------------------------
       */

      try {
        await sendApplicationApprovedEmail(
          {
            name:
              application.contactPerson,

            email:
              application.email,

            businessName:
              application.businessName,

            bookingToken:
              application.bookingToken,
          }
        );
      } catch (emailError) {
        console.error(
          "Approval email error:",
          emailError
        );
      }

      /*
       * -----------------------------------------------
       * Approval WhatsApp
       * -----------------------------------------------
       *
       * This uses the current template-based
       * WhatsApp integration.
       *
       * IMPORTANT:
       * Do not send the URL inside the button
       * as the complete URL.
       *
       * Meta appends the bookingToken to the
       * dynamic URL configured in the template.
       */

      try {
        if (
          bookingLink &&
          application.mobile
        ) {
          await sendWhatsAppTemplate({
            to:
              application.mobile,

            templateName:
              "application_approved",

            languageCode:
              "en",

            components: [
              {
                type: "body",

                parameters: [
                  {
                    type: "text",
                    text:
                      application.contactPerson,
                  },

                  {
                    type: "text",
                    text:
                      application.businessName,
                  },

                  {
                    type: "text",
                    text:
                      String(
                        application._id
                      ),
                  },
                ],
              },

              {
                type: "button",

                sub_type: "url",

                index: "0",

                parameters: [
                  {
                    type: "text",

                    text:
                      application.bookingToken,
                  },
                ],
              },
            ],
          });
        }
      } catch (
        whatsappError
      ) {
        console.error(
          "Approval WhatsApp error:",
          whatsappError
        );
      }

      /*
       * -----------------------------------------------
       * Response
       * -----------------------------------------------
       */

      return Response.json({
        success: true,

        message:
          "Application approved successfully.",

        application: {
          _id:
            application._id,

          status:
            application.status,

          bookingToken:
            application.bookingToken,

          allowedSlotIds:
            application.allowedSlotIds,
        },
      });
    }

    /*
     * =====================================================
     * REJECT
     * =====================================================
     */

    if (action === "reject") {
      if (
        !rejectionReason?.trim()
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Please provide a rejection reason.",
          },
          {
            status: 400,
          }
        );
      }

      application.status =
        "rejected";

      application.rejectionReason =
        rejectionReason.trim();

      application.rejectedAt =
        new Date();

      application.approvedAt =
        null;

      application.bookingToken =
        null;

      /*
       * Clear any previously assigned
       * slots as a safety measure.
       */

      application.allowedSlotIds =
        [];

      await application.save();

      /*
       * -----------------------------------------------
       * Rejection Email
       * -----------------------------------------------
       */

      try {
        await sendApplicationRejectedEmail(
          {
            name:
              application.contactPerson,

            email:
              application.email,

            businessName:
              application.businessName,

            rejectionReason:
              application.rejectionReason,
          }
        );
      } catch (emailError) {
        console.error(
          "Rejection email error:",
          emailError
        );
      }

      return Response.json({
        success: true,

        message:
          "Application rejected successfully.",

        application: {
          _id:
            application._id,

          status:
            application.status,

          rejectionReason:
            application.rejectionReason,

          allowedSlotIds:
            application.allowedSlotIds,
        },
      });
    }
  } catch (error) {
    console.error(
      "Application update error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to update application.",
      },
      {
        status: 500,
      }
    );
  }
}