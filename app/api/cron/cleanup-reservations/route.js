import connectDB from "@/lib/mongodb";
import Slot from "@/models/Slot";

export async function GET(request) {
  try {
    const authHeader =
      request.headers.get("authorization");

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const now = new Date();

    const result = await Slot.updateMany(
      {
        status: "reserved",
        reservationExpiresAt: {
          $ne: null,
          $lt: now,
        },
      },
      {
        $set: {
          status: "available",
          reservationToken: null,
          reservationExpiresAt: null,
          bookingId: null,
        },
      }
    );

    console.log(
      `Expired reservations cleared: ${result.modifiedCount}`
    );

    return Response.json({
      success: true,
      cleared: result.modifiedCount,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error(
      "Cron reservation cleanup error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to cleanup expired reservations.",
      },
      {
        status: 500,
      }
    );
  }
}