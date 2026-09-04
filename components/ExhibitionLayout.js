"use client";

/*
 * Physical hall layout
 *
 * IMPORTANT:
 * The coordinates below are intentionally preserved
 * from the original hall drawing.
 *
 * The database controls:
 * - slot number
 * - price
 * - category
 * - availability
 * - booking status
 *
 * This layout controls ONLY where each stall appears
 * physically inside the hall.
 */

const STALL_LAYOUT = {
  // -------------------------------------------------
  // BOTTOM ROW
  // 5 4 3 2 1       GAP       7 8 9 10 11
  // -------------------------------------------------

  5: { x: 18.5, y: 80.0, w: 5.0, h: 8.0 },
  4: { x: 23.5, y: 80.0, w: 5.0, h: 8.0 },
  3: { x: 28.5, y: 80.0, w: 5.0, h: 8.0 },
  2: { x: 33.5, y: 80.0, w: 5.0, h: 8.0 },
  1: { x: 38.5, y: 80.0, w: 5.0, h: 8.0 },

  7: { x: 53.5, y: 80.0, w: 5.0, h: 8.0 },
  8: { x: 58.5, y: 80.0, w: 5.0, h: 8.0 },
  9: { x: 63.5, y: 80.0, w: 5.0, h: 8.0 },
  10: { x: 68.5, y: 80.0, w: 5.0, h: 8.0 },
  11: { x: 73.5, y: 80.0, w: 5.0, h: 8.0 },

  // -------------------------------------------------
  // LOWER CENTRAL ROW
  // 12 13 14 15 16 17 18 19 20 21
  // -------------------------------------------------

  12: { x: 18.5, y: 65.8, w: 5.0, h: 8.0 },
  13: { x: 23.5, y: 65.8, w: 5.0, h: 8.0 },
  14: { x: 28.5, y: 65.8, w: 5.0, h: 8.0 },
  15: { x: 33.5, y: 65.8, w: 5.0, h: 8.0 },
  16: { x: 38.5, y: 65.8, w: 5.0, h: 8.0 },
  17: { x: 43.5, y: 65.8, w: 5.0, h: 8.0 },
  18: { x: 48.5, y: 65.8, w: 5.0, h: 8.0 },
  19: { x: 53.5, y: 65.8, w: 5.0, h: 8.0 },
  20: { x: 58.5, y: 65.8, w: 5.0, h: 8.0 },
  21: { x: 63.5, y: 65.8, w: 5.0, h: 8.0 },

  // -------------------------------------------------
  // LOWER-LEFT STANDALONE
  // -------------------------------------------------

  6: {
    x: 9.0,
    y: 65.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  // -------------------------------------------------
  // LOWER-RIGHT STANDALONE
  // -------------------------------------------------

  22: {
    x: 75.0,
    y: 65.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  // -------------------------------------------------
  // CENTRAL UPPER ROW
  // 32 31 30 29 28 27 26 25 24 23
  // -------------------------------------------------

  32: { x: 19.0, y: 49.0, w: 5.0, h: 8.0 },
  31: { x: 24.0, y: 49.0, w: 5.0, h: 8.0 },
  30: { x: 29.0, y: 49.0, w: 5.0, h: 8.0 },
  29: { x: 34.0, y: 49.0, w: 5.0, h: 8.0 },
  28: { x: 39.0, y: 49.0, w: 5.0, h: 8.0 },
  27: { x: 44.0, y: 49.0, w: 5.0, h: 8.0 },
  26: { x: 49.0, y: 49.0, w: 5.0, h: 8.0 },
  25: { x: 54.0, y: 49.0, w: 5.0, h: 8.0 },
  24: { x: 59.0, y: 49.0, w: 5.0, h: 8.0 },
  23: { x: 64.0, y: 49.0, w: 5.0, h: 8.0 },

  // -------------------------------------------------
  // LEFT WALL
  // -------------------------------------------------

  36: {
    x: 4.0,
    y: 18.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  35: {
    x: 4.0,
    y: 27.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  34: {
    x: 4.0,
    y: 36.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  33: {
    x: 4.0,
    y: 45.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  // -------------------------------------------------
  // UPPER CENTRAL ROW
  // 48 47 46 45 44 43 42 41 40 39 38 37
  // -------------------------------------------------

  48: { x: 15.0, y: 28.0, w: 5.0, h: 8.0 },
  47: { x: 20.0, y: 28.0, w: 5.0, h: 8.0 },
  46: { x: 25.0, y: 28.0, w: 5.0, h: 8.0 },
  45: { x: 30.0, y: 28.0, w: 5.0, h: 8.0 },
  44: { x: 35.0, y: 28.0, w: 5.0, h: 8.0 },
  43: { x: 40.0, y: 28.0, w: 5.0, h: 8.0 },
  42: { x: 45.0, y: 28.0, w: 5.0, h: 8.0 },
  41: { x: 50.0, y: 28.0, w: 5.0, h: 8.0 },
  40: { x: 55.0, y: 28.0, w: 5.0, h: 8.0 },
  39: { x: 60.0, y: 28.0, w: 5.0, h: 8.0 },
  38: { x: 65.0, y: 28.0, w: 5.0, h: 8.0 },
  37: { x: 70.0, y: 28.0, w: 5.0, h: 8.0 },

  // -------------------------------------------------
  // TOP ROW
  // 49 50 51 52 53 54 55 56 57 58 59 60
  // -------------------------------------------------

  49: { x: 14.0, y: 12.5, w: 5.0, h: 8.0 },
  50: { x: 19.0, y: 12.5, w: 5.0, h: 8.0 },
  51: { x: 24.0, y: 12.5, w: 5.0, h: 8.0 },
  52: { x: 29.0, y: 12.5, w: 5.0, h: 8.0 },
  53: { x: 34.0, y: 12.5, w: 5.0, h: 8.0 },
  54: { x: 39.0, y: 12.5, w: 5.0, h: 8.0 },
  55: { x: 44.0, y: 12.5, w: 5.0, h: 8.0 },
  56: { x: 49.0, y: 12.5, w: 5.0, h: 8.0 },
  57: { x: 54.0, y: 12.5, w: 5.0, h: 8.0 },
  58: { x: 59.0, y: 12.5, w: 5.0, h: 8.0 },
  59: { x: 64.0, y: 12.5, w: 5.0, h: 8.0 },
  60: { x: 69.0, y: 12.5, w: 5.0, h: 8.0 },

  // -------------------------------------------------
  // RIGHT WALL
  // -------------------------------------------------

  64: {
    x: 84.0,
    y: 15.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  63: {
    x: 84.0,
    y: 25.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  62: {
    x: 84.0,
    y: 35.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },

  61: {
    x: 84.0,
    y: 45.0,
    w: 5.0,
    h: 8.0,
    vertical: true,
  },
};

function normalizeSlotNumber(slotNumber) {
  return String(slotNumber);
}

function getSlotId(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || "");
  }

  return String(value);
}

function getSlotStatus(slot) {
  return slot?.status || "unavailable";
}

export default function ExhibitionLayout({
  slots = [],
  selectedSlot,
  categoryId,
  categoryName,
  allowedSlotIds = [],
  onSelect,
}) {
  function getSlot(number) {
    return slots.find(
      (slot) =>
        normalizeSlotNumber(slot.slotNumber) ===
        String(number)
    );
  }

  function isAllowedSlot(slot) {
    if (!slot) {
      return false;
    }

    return allowedSlotIds.some(
      (allowedId) =>
        getSlotId(allowedId) ===
        String(slot._id)
    );
  }

  function canSelect(slot) {
    return (
      !!slot &&
      isAllowedSlot(slot) &&
      getSlotStatus(slot) === "available"
    );
  }

  function isSelected(slot) {
    if (!slot || !selectedSlot) {
      return false;
    }

    return (
      String(slot._id) ===
      String(selectedSlot._id)
    );
  }

  function handleSelect(slot) {
    if (!canSelect(slot)) {
      return;
    }

    onSelect?.(slot);
  }

  function getStallStyle(slot) {
    const status = getSlotStatus(slot);
    const allowed = isAllowedSlot(slot);
    const selected = isSelected(slot);

    if (selected) {
      return {
        wrapper:
          "border-amber-500 bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300",
        dot: "bg-slate-950",
      };
    }

    if (
      allowed &&
      status === "available"
    ) {
      return {
        wrapper:
          "border-green-400 bg-green-50 text-green-800 hover:bg-green-100 hover:border-green-500 hover:shadow-sm",
        dot: "bg-green-500",
      };
    }

    if (status === "booked") {
      return {
        wrapper:
          "border-red-300 bg-red-50 text-red-500",
        dot: "bg-red-500",
      };
    }

    return {
      wrapper:
        "border-slate-300 bg-slate-100 text-slate-400",
      dot: "bg-slate-400",
    };
  }

  function renderStall(number) {
    const slot = getSlot(number);
    const layout = STALL_LAYOUT[number];

    if (!slot || !layout) {
      return null;
    }

    const selectable = canSelect(slot);
    const selected = isSelected(slot);
    const styles = getStallStyle(slot);

    return (
      <button
        key={String(slot._id)}
        type="button"
        disabled={!selectable}
        onClick={() => handleSelect(slot)}
        aria-label={`Stall ${number}${
          selected
            ? ", selected"
            : selectable
            ? ", available"
            : `, ${getSlotStatus(slot)}`
        }`}
        className={`absolute flex items-center justify-center rounded-lg border-2 transition-all duration-150 ${
          styles.wrapper
        } ${
          selectable
            ? "cursor-pointer"
            : "cursor-not-allowed"
        }`}
        style={{
          left: `${layout.x}%`,
          top: `${layout.y}%`,
          width: `${layout.w}%`,
          height: `${layout.h}%`,
        }}
      >
        {/* Stall number */}
        <span className="text-sm font-extrabold leading-none sm:text-base">
          {String(number).padStart(2, "0")}
        </span>

        {/* Small status indicator */}
        <span
          className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${styles.dot}`}
        />
      </button>
    );
  }

  return (
    <div className="w-full">
      {/* ------------------------------------------------ */}
      {/* Legend */}
      {/* ------------------------------------------------ */}

      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span>Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span>Booked</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-400" />
          <span>Unavailable</span>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Hall Map */}
      {/* ------------------------------------------------ */}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-100 p-3 shadow-sm">
        <div className="mx-auto min-w-[1050px] max-w-[1500px]">
          <div
            className="relative overflow-hidden rounded-2xl bg-white"
            style={{
              aspectRatio: "1600 / 900",
            }}
          >
            {/* ------------------------------------------ */}
            {/* Hall outer wall */}
            {/* ------------------------------------------ */}

            <div className="absolute inset-[2%] rounded-sm border-[10px] border-double border-slate-400 bg-slate-50" />

            {/* ------------------------------------------ */}
            {/* Upper grey structure */}
            {/* ------------------------------------------ */}

            <div
              className="absolute rounded-sm bg-slate-300"
              style={{
                left: "14%",
                top: "5%",
                width: "60%",
                height: "10%",
              }}
            />

            {/* ------------------------------------------ */}
            {/* Upper central grey structure */}
            {/* ------------------------------------------ */}

            <div
              className="absolute rounded-sm bg-slate-300"
              style={{
                left: "15%",
                top: "34%",
                width: "60%",
                height: "9%",
              }}
            />

            {/* ------------------------------------------ */}
            {/* Large lower central grey structure */}
            {/* ------------------------------------------ */}

            <div
              className="absolute rounded-sm bg-slate-300"
              style={{
                left: "19%",
                top: "54%",
                width: "50%",
                height: "14%",
              }}
            />

            {/* ------------------------------------------ */}
            {/* Structural vertical supports */}
            {/* ------------------------------------------ */}

            <div
              className="absolute h-[3%] w-[1%] rounded-sm bg-slate-400"
              style={{
                left: "21%",
                top: "53%",
              }}
            />

            <div
              className="absolute h-[3%] w-[1%] rounded-sm bg-slate-400"
              style={{
                left: "32%",
                top: "53%",
              }}
            />

            <div
              className="absolute h-[3%] w-[1%] rounded-sm bg-slate-400"
              style={{
                left: "43%",
                top: "53%",
              }}
            />

            <div
              className="absolute h-[3%] w-[1%] rounded-sm bg-slate-400"
              style={{
                left: "54%",
                top: "53%",
              }}
            />

            <div
              className="absolute h-[3%] w-[1%] rounded-sm bg-slate-400"
              style={{
                left: "65%",
                top: "53%",
              }}
            />

            {/* ------------------------------------------ */}
            {/* ENTRY */}
            {/* ------------------------------------------ */}

            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: "9%",
              }}
            >
              <div className="flex h-8 items-end justify-center">
                <div className="h-5 w-10 border-x border-t border-slate-700 bg-white" />
              </div>

              <p className="mt-1 text-center text-[9px] font-semibold text-slate-600">
                ENTRY/EXIT
              </p>
            </div>

            {/* ------------------------------------------ */}
            {/* EXIT */}
            {/* ------------------------------------------ */}

            {/* <div
              className="absolute top-0"
              style={{
                left: "76%",
                width: "9%",
              }}
            >
              <div className="flex h-8 items-start justify-center">
                <div className="h-5 w-10 border-x border-b border-slate-700 bg-white" />
              </div>

              <p className="mt-1 text-center text-[9px] font-semibold text-slate-600">
                EXIT
              </p>
            </div> */}

            {/* ------------------------------------------ */}
            {/* Walking direction arrows */}
            {/* ------------------------------------------ */}

            <div className="pointer-events-none absolute left-[30%] top-[22%] text-xl text-slate-500">
              →
            </div>

            <div className="pointer-events-none absolute left-[51%] top-[22%] text-xl text-slate-500">
              →
            </div>

            <div className="pointer-events-none absolute left-[67%] top-[22%] text-xl text-slate-500">
              →
            </div>

            <div className="pointer-events-none absolute left-[22%] top-[44%] text-xl text-slate-500">
              ←
            </div>

            <div className="pointer-events-none absolute left-[43%] top-[44%] text-xl text-slate-500">
              ←
            </div>

            <div className="pointer-events-none absolute left-[65%] top-[44%] text-xl text-slate-500">
              ←
            </div>

            <div className="pointer-events-none absolute left-[32%] top-[75%] text-xl text-slate-500">
              →
            </div>

            <div className="pointer-events-none absolute left-[55%] top-[75%] text-xl text-slate-500">
              →
            </div>

            {/* ------------------------------------------ */}
            {/* STALLS */}
            {/* ------------------------------------------ */}

            {Object.keys(STALL_LAYOUT).map(
              (number) =>
                renderStall(number)
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Selection message */}
      {/* ------------------------------------------------ */}

      <div className="mt-4 text-center">
        {selectedSlot ? (
          <p className="text-sm font-medium text-slate-700">
            Stall{" "}
            <span className="font-bold">
              {selectedSlot.slotNumber}
            </span>{" "}
            selected
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Select one of your approved available
            stalls from the hall layout.
          </p>
        )}
      </div>
    </div>
  );
}