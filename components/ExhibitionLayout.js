"use client";

import SlotCard from "./SlotCard";

export default function ExhibitionLayout({
  slots,
  selectedSlot,
  onSelect,
}) {
  const sortedSlots = [...slots].sort((a, b) => {
    if (a.row !== b.row) {
      return a.row - b.row;
    }

    if (a.column !== b.column) {
      return a.column - b.column;
    }

    return String(a.slotNumber).localeCompare(
      String(b.slotNumber),
      undefined,
      {
        numeric: true,
      }
    );
  });

  const rows = {};

  sortedSlots.forEach((slot) => {
    const row = slot.row || 1;

    if (!rows[row]) {
      rows[row] = [];
    }

    rows[row].push(slot);
  });

  const rowNumbers = Object.keys(rows).sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
      {/* Map Header */}
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-center text-white sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
          Exhibition 2026
        </p>

        <h2 className="mt-2 text-xl font-bold sm:text-2xl">
          Exhibition Floor Plan
        </h2>

        <p className="mt-2 text-xs text-slate-400 sm:text-sm">
          Select an available stall to continue.
        </p>
      </div>

      {/* Entrance */}
      <div className="px-4 pt-6 sm:px-8">
        <div className="mx-auto max-w-xs rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Exit
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="overflow-x-auto px-4 py-8 sm:px-8">
        <div className="mx-auto min-w-[650px] max-w-5xl">
          <div className="rounded-3xl border-4 border-slate-200 bg-slate-50 p-5 sm:p-8">
            {/* Main walkway */}
            <div className="mb-8 flex items-center justify-center">
              <div className="w-full rounded-xl bg-slate-200 px-6 py-4 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                  Main Walkway
                </span>
              </div>
            </div>

            {/* Slot Rows */}
            <div className="space-y-5">
              {rowNumbers.map((rowNumber) => {
                const rowSlots = rows[rowNumber];

                return (
                  <div
                    key={rowNumber}
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${Math.max(
                        rowSlots.length,
                        1
                      )}, minmax(80px, 1fr))`,
                    }}
                  >
                    {rowSlots.map((slot) => (
                      <SlotCard
                        key={slot._id}
                        slot={slot}
                        selected={
                          selectedSlot?._id === slot._id
                        }
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Empty / no slots */}
            {rowNumbers.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                <p className="font-semibold text-slate-700">
                  No stalls are currently available.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Please contact the exhibition organizers.
                </p>
              </div>
            )}

            {/* Entrance */}
            <div className="mt-8 flex items-center justify-center">
              <div className="mx-auto max-w-xs rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-8 py-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                  Entrance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
          <Legend
            className="bg-green-50 border-green-300"
            label="Available"
          />

          <Legend
            className="bg-amber-400 border-amber-500"
            label="Selected"
          />

          <Legend
            className="bg-blue-50 border-blue-200"
            label="Booked"
          />

          <Legend
            className="bg-slate-100 border-slate-200"
            label="Unavailable"
          />
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-4 w-4 rounded border ${className}`}
      />

      <span>{label}</span>
    </div>
  );
}