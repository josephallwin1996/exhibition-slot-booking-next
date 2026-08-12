"use client";

export default function SlotCard({
  slot,
  selected,
  onSelect,
}) {
  const isAvailable = slot.status === "available";
  const isBooked = slot.status === "booked";
  const isUnavailable = slot.status === "unavailable";

  let classes =
    "relative flex aspect-square min-h-[70px] items-center justify-center rounded-xl border-2 p-2 text-center transition";

  if (selected) {
    classes +=
      " border-amber-500 bg-amber-400 text-slate-950 shadow-lg scale-[1.03]";
  } else if (isAvailable) {
    classes +=
      " cursor-pointer border-green-300 bg-green-50 text-green-800 hover:border-green-500 hover:bg-green-100";
  } else if (isBooked) {
    classes +=
      " cursor-not-allowed border-blue-200 bg-blue-50 text-blue-500";
  } else {
    classes +=
      " cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400";
  }

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => onSelect(slot)}
      className={classes}
      title={
        isAvailable
          ? `Select Slot ${slot.slotNumber}`
          : `Slot ${slot.slotNumber} is ${slot.status}`
      }
    >
      <div>
        <div className="text-base font-extrabold">
          {slot.slotNumber}
        </div>

        {selected ? (
          <div className="mt-1 text-[10px] font-bold uppercase">
            Selected
          </div>
        ) : isBooked ? (
          <div className="mt-1 text-[10px] font-bold uppercase">
            Booked
          </div>
        ) : isUnavailable ? (
          <div className="mt-1 text-[10px] font-bold uppercase">
            Closed
          </div>
        ) : (
          <div className="mt-1 text-[10px] font-semibold">
            ₹{Number(slot.price).toLocaleString("en-IN")}
          </div>
        )}
      </div>
    </button>
  );
}