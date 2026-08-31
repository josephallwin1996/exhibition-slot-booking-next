import crypto from "crypto";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";

import { verifyAdminToken } from "@/lib/auth";

import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/email";

import {
  sendWhatsAppTemplate,
} from "@/lib/whatsapp";

/*
 * =========================================================
 * ADMIN AUTHENTICATION
 * =========================================================
 */

async function authenticateAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const admin =
    verifyAdminToken(token);

  if (!admin || admin.role !== "admin") {
    return null;
  }

  return admin;
}

/*
 * =========================================================
 * NORMALIZE WHATSAPP NUMBER
 * =========================================================
 *
 * Examples:
 *
 * +91 9645395716
 *       ↓
 * 919645395716
 *
 * 9645395716
 *       ↓
 * 919645395716
 */

function normalizeWhatsAppNumber(
  mobile
) {
  if (!mobile) {
    return null;
  }

  let number =
    String(mobile).trim();

  // Remove +, spaces, -, brackets, etc.
  number = number.replace(
    /[^\d]/g,
    ""
  );

  // Assume India for a 10 digit number.
  if (number.length === 10) {
    number = `91${number}`;
  }

  return number;
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

    const { id } =
      await params;

    await connectDB();

    const application =
      await Application.findById(id)
        .populate(
          "categoryId",
          "name"
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
 * UPDATE APPLICATION
 * APPROVE / REJECT
 * =========================================================
 */

export async function PATCH(
  request,
  { params }
) {
  try {
    /*
     * -----------------------------------------------------
     * Authenticate admin
     * -----------------------------------------------------
     */

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

    /*
     * -----------------------------------------------------
     * Request data
     * -----------------------------------------------------
     */

    const { id } =
      await params;

    const body =
      await request.json();

    const {
      action,
      rejectionReason,
    } = body;

    /*
     * -----------------------------------------------------
     * Validate action
     * -----------------------------------------------------
     */

    if (
      !["approve", "reject"].includes(
        action
      )
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid action.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -----------------------------------------------------
     * Database
     * -----------------------------------------------------
     */

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
     * -----------------------------------------------------
     * Prevent duplicate approval/rejection
     * -----------------------------------------------------
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
       * ---------------------------------------------------
       * Generate booking token
       * ---------------------------------------------------
       */

      const bookingToken =
        crypto.randomBytes(32).toString(
          "hex"
        );

      /*
       * ---------------------------------------------------
       * Update application
       * ---------------------------------------------------
       */

      application.status =
        "approved";

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
       * ---------------------------------------------------
       * Booking URL
       * ---------------------------------------------------
       *
       * This is the same URL you were already using.
       */

      const appUrl =
        process.env
          .NEXT_PUBLIC_APP_URL;

      const bookingLink =
        `${appUrl}/booking/${bookingToken}`;

      /*
       * ===================================================
       * EMAIL — APPROVAL
       * ===================================================
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
        /*
         * Email failure should NOT
         * make approval fail.
         */

        console.error(
          "Approval email error:",
          emailError
        );
      }

      /*
       * ===================================================
       * WHATSAPP — APPLICATION APPROVED
       * ===================================================
       *
       * Template:
       *
       * application_approved
       *
       * Body variables:
       *
       * {{1}} = Contact person
       * {{2}} = Business name
       * {{3}} = Application reference
       *
       * Button:
       *
       * URL button
       * bookingToken is supplied as the
       * dynamic URL parameter.
       * ===================================================
       */

      const applicantWhatsApp =
        normalizeWhatsAppNumber(
          application.mobile
        );

      if (applicantWhatsApp) {
        try {
          await sendWhatsAppTemplate(
            {
              to:
                applicantWhatsApp,

              templateName:
                "application_approved",

              languageCode:
                "en",

              components: [
                /*
                 * -----------------------------------------
                 * BODY VARIABLES
                 * -----------------------------------------
                 */

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

                /*
                 * -----------------------------------------
                 * BOOKING URL BUTTON
                 * -----------------------------------------
                 *
                 * Meta will append this value to the
                 * dynamic URL configured in the template.
                 *
                 * Example template URL:
                 *
                 * https://example.com/booking/{{1}}
                 *
                 * Result:
                 *
                 * https://example.com/booking/abc123...
                 */

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
            }
          );

          console.log(
            "Application approved WhatsApp sent:",
            applicantWhatsApp
          );
        } catch (whatsappError) {
          /*
           * IMPORTANT:
           *
           * WhatsApp failure must NEVER
           * undo the approval.
           *
           * The application is already approved
           * and saved above.
           */

          console.error(
            "Approval WhatsApp error:",
            whatsappError
          );
        }
      } else {
        console.warn(
          "Approval WhatsApp skipped: invalid applicant mobile number."
        );
      }

      /*
       * ---------------------------------------------------
       * Response
       * ---------------------------------------------------
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
        },
      });
    }

    /*
     * =====================================================
     * REJECT
     * =====================================================
     */

    if (action === "reject") {
      /*
       * ---------------------------------------------------
       * Validate rejection reason
       * ---------------------------------------------------
       */

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

      /*
       * ---------------------------------------------------
       * Update application
       * ---------------------------------------------------
       */

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

      await application.save();

      /*
       * ===================================================
       * EMAIL — REJECTION
       * ===================================================
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
        /*
         * Email failure should NOT
         * make rejection fail.
         */

        console.error(
          "Rejection email error:",
          emailError
        );
      }

      /*
       * ---------------------------------------------------
       * Response
       * ---------------------------------------------------
       *
       * No WhatsApp template was requested
       * for rejection, so we leave that unchanged.
       */

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