import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Booking from "@/models/Booking";
import Slot from "@/models/Slot";

import {
  generateInvoiceNumber,
} from "@/lib/invoice";

import {
  generateInvoicePdf,
} from "@/lib/generateInvoicePdf";

import {
  sendPaymentSuccessEmail,
  sendBookingPaymentAdminEmail,
} from "@/lib/email";

import {
  sendWhatsAppTemplate,
} from "@/lib/whatsapp";

/*
 * =========================================================
 * NORMALIZE WHATSAPP NUMBER
 * =========================================================
 */

function normalizeWhatsAppNumber(mobile) {
  if (!mobile) {
    return null;
  }

  let number = String(mobile).trim();

  number = number.replace(/[^\d]/g, "");

  /*
   * Assuming Indian mobile numbers
   * when only 10 digits are supplied.
   */
  if (number.length === 10) {
    number = `91${number}`;
  }

  return number;
}

/*
 * =========================================================
 * MANUAL BOOKING CONFIRMATION
 * =========================================================
 */

export async function PATCH(
  request,
  { params }
) {
  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return Response.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * -------------------------------------------------------
     * 1. FIND BOOKING
     * -------------------------------------------------------
     */

    const booking =
      await Booking.findById(bookingId);

    if (!booking) {
      return Response.json(
        {
          success: false,
          message: "Booking not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 2. ONLY PAYMENT-SUBMITTED BOOKINGS
     * -------------------------------------------------------
     */

    if (
      booking.status !==
      "payment_submitted"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Only bookings with submitted payment can be confirmed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 3. FIND ASSOCIATED SLOT
     * -------------------------------------------------------
     */

    const slot =
      await Slot.findOne({
        slotNumber:
          booking.slotNumber,
      });

    if (!slot) {
      return Response.json(
        {
          success: false,
          message:
            "Associated slot could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 4. PREVENT DOUBLE BOOKING
     * -------------------------------------------------------
     */

    if (
      slot.status === "booked" &&
      slot.bookingId &&
      String(slot.bookingId) !==
        String(booking._id)
    ) {
      return Response.json(
        {
          success: false,
          message:
            "This slot is already booked by another booking.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 5. LOAD APPLICATION
     * -------------------------------------------------------
     */

    const application =
      await Application.findById(
        booking.applicationId
      ).lean();

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "Associated application could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 6. MARK BOOKING AS PAID
     * -------------------------------------------------------
     *
     * Manual payment has been verified by admin.
     *
     * No Razorpay payment ID is created.
     */

    booking.paidAt = new Date();

    booking.paymentStatus = "paid";

    booking.status = "paid";

    /*
     * We intentionally do NOT set:
     *
     * booking.razorpayPaymentId
     * booking.razorpayOrderId
     * booking.razorpaySignature
     *
     * because this payment was made manually.
     */

    await booking.save();

    /*
     * -------------------------------------------------------
     * 7. MARK SLOT AS BOOKED
     * -------------------------------------------------------
     */

    slot.status = "booked";

    slot.bookingId =
      booking._id;

    /*
     * Clear temporary reservation data.
     */

    slot.reservationToken = null;

    slot.reservationExpiresAt = null;

    await slot.save();

    /*
     * =======================================================
     * 8. INVOICE
     * =======================================================
     */

    if (!booking.invoiceNumber) {
      const sequence =
        Date.now() % 100000;

      booking.invoiceNumber =
        generateInvoiceNumber(
          sequence
        );

      booking.invoiceIssuedAt =
        new Date();

      await booking.save();
    }

    /*
     * -------------------------------------------------------
     * Generate invoice PDF
     * -------------------------------------------------------
     */

    let invoicePdf = null;

    try {
      invoicePdf =
        await generateInvoicePdf({
          booking,
          application,
        });
    } catch (invoiceError) {
      /*
       * Invoice generation failure should not
       * undo the successful manual confirmation.
       */

      console.error(
        "Manual booking invoice generation failed:",
        invoiceError
      );
    }

    /*
     * =======================================================
     * 9. PAYMENT SUCCESS EMAIL — APPLICANT
     * =======================================================
     */

    try {
      await sendPaymentSuccessEmail({
        name:
          application.contactPerson,

        email:
          application.email,

        businessName:
          application.businessName,

        bookingReference:
          booking.bookingReference,

        slotNumber:
          booking.slotNumber,

        total:
          booking.total,

        /*
         * No Razorpay payment exists.
         */
        paymentId:
          "MANUAL",

        paidAt:
          booking.paidAt,

        invoiceNumber:
          booking.invoiceNumber,

        invoicePdf,
      });

      console.log(
        "Manual payment confirmation email sent to applicant."
      );
    } catch (emailError) {
      console.error(
        "Manual payment applicant email failed:",
        emailError
      );
    }

    /*
     * =======================================================
     * 10. PAYMENT SUCCESS EMAIL — ADMIN
     * =======================================================
     */

    try {
      await sendBookingPaymentAdminEmail({
        businessName:
          application.businessName,

        contactPerson:
          application.contactPerson,

        email:
          application.email,

        bookingReference:
          booking.bookingReference,

        slotNumber:
          booking.slotNumber,

        category:
          booking.category,

        total:
          booking.total,

        paymentId:
          "MANUAL",
      });

      console.log(
        "Manual payment confirmation email sent to admin."
      );
    } catch (emailError) {
      console.error(
        "Manual payment admin email failed:",
        emailError
      );
    }

    /*
     * =======================================================
     * 11. WHATSAPP — APPLICANT
     * =======================================================
     *
     * Template:
     *
     * booking_confirmed
     *
     * {{1}} Contact person
     * {{2}} Business name
     * {{3}} Booking reference
     * {{4}} Stall number
     * {{5}} Total
     * =======================================================
     */

    const applicantWhatsApp =
      normalizeWhatsAppNumber(
        application.mobile
      );

    if (applicantWhatsApp) {
      try {
        await sendWhatsAppTemplate({
          to:
            applicantWhatsApp,

          templateName:
            "booking_confirmed",

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
                    booking.bookingReference,
                },

                {
                  type: "text",
                  text:
                    String(
                      booking.slotNumber
                    ),
                },

                {
                  type: "text",
                  text:
                    String(
                      booking.total
                    ),
                },
              ],
            },
          ],
        });

        console.log(
          "Manual booking confirmation WhatsApp sent:",
          applicantWhatsApp
        );
      } catch (whatsappError) {
        /*
         * WhatsApp failure must NOT affect
         * the confirmed booking.
         */

        console.error(
          "Manual booking confirmation WhatsApp error:",
          whatsappError
        );
      }
    } else {
      console.warn(
        "Manual booking confirmation WhatsApp skipped: invalid applicant mobile number."
      );
    }

    /*
     * =======================================================
     * 12. WHATSAPP — ADMIN
     * =======================================================
     *
     * Template:
     *
     * payment_confirmed_admin
     *
     * {{1}} Business name
     * {{2}} Contact person
     * {{3}} Booking reference
     * {{4}} Stall number
     * {{5}} Total
     * =======================================================
     */

    const adminWhatsApp =
      normalizeWhatsAppNumber(
        process.env
          .WHATSAPP_ADMIN_NUMBER
      );

    if (adminWhatsApp) {
      try {
        await sendWhatsAppTemplate({
          to:
            adminWhatsApp,

          templateName:
            "payment_confirmed_admin",

          languageCode:
            "en",

          components: [
            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text:
                    application.businessName,
                },

                {
                  type: "text",
                  text:
                    application.contactPerson,
                },

                {
                  type: "text",
                  text:
                    booking.bookingReference,
                },

                {
                  type: "text",
                  text:
                    String(
                      booking.slotNumber
                    ),
                },

                {
                  type: "text",
                  text:
                    String(
                      booking.total
                    ),
                },
              ],
            },
          ],
        });

        console.log(
          "Manual payment confirmation admin WhatsApp sent:",
          adminWhatsApp
        );
      } catch (whatsappError) {
        /*
         * WhatsApp failure must NOT affect
         * the confirmed booking.
         */

        console.error(
          "Manual payment admin WhatsApp error:",
          whatsappError
        );
      }
    } else {
      console.warn(
        "Manual payment admin WhatsApp skipped: WHATSAPP_ADMIN_NUMBER is not configured."
      );
    }

    /*
     * =======================================================
     * SUCCESS RESPONSE
     * =======================================================
     */

    return Response.json({
      success: true,

      message:
        "Booking confirmed and payment marked as paid.",

      booking: {
        id:
          booking._id,

        bookingReference:
          booking.bookingReference,

        status:
          booking.status,

        paymentStatus:
          booking.paymentStatus,

        total:
          booking.total,

        slotNumber:
          booking.slotNumber,

        invoiceNumber:
          booking.invoiceNumber,
      },
    });
  } catch (error) {
    console.error(
      "Manual booking confirmation error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to confirm booking.",
      },
      {
        status: 500,
      }
    );
  }
}