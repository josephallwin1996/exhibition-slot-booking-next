"use client";

export default function SlotCard({
  slot,
  selected,
  selectable,
  belongsToCategory,
  onSelect,
}) {
  const status =
    slot.status || "unavailable";

  const categoryName =
    typeof slot.category === "object" &&
    slot.category !== null
      ? slot.category.name
      : slot.categoryName ||
        slot.category ||
        "Unassigned";

  let cardClass =
    "border-slate-200 bg-slate-100 text-slate-400";

  if (selected) {
    cardClass =
      "border-amber-500 bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-300";
  } else if (
    selectable &&
    status === "available"
  ) {
    cardClass =
      "border-green-300 bg-green-50 text-green-800 hover:-translate-y-0.5 hover:border-green-500 hover:shadow-md";
  } else if (status === "booked") {
    cardClass =
      "border-blue-200 bg-blue-50 text-blue-500";
  } else if (status === "unavailable") {
    cardClass =
      "border-slate-200 bg-slate-100 text-slate-400";
  } else if (!belongsToCategory) {
    cardClass =
      "border-slate-200 bg-slate-100 text-slate-400";
  }

  function handleClick() {
    if (!selectable) {
      return;
    }
    console.log("Slot clicked:", slot);
    onSelect(slot);
  }

  const statusLabel = selected
    ? "Selected"
    : status === "booked"
    ? "Booked"
    : status === "unavailable"
    ? "Unavailable"
    : belongsToCategory
    ? "Available"
    : "Other category";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!selectable}
      className={`group relative flex h-[82px] w-[72px] flex-col items-center justify-center rounded-xl border px-1.5 text-center transition ${cardClass} ${
        selectable
          ? "cursor-pointer"
          : "cursor-not-allowed"
      }`}
    >
      {/* Status indicator */}

      <span
        className={`absolute right-2 top-2 h-2 w-2 rounded-full ${
          selected
            ? "bg-slate-950"
            : selectable
            ? "bg-green-500"
            : status === "booked"
            ? "bg-blue-500"
            : "bg-slate-400"
        }`}
      />

      {/* Stall number */}

      <span className="text-sm font-bold sm:text-base">
        {String(
          slot.slotNumber
        ).padStart(2, "0")}
      </span>

      {/* Category */}

      <span className="mt-1 max-w-[64px] truncate text-[8px] font-semibold uppercase tracking-wide opacity-70 sm:text-[9px]">
        {categoryName}
      </span>

      {/* Price */}

      {/* <span className="mt-1 text-[8px] opacity-60 sm:text-[9px]">
        ₹
        {Number(
          slot.price || 0
        ).toLocaleString("en-IN")}
      </span> */}

      {/* Size */}

      <span className="mt-1 text-[8px] opacity-60 sm:text-[9px]">
        SIZE : 6 X 6 ft
      </span>

      {/* Status */}

      <span className="absolute bottom-1 left-0 right-0 truncate px-1 text-[7px] font-medium uppercase tracking-wide opacity-60">
        {statusLabel}
      </span>
    </button>
  );
}