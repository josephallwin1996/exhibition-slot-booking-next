import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Slot from "@/models/Slot";
import AddOn from "@/models/AddOn";
import Booking from "@/models/Booking";

function generateBookingReference() {
  const timestamp = Date.now()
    .toString()
    .slice(-8);

  const random = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();

  return `EXH-${timestamp}-${random}`;
}

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
    console.log("Confirm booking request body:", body);
    const reservationToken =
      body?.reservationToken;

    const requestedAddOns =
      Array.isArray(body?.addOns)
        ? body.addOns
        : [];

    if (!reservationToken) {
      return Response.json(
        {
          success: false,
          message:
            "Your stall reservation could not be found.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * 1. Verify approved application.
     */
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
     * 2. Find the slot using the reservation token.
     *
     * We don't trust slotId from the browser.
     */
    const slot =
      await Slot.findOne({
        reservationToken,
        bookingId: {
          $ne: null,
        },
      });

    if (!slot) {
      return Response.json(
        {
          success: false,
          message:
            "Your stall reservation could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * 3. Make sure this reservation
     * belongs to this application.
     */
    const booking =
      await Booking.findById(
        slot.bookingId
      );

    if (!booking) {
      return Response.json(
        {
          success: false,
          message:
            "Your booking reservation could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      String(booking.applicationId) !==
      String(application._id)
    ) {
      return Response.json(
        {
          success: false,
          message:
            "This reservation does not belong to you.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 4. Don't allow a booking to be
     * confirmed twice.
     */
    if (
      booking.status === "pending_payment" ||
      booking.status === "paid"
    ) {
      return Response.json({
        success: true,
        message:
          "This booking has already been confirmed.",
        booking: {
          bookingReference:
            booking.bookingReference,
          status: booking.status,
          total: booking.total,
        },
      });
    }

    /*
     * 5. Check reservation expiry.
     */
    if (
      !booking.reservationExpiresAt ||
      booking.reservationExpiresAt <=
        new Date()
    ) {
      await Slot.updateOne(
        {
          _id: slot._id,
          reservationToken,
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

      booking.status = "expired";
      booking.reservationExpiresAt =
        null;

      await booking.save();

      return Response.json(
        {
          success: false,
          message:
            "Your stall reservation has expired. Please select another stall.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * 6. Verify the slot still belongs
     * to the approved category.
     */
    if (
      slot.category !==
      application.category
    ) {
      return Response.json(
        {
          success: false,
          message:
            "This stall is not available for your approved category.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * 7. Build add-on IDs from the request.
     *
     * Only IDs and quantities are trusted
     * from the browser.
     */
    const cleanedAddOns =
      requestedAddOns
        .map((item) => ({
          addOnId: item?.addOnId,
          quantity: Number(
            item?.quantity
          ),
        }))
        .filter(
          (item) =>
            item.addOnId &&
            Number.isInteger(
              item.quantity
            ) &&
            item.quantity > 0
        );

    /*
     * 8. Remove duplicate add-on IDs.
     */
    const uniqueAddOnIds = [
      ...new Set(
        cleanedAddOns.map(
          (item) =>
            String(item.addOnId)
        )
      ),
    ];

    /*
     * 9. Fetch the official add-ons
     * from MongoDB.
     */
    const addOns =
      await AddOn.find({
        _id: {
          $in: uniqueAddOnIds,
        },

        status: "active",
      }).lean();

    if (
      addOns.length !==
      uniqueAddOnIds.length
    ) {
      return Response.json(
        {
          success: false,
          message:
            "One or more selected add-ons are no longer available.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * 10. Calculate the official
     * add-on totals.
     */
    const bookingAddOns = [];

    let addOnTotal = 0;

    for (const addOn of addOns) {
      const requested =
        cleanedAddOns.find(
          (item) =>
            String(
              item.addOnId
            ) ===
            String(addOn._id)
        );

      if (!requested) {
        continue;
      }

      if (
        requested.quantity >
        addOn.maxQuantity
      ) {
        return Response.json(
          {
            success: false,
            message: `${addOn.name} allows a maximum quantity of ${addOn.maxQuantity}.`,
          },
          {
            status: 400,
          }
        );
      }

      const total =
        Number(addOn.price) *
        requested.quantity;

      bookingAddOns.push({
        addOnId: addOn._id,
        name: addOn.name,
        price: Number(addOn.price),
        quantity:
          requested.quantity,
        total,
      });

      addOnTotal += total;
    }

    /*
     * 11. Calculate the final amount
     * entirely on the server.
     */
    const slotPrice =
      Number(slot.price);

    const subtotal =
      slotPrice + addOnTotal;

    const total = subtotal;

    /*
     * 12. Generate booking reference.
     */
    let bookingReference =
      generateBookingReference();

    let referenceExists =
      await Booking.exists({
        bookingReference,
      });

    while (referenceExists) {
      bookingReference =
        generateBookingReference();

      referenceExists =
        await Booking.exists({
          bookingReference,
        });
    }

    /*
     * 13. Update the reservation.
     */
    booking.slotPrice =
      slotPrice;

    booking.addOns =
      bookingAddOns;

    booking.addOnTotal =
      addOnTotal;

    booking.subtotal =
      subtotal;

    booking.total =
      total;

    booking.bookingReference =
      bookingReference;

    booking.status =
      "pending_payment";

    booking.paymentStatus =
      "pending";

    await booking.save();

    return Response.json({
      success: true,

      message:
        "Booking created successfully.",

      booking: {
        id: booking._id,
        bookingReference:
          booking.bookingReference,

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

        reservationExpiresAt:
          booking.reservationExpiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Confirm booking error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to create your booking.",
      },
      {
        status: 500,
      }
    );
  }
}