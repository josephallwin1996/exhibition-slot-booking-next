import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import razorpay from "@/lib/razorpay";

export async function POST(request) {
  try {
    const body = await request.json();

    const bookingReference =
      body?.bookingReference;

    if (!bookingReference) {
      return Response.json(
        {
          success: false,
          message:
            "Booking reference is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * Find the booking using the reference.
     */
    const booking =
      await Booking.findOne({
        bookingReference,
      });
    console.log("Found booking:", booking);
      
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
     * Only pending-payment bookings
     * can create a payment order.
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
     * Don't create another Razorpay order
     * if one already exists.
     */
    if (booking.razorpayOrderId) {
      return Response.json({
        success: true,

        message:
          "Payment order already exists.",

        order: {
          id: booking.razorpayOrderId,

          amount:
            Math.round(
              Number(booking.total) * 100
            ),

          currency: "INR",

          bookingReference:
            booking.bookingReference,
        },
      });
    }

    /*
     * IMPORTANT:
     *
     * The amount comes from MongoDB.
     *
     * We do NOT accept amount from
     * the browser.
     */
    const amountInPaise =
      Math.round(
        Number(booking.total) * 100
      );

    if (
      !Number.isFinite(
        amountInPaise
      ) ||
      amountInPaise <= 0
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid booking amount.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Create Razorpay order.
     */
    const order =
      await razorpay.orders.create({
        amount: amountInPaise,

        currency: "INR",

        receipt:
          booking.bookingReference,

        notes: {
          bookingReference:
            booking.bookingReference,

          bookingId:
            String(booking._id),
        },
      });

    /*
     * Store Razorpay order ID.
     */
    booking.razorpayOrderId =
      order.id;

    await booking.save();

    return Response.json({
      success: true,

      message:
        "Payment order created.",

      order: {
        id: order.id,

        amount:
          order.amount,

        currency:
          order.currency,

        bookingReference:
          booking.bookingReference,
      },

      keyId:
        process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to create payment order.",
      },
      {
        status: 500,
      }
    );
  }
}