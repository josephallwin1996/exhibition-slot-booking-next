import connectDB from "@/lib/mongodb";

import Booking from "@/models/Booking";
import Slot from "@/models/Slot";
import Application from "@/models/Application";

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
 * CASHFREE CONFIGURATION
 * =========================================================
 */

const CASHFREE_API_VERSION = "2025-01-01";

function getCashfreeBaseUrl() {
  const environment =
    process.env.CASHFREE_ENVIRONMENT ||
    "sandbox";

  if (environment === "production") {
    return "https://api.cashfree.com/pg";
  }

  return "https://sandbox.cashfree.com/pg";
}

/*
 * =========================================================
 * NORMALIZE WHATSAPP NUMBER
 * =========================================================
 */

function normalizeWhatsAppNumber(
  mobile
) {
  if (!mobile) {
    return null;
  }

  let number =
    String(mobile).trim();

  number = number.replace(
    /[^\d]/g,
    ""
  );

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
 * GET CASHFREE ORDER
 * =========================================================
 */

async function getCashfreeOrder(
  orderId
) {
  const clientId =
    process.env.CASHFREE_CLIENT_ID;

  const clientSecret =
    process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Cashfree credentials are not configured."
    );
  }

  const response = await fetch(
    `${getCashfreeBaseUrl()}/orders/${encodeURIComponent(
      orderId
    )}`,
    {
      method: "GET",

      headers: {
        "x-api-version":
          CASHFREE_API_VERSION,

        "x-client-id":
          clientId,

        "x-client-secret":
          clientSecret,

        "Content-Type":
          "application/json",
      },

      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "Cashfree order verification failed:",
      data
    );

    throw new Error(
      data?.message ||
        "Unable to verify Cashfree payment."
    );
  }

  return data;
}

/*
 * =========================================================
 * PAYMENT VERIFICATION
 * =========================================================
 */

export async function POST(request) {
  try {
    const body =
      await request.json();

    const {
      bookingReference,
      cashfreeOrderId,
    } = body;

    /*
     * -------------------------------------------------------
     * Validate request
     * -------------------------------------------------------
     */

    if (
      !bookingReference ||
      !cashfreeOrderId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment verification details are incomplete.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * -------------------------------------------------------
     * Find booking
     * -------------------------------------------------------
     */

    const booking =
      await Booking.findOne({
        bookingReference,
      });

    if (!booking) {
      return Response.json(
        {
          success: false,
          message:
            "Booking not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Idempotency
     * -------------------------------------------------------
     */

    if (
      booking.status === "paid" &&
      booking.paymentStatus === "paid"
    ) {
      return Response.json({
        success: true,

        alreadyPaid: true,

        message:
          "This booking has already been paid.",

        booking: {
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
        },
      });
    }

    /*
     * -------------------------------------------------------
     * Booking must be awaiting payment
     * -------------------------------------------------------
     */

    if (
      booking.status !==
      "pending_payment"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "This booking is not available for payment.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Verify Cashfree order exists
     * -------------------------------------------------------
     */

    if (!booking.cashfreeOrderId) {
      return Response.json(
        {
          success: false,
          message:
            "No Cashfree order is associated with this booking.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Verify order belongs to booking
     * -------------------------------------------------------
     */

    if (
      booking.cashfreeOrderId !==
      cashfreeOrderId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment order does not match this booking.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * STEP 1
     *
     * Ask Cashfree directly for the actual
     * server-side order status.
     * -------------------------------------------------------
     */

    const cashfreeOrder =
      await getCashfreeOrder(
        booking.cashfreeOrderId
      );

    /*
     * -------------------------------------------------------
     * STEP 2
     * Verify order ID
     * -------------------------------------------------------
     */

    if (
      cashfreeOrder.order_id !==
      booking.cashfreeOrderId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment order ID mismatch.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * STEP 3
     * Verify amount
     * -------------------------------------------------------
     */

    const expectedAmount =
      Number(
        Number(booking.total).toFixed(2)
      );

    const receivedAmount =
      Number(
        cashfreeOrder.order_amount
      );

    if (
      !Number.isFinite(
        receivedAmount
      ) ||
      receivedAmount !==
        expectedAmount
    ) {
      console.error(
        "Cashfree payment amount mismatch:",
        {
          bookingReference,
          expectedAmount,
          receivedAmount,
        }
      );

      return Response.json(
        {
          success: false,
          message:
            "Payment amount does not match the booking amount.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * STEP 4
     * Verify currency
     * -------------------------------------------------------
     */

    if (
      cashfreeOrder.order_currency !==
      "INR"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid payment currency.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * STEP 5
     *
     * Cashfree order is considered successfully
     * paid only when order_status === "PAID".
     * -------------------------------------------------------
     */

    if (
      cashfreeOrder.order_status !==
      "PAID"
    ) {
      return Response.json(
        {
          success: false,
          message:
            `Payment is not completed. Current status: ${cashfreeOrder.order_status}`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =======================================================
     * PAYMENT VERIFIED
     * =======================================================
     *
     * Only now do we mark the booking as paid.
     */

    booking.paidAt =
      new Date();

    /*
     * Cashfree order ID
     */
    booking.cashfreeOrderId =
      cashfreeOrder.order_id;

    /*
     * We don't have a Razorpay-style
     * signature here.
     *
     * Payment ID will be stored below
     * when available from Cashfree.
     */

    booking.paymentStatus =
      "paid";

    booking.status =
      "paid";

    /*
     * -------------------------------------------------------
     * Get latest Cashfree payment ID
     * -------------------------------------------------------
     *
     * Cashfree can have multiple payment
     * attempts against one order.
     *
     * We retrieve the payments for this order
     * and find the successful payment.
     * -------------------------------------------------------
     */

    let successfulPayment = null;

    try {
      const clientId =
        process.env.CASHFREE_CLIENT_ID;

      const clientSecret =
        process.env.CASHFREE_CLIENT_SECRET;

      const paymentsResponse =
        await fetch(
          `${getCashfreeBaseUrl()}/orders/${encodeURIComponent(
            booking.cashfreeOrderId
          )}/payments`,
          {
            method: "GET",

            headers: {
              "x-api-version":
                CASHFREE_API_VERSION,

              "x-client-id":
                clientId,

              "x-client-secret":
                clientSecret,

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

      const paymentsData =
        await paymentsResponse.json();

      if (paymentsResponse.ok) {
        successfulPayment =
          Array.isArray(
            paymentsData
          )
            ? paymentsData.find(
                (payment) =>
                  payment.payment_status ===
                  "SUCCESS"
              )
            : null;
      }
    } catch (paymentLookupError) {
      console.error(
        "Cashfree payment lookup error:",
        paymentLookupError
      );
    }

    /*
     * Store Cashfree payment ID
     * when available.
     */
    if (successfulPayment) {
      booking.cashfreePaymentId =
        successfulPayment.cf_payment_id ||
        successfulPayment.payment_id ||
        null;

      booking.paymentId =
        booking.cashfreePaymentId;
    } else {
      /*
       * The order itself is PAID, so the
       * booking is still safely confirmed.
       */
      booking.paymentId =
        booking.cashfreeOrderId;
    }

    await booking.save();

    /*
     * -------------------------------------------------------
     * Mark slot as booked
     * -------------------------------------------------------
     */

    await Slot.findByIdAndUpdate(
      booking.slotId,
      {
        $set: {
          status: "booked",

          bookingId:
            booking._id,
        },
      },
      {
        new: true,
      }
    );

    /*
     * =======================================================
     * LOAD APPLICATION
     * =======================================================
     */

    const application =
      await Application.findById(
        booking.applicationId
      ).lean();

    if (!application) {
      console.error(
        "Application not found for paid booking:",
        booking.bookingReference
      );
    } else {
      /*
       * =====================================================
       * INVOICE
       * =====================================================
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
       * -----------------------------------------------------
       * Generate invoice PDF
       * -----------------------------------------------------
       */

      const invoicePdf =
        await generateInvoicePdf({
          booking,
          application,
        });

      /*
       * =====================================================
       * PAYMENT SUCCESS EMAIL — APPLICANT
       * =====================================================
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

          paymentId:
            booking.paymentId,

          paidAt:
            booking.paidAt,

          invoiceNumber:
            booking.invoiceNumber,

          invoicePdf,
        });
      } catch (emailError) {
        console.error(
          "Payment email failed:",
          emailError
        );
      }

      /*
       * =====================================================
       * PAYMENT SUCCESS EMAIL — ADMIN
       * =====================================================
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
            booking.paymentId,
        });
      } catch (emailError) {
        console.error(
          "Admin payment email failed:",
          emailError
        );
      }

      /*
       * =====================================================
       * WHATSAPP — APPLICANT
       * =====================================================
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
            "Booking confirmation WhatsApp sent:",
            applicantWhatsApp
          );
        } catch (whatsappError) {
          /*
           * WhatsApp failure must NOT
           * affect successful payment.
           */

          console.error(
            "Booking confirmation WhatsApp error:",
            whatsappError
          );
        }
      } else {
        console.warn(
          "Booking confirmation WhatsApp skipped: invalid applicant mobile number."
        );
      }

      /*
       * =====================================================
       * WHATSAPP — ADMIN
       * =====================================================
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
            "Payment confirmation admin WhatsApp sent:",
            adminWhatsApp
          );
        } catch (whatsappError) {
          /*
           * WhatsApp failure must NOT
           * affect successful payment.
           */

          console.error(
            "Admin payment WhatsApp error:",
            whatsappError
          );
        }
      } else {
        console.warn(
          "Admin payment WhatsApp skipped: WHATSAPP_ADMIN_NUMBER is not configured."
        );
      }
    }

    /*
     * =======================================================
     * SUCCESS RESPONSE
     * =======================================================
     */

    return Response.json({
      success: true,

      message:
        "Payment verified and booking confirmed.",

      booking: {
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
      },
    });
  } catch (error) {
    console.error(
      "Cashfree payment verification error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to verify payment.",
      },
      {
        status: 500,
      }
    );
  }
}