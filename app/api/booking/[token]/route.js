import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Booking from "@/models/Booking";
import Category from "@/models/Category";

export async function GET(request, { params }) {
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

    const application = await Application.findOne({
      bookingToken: token,
      status: "approved",
    })
    .populate("categoryId", "name")
    .lean();

    const booking = await Booking.findOne({
      applicationId: application._id
    }).lean()

  

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "This booking link is invalid or the application has not been approved.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      application: {
        id: application._id,
        businessName: application.businessName,
        contactPerson: application.contactPerson,
        email: application.email,
        mobile: application.mobile,
        category: application.categoryName,
        categoryId: application.categoryId,
        status: application.status,
      },
      bookingstatus : booking?.status || "pending",
      booking: booking || {}
    });
  } catch (error) {
    console.error("Booking validation error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to validate booking link.",
      },
      {
        status: 500,
      }
    );
  }
}