import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import razorpay from "@/lib/razorpay";

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

function verifyPaymentSignature(
  orderId,
  paymentId,
  receivedSignature,
  secret
) {
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8"
  );

  const receivedBuffer = Buffer.from(
    receivedSignature || "",
    "utf8"
  );

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      bookingReference,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    if (
      !bookingReference ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
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
     * Find our booking.
     */
    const booking =
      await Booking.findOne({
        bookingReference,
      });

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
     * Idempotency:
     *
     * If payment has already been verified,
     * don't process it again.
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
     * Booking must be waiting for payment.
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
     * We must already have created a
     * Razorpay order for this booking.
     */
    if (!booking.razorpayOrderId) {
      return Response.json(
        {
          success: false,
          message:
            "No Razorpay order is associated with this booking.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Verify that the order returned by the
     * browser belongs to OUR booking.
     */
    if (
      booking.razorpayOrderId !==
      razorpayOrderId
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

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error(
        "RAZORPAY_KEY_SECRET is missing."
      );

      return Response.json(
        {
          success: false,
          message:
            "Payment configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * STEP 1
     *
     * Verify Razorpay signature.
     */
    const signatureValid =
      verifyPaymentSignature(
        booking.razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        secret
      );

    if (!signatureValid) {
      console.warn(
        "Invalid Razorpay signature:",
        bookingReference
      );

      return Response.json(
        {
          success: false,
          message:
            "Payment verification failed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * STEP 2
     *
     * Fetch the actual payment from Razorpay.
     *
     * This uses the server-side Razorpay
     * credentials.
     */
    const payment =
      await razorpay.payments.fetch(
        razorpayPaymentId
      );

    if (!payment) {
      return Response.json(
        {
          success: false,
          message:
            "Payment could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * STEP 3
     *
     * Verify payment ID.
     */
    if (
      payment.id !==
      razorpayPaymentId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment ID mismatch.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * STEP 4
     *
     * Verify order ID.
     */
    if (
      payment.order_id !==
      booking.razorpayOrderId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment belongs to a different order.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * STEP 5
     *
     * Verify amount.
     *
     * Razorpay uses paise for INR.
     */
    const expectedAmount =
      Math.round(
        Number(booking.total) * 100
      );

    if (
      Number(payment.amount) !==
      expectedAmount
    ) {
      console.error(
        "Payment amount mismatch:",
        {
          bookingReference,
          expectedAmount,
          receivedAmount:
            payment.amount,
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
     * STEP 6
     *
     * Verify currency.
     */
    if (
      payment.currency !==
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
     * STEP 7
     *
     * Most important:
     *
     * Payment must actually be captured.
     */
    if (
      payment.status !==
      "captured"
    ) {
      return Response.json(
        {
          success: false,
          message:
            `Payment is not captured. Current status: ${payment.status}`,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * STEP 8
     *
     * Make sure Razorpay says the payment
     * was captured.
     */
    if (
      payment.captured !== true
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment has not been captured.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * EVERYTHING has passed.
     *
     * Now and only now do we mark
     * the booking as paid.
     */

    booking.paidAt = new Date();

    booking.razorpayPaymentId =
      razorpayPaymentId;

    booking.razorpaySignature =
      razorpaySignature;

    booking.paymentId =
      razorpayPaymentId;

    booking.paymentStatus =
      "paid";

    booking.status =
      "paid";

    await booking.save();

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
   * Generate invoice number if this is
   * the first successful payment processing.
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
   * Generate PDF.
   */
  const invoicePdf =
    await generateInvoicePdf({
      booking,
      application,
    });

  /*
   * Send payment email to exhibitor.
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
        booking.razorpayPaymentId,

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
   * Notify admin.
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
        booking.razorpayPaymentId,
    });
  } catch (emailError) {
    console.error(
      "Admin payment email failed:",
      emailError
    );
  }
}

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
      "Payment verification error:",
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