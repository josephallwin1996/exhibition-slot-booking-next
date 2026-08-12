import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Booking from "@/models/Booking";

export async function GET(
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

    const application =
      await Application.findOne({
        bookingToken: token,
        status: "approved",
      }).lean();

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

    const booking =
    await Booking.findOne({
        applicationId:
        application._id,

        status: {
        $in: [
            "pending_payment",
            "paid",
        ],
        },
    }).lean();

    if (!booking) {
      return Response.json(
        {
          success: false,
          message:
            "No payment-ready booking was found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,

      booking: {
        bookingReference:
          booking.bookingReference,

        businessName:
          application.businessName,

        contactPerson:
          application.contactPerson,

        email:
          application.email,

        mobileNumber:
          application.mobileNumber,

        category:
          booking.category,

        slotNumber:
          booking.slotNumber,

        slotPrice:
          booking.slotPrice,

        addOns:
          booking.addOns,

        addOnTotal:
          booking.addOnTotal,

        subtotal:
          booking.subtotal,

        total:
          booking.total,

        status:
          booking.status,

        paymentStatus:
          booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error(
      "Payment booking error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load booking.",
      },
      {
        status: 500,
      }
    );
  }
}