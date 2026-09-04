import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Application from "@/models/Application";

const CASHFREE_API_VERSION = "2025-01-01";

function getCashfreeBaseUrl() {
  const environment = process.env.CASHFREE_ENVIRONMENT || "sandbox";

  if (environment === "production") {
    return "https://api.cashfree.com/pg";
  }

  return "https://sandbox.cashfree.com/pg";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const bookingReference = body?.bookingReference;

    if (!bookingReference) {
      return Response.json(
        {
          success: false,
          message: "Booking reference is required.",
        },
        { status: 400 }
      );
    }

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        {
          success: false,
          message: "Cashfree credentials are not configured.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      bookingReference,
    });

    if (!booking) {
      return Response.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (booking.status !== "pending_payment") {
      return Response.json(
        {
          success: false,
          message: "This booking is not available for payment.",
        },
        { status: 409 }
      );
    }

    const application = await Application.findById(
      booking.applicationId
    )
      .select("bookingToken")
      .lean();

    if (!application?.bookingToken) {
      return Response.json(
        {
          success: false,
          message: "Booking token not found.",
        },
        { status: 409 }
      );
    }

    /*
     * If an order was already created, reuse it.
     */
    if (booking.cashfreeOrderId) {
      const origin = new URL(request.url).origin;

      const returnUrl =
        `${origin}/book/${application.bookingToken}/payment/success` +
        `?bookingReference=${encodeURIComponent(
          booking.bookingReference
        )}` +
        `&cashfreeOrderId=${encodeURIComponent(
          booking.cashfreeOrderId
        )}`;

      return Response.json({
        success: true,
        message: "Payment order already exists.",
        order: {
          id: booking.cashfreeOrderId,
          paymentSessionId: booking.cashfreePaymentSessionId || null,
          amount: Number(booking.total),
          currency: "INR",
          bookingReference: booking.bookingReference,
          returnUrl,
        },
      });
    }

    const amount = Number(booking.total);

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid booking amount.",
        },
        { status: 400 }
      );
    }

    /*
     * We use the booking reference as the Cashfree order ID.
     */
    const orderId = booking.bookingReference;

    const origin = new URL(request.url).origin;

    const returnUrl =
      `${origin}/book/${application.bookingToken}/payment/success` +
      `?bookingReference=${encodeURIComponent(
        booking.bookingReference
      )}` +
      `&cashfreeOrderId=${encodeURIComponent(orderId)}`;

    const cashfreeResponse = await fetch(
      `${getCashfreeBaseUrl()}/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": CASHFREE_API_VERSION,
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
          "x-idempotency-key": `${booking._id}-${Date.now()}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: Number(amount.toFixed(2)),
          order_currency: "INR",

          customer_details: {
            customer_id: String(booking._id),
            customer_phone: '4585788578',
          },

          order_meta: {
            return_url: returnUrl,
          },

          order_note: `Exhibition Stall Booking - ${booking.bookingReference}`,
        }),
      }
    );

    const data = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error("Cashfree create order error:", data);

      return Response.json(
        {
          success: false,
          message:
            data?.message ||
            "Unable to create Cashfree payment order.",
        },
        { status: 500 }
      );
    }

    booking.cashfreeOrderId = data.order_id;

    /*
     * Make sure Booking schema has this field.
     */
    booking.cashfreePaymentSessionId = data.payment_session_id;

    await booking.save();

    return Response.json({
      success: true,
      message: "Payment order created.",
      order: {
        id: data.order_id,
        paymentSessionId: data.payment_session_id,
        amount: data.order_amount,
        currency: data.order_currency,
        bookingReference: booking.bookingReference,
        returnUrl,
      },
    });
  } catch (error) {
    console.error("Create Cashfree order error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}