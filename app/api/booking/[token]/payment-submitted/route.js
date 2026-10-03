import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Booking from "@/models/Booking";

export async function PATCH(
  request,
  { params }
) {
  try {
    const { token } = await params;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Invalid booking link.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // Find the approved application using
    // the same booking token used by the payment page.
    const application =
      await Application.findOne({
        bookingToken: token,
        status: "approved",
      });

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid or expired booking link.",
        },
        {
          status: 404,
        }
      );
    }

    // Find the associated booking.
    const booking =
      await Booking.findOne({
        applicationId: application._id,
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

    // Don't allow a confirmed booking to
    // be moved backwards.
    if (booking.status === "paid") {
      return Response.json(
        {
          success: false,
          message:
            "This booking has already been confirmed.",
        },
        {
          status: 400,
        }
      );
    }

    // Mark that the customer has submitted
    // their payment notification.
    booking.status = "payment_submitted";

    await booking.save();

    return Response.json({
      success: true,
      message:
        "Payment submission recorded successfully.",
      booking: {
        bookingReference:
          booking.bookingReference,

        status:
          booking.status,
      },
    });
  } catch (error) {
    console.error(
      "Payment submission error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to submit payment status.",
      },
      {
        status: 500,
      }
    );
  }
}