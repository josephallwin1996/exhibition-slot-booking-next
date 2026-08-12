import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import AddOn from "@/models/AddOn";

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
          message: "Invalid or expired booking link.",
        },
        {
          status: 404,
        }
      );
    }

    const addOns = await AddOn.find({
      status: "active",
    })
      .select(
        "name description price category maxQuantity position"
      )
      .sort({
        position: 1,
      })
      .lean();

    return Response.json({
      success: true,
      addOns,
    });
  } catch (error) {
    console.error("Booking add-ons error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load add-ons.",
      },
      {
        status: 500,
      }
    );
  }
}