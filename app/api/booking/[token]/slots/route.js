import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Slot from "@/models/Slot";

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

    const approvedCategory = application.category;

    const slots = await Slot.find({
      category: approvedCategory,
    })
      .select(
        "slotNumber category price status position row column notes"
      )
      .sort({
        position: 1,
        slotNumber: 1,
      })
      .lean();

    return Response.json({
      success: true,

      exhibitor: {
        businessName: application.businessName,
        contactPerson: application.contactPerson,
        category: approvedCategory,
      },

      slots,
    });
  } catch (error) {
    console.error(
      "Category slot availability error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load category slots.",
      },
      {
        status: 500,
      }
    );
  }
}