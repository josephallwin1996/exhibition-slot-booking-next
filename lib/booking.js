import Application from "@/models/Application";
import Slot from "@/models/Slot";

export async function getApprovedApplication(
  bookingToken
) {
  if (!bookingToken) {
    return null;
  }

  const application =
    await Application.findOne({
      bookingToken,
      status: "approved",
    }).lean();

  return application;
}

export async function getBookableSlot({
  bookingToken,
  slotId,
}) {
  if (!bookingToken || !slotId) {
    return null;
  }

  const application =
    await getApprovedApplication(
      bookingToken
    );

  if (!application) {
    return null;
  }

  const slot = await Slot.findOne({
    _id: slotId,

    // Critical:
    // slot must belong to the exhibitor's
    // approved category.
    category: application.category,

    // Only available slots can be selected.
    status: "available",
  }).lean();

  return {
    application,
    slot,
  };
}