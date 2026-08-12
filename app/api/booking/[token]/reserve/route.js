import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Slot from "@/models/Slot";
import Booking from "@/models/Booking";

const RESERVATION_MINUTES = 10;

export async function POST(
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

    const body = await request.json();

    const slotId = body?.slotId;

    if (!slotId) {
      return Response.json(
        {
          success: false,
          message: "Please select a stall.",
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

    /*
     * Clean expired reservation first.
     */
    await Slot.updateOne(
      {
        _id: slotId,

        reservationExpiresAt: {
          $lte: new Date(),
        },
      },
      {
        $set: {
          reservationToken: null,
          reservationExpiresAt: null,
        },
      }
    );

    const reservationToken =
      crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
      Date.now() +
        RESERVATION_MINUTES *
          60 *
          1000
    );

    /*
     * Atomic reservation.
     *
     * This is the important part.
     *
     * Only an available slot belonging to
     * the exhibitor's approved category can
     * be reserved.
     */

    console.log("reservationToken:", reservationToken);
    console.log("expiresAt:", expiresAt);
    console.log("slotId:", slotId);
    console.log("category:", application.category);

    const existingSlot = await Slot.findById(slotId).lean();

    console.log("Existing slot:", existingSlot);

   const slot =
  await Slot.findOneAndUpdate(
    {
      _id: slotId,
      category: application.category,
      status: "available",

      $or: [
        {
          reservationToken: null,
        },
        {
          reservationExpiresAt: {
            $lte: new Date(),
          },
        },
      ],
    },

    {
      $set: {
        status: "reserved",
        reservationToken,
        reservationExpiresAt: expiresAt,
      },
    },

    {
      new: true,
      runValidators: true,
    }
  );

    console.log("Reserved slot:", slot);

    if (!slot) {
      return Response.json(
        {
          success: false,
          message:
            "This stall is no longer available. Please select another stall.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Create a temporary booking.
     */
    const booking =
      await Booking.create({
        applicationId:
          application._id,

        slotId: slot._id,

        slotNumber:
          slot.slotNumber,

        category:
          slot.category,

        slotPrice:
          slot.price,

        addOns: [],

        addOnTotal: 0,

        subtotal:
          slot.price,

        total:
          slot.price,

        status: "reserved",

        paymentStatus:
          "pending",

        reservationExpiresAt:
          expiresAt,
      });

    /*
     * Store the booking reference on the slot.
     */
    await Slot.updateOne(
      {
        _id: slot._id,
        reservationToken,
      },
      {
        $set: {
          bookingId: booking._id,
        },
      }
    );

    return Response.json({
      success: true,

      message:
        "Stall reserved successfully.",

      reservation: {
        token: reservationToken,

        bookingId:
          booking._id,

        slotId:
          slot._id,

        slotNumber:
          slot.slotNumber,

        price:
          slot.price,

        expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Reserve slot error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to reserve the selected stall.",
      },
      {
        status: 500,
      }
    );
  }
}