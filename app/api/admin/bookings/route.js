import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Application from "@/models/Application";
import Category from "@/models/Category";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const paymentStatus =
      searchParams.get(
        "paymentStatus"
      );

    const search =
      searchParams.get("search");

    const query = {};

    if (
      status &&
      status !== "all"
    ) {
      query.status = status;
    }

    if (
      paymentStatus &&
      paymentStatus !== "all"
    ) {
      query.paymentStatus =
        paymentStatus;
    }

    if (search) {
        const matchingApplications =
            await Application.find({
            $or: [
                {
                businessName: {
                    $regex: search,
                    $options: "i",
                },
                },
                {
                contactPerson: {
                    $regex: search,
                    $options: "i",
                },
                },
                {
                email: {
                    $regex: search,
                    $options: "i",
                },
                },
            ],
            })
            .select("_id")
            .lean();

        const applicationIds =
            matchingApplications.map(
            (item) => item._id
            );

        query.$or = [
            {
            bookingReference: {
                $regex: search,
                $options: "i",
            },
            },
            {
            applicationId: {
                $in: applicationIds,
            },
            },
        ];
        }

    const bookings =
      await Booking.find(query)
        .sort({
          createdAt: -1,
        })
        .lean();

    const applicationIds =
      bookings.map(
        (booking) =>
          booking.applicationId
      );

    const applications =
      await Application.find({
        _id: {
          $in: applicationIds,
        },
      })
      .populate("categoryId", "name")
      .lean();

    const applicationMap =
      new Map(
        applications.map(
          (application) => [
            String(application._id),
            application,
          ]
        )
      );
    
    const result =
      bookings.map((booking) => {
        const application =
          applicationMap.get(
            String(
              booking.applicationId
            )
          );

        return {
          ...booking,

          businessName:
            application?.businessName ||
            "—",

          contactPerson:
            application?.contactPerson ||
            "—",

          email:
            application?.email ||
            "—",

          mobileNumber:
            application?.mobileNumber ||
            "—",

          category:
            application?.categoryId.name ||
            booking.category,
        };
      });

    return Response.json({
      success: true,
      bookings: result,
    });
  } catch (error) {
    console.error(
      "Admin bookings error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load bookings.",
      },
      {
        status: 500,
      }
    );
  }
}