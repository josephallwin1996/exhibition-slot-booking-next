"use client";

import SlotCard from "./SlotCard";

export default function ExhibitionLayout({
  slots,
  selectedSlot,
  onSelect,
  categoryId,
  categoryName,
  allowedSlotIds = [],
}) {
  const sortedSlots = [...slots].sort((a, b) => {
    if (Number(a.row || 0) !== Number(b.row || 0)) {
      return Number(a.row || 0) - Number(b.row || 0);
    }

    if (
      Number(a.column || 0) !==
      Number(b.column || 0)
    ) {
      return (
        Number(a.column || 0) -
        Number(b.column || 0)
      );
    }

    return String(a.slotNumber).localeCompare(
      String(b.slotNumber),
      undefined,
      {
        numeric: true,
      }
    );
  });

  /*
   * Group slots by physical row.
   */
  const rows = {};

  sortedSlots.forEach((slot) => {
    const row = Number(slot.row) || 1;

    if (!rows[row]) {
      rows[row] = [];
    }

    rows[row].push(slot);
  });

  const rowNumbers = Object.keys(rows).sort(
    (a, b) => Number(a) - Number(b)
  );

  /*
   * Determine whether a slot belongs to the
   * exhibitor's category.
   *
   * Supports both:
   *
   * slot.categoryId
   *
   * and, temporarily, populated:
   *
   * slot.category._id
   */
  function isMyCategory(slot) {
    if (!categoryId) {
      return false;
    }

    const slotCategoryId =
      slot.categoryId ||
      slot.category?._id ||
      slot.category;

    console.log(
      slotCategoryId,
      categoryId
    );

    return (
      String(slotCategoryId) ===
      String(categoryId)
    );
  }

  /*
   * Determine whether this specific slot
   * was assigned to this application by admin.
   */
  function isAllowedSlot(slot) {
    if (!slot?._id) {
      return false;
    }

    return allowedSlotIds.some(
      (allowedSlotId) => {
        const id =
          typeof allowedSlotId ===
          "object"
            ? allowedSlotId?._id
            : allowedSlotId;

        return (
          String(id) ===
          String(slot._id)
        );
      }
    );
  }

  /*
   * A slot can be selected only when:
   *
   * 1. It is specifically assigned to
   *    this application by admin.
   *
   * 2. Its current status is available.
   *
   * Category is intentionally NOT used here.
   *
   * The admin-selected slots are the source
   * of truth for what the applicant can book.
   */
  function canSelect(slot) {
    return (
      isAllowedSlot(slot) &&
      slot.status === "available"
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">

      {/* =====================================================
          MAP HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-center text-white sm:px-8">

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
          Exhibition 2026
        </p>

        <h2 className="mt-2 text-xl font-bold sm:text-2xl">
          Exhibition Floor Plan
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-400 sm:text-sm">
          View the complete exhibition layout.
          Only available stalls in your category
          can be selected.
        </p>

        {/* Exhibitor category */}

        {categoryName && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2">

            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span className="text-xs font-semibold text-amber-300">
              Your Category:
            </span>

            <span className="text-xs font-bold text-white">
              {categoryName}
            </span>

          </div>
        )}

      </div>

      {/* =====================================================
          MAP
      ====================================================== */}

      <div className="overflow-x-auto overscroll-x-contain px-3 py-6 sm:px-6 sm:py-8">

        <div className="mx-auto w-max min-w-full sm:min-w-[700px]">

          {/* Exit */}

          <div className="mb-6 flex justify-center sm:mb-8">

            <div className="w-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-center sm:w-56">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Exit
              </p>

            </div>

          </div>

          {/* Floor */}

          <div className="rounded-3xl border-4 border-slate-200 bg-slate-50 p-4 sm:p-8">

            {/* Main Walkway */}

            <div className="mb-6 flex items-center justify-center sm:mb-8">

              <div className="w-full rounded-xl bg-slate-200 px-5 py-3 text-center sm:px-6 sm:py-4">

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.25em]">
                  Main Walkway
                </span>

              </div>

            </div>

            {/* Slot Rows */}

            {rowNumbers.length > 0 ? (
              <div className="space-y-3 sm:space-y-5">

                {rowNumbers.map(
                  (rowNumber) => {
                    const rowSlots =
                      rows[rowNumber];

                    /*
                     * Preserve physical columns.
                     *
                     * This is important if there are
                     * empty spaces between stalls.
                     */
                    const maxColumn =
                      Math.max(
                        ...rowSlots.map(
                          (slot) =>
                            Number(
                              slot.column
                            ) || 1
                        ),
                        1
                      );

                    return (
                      <div
                        key={rowNumber}
                        className="grid gap-2 sm:gap-3"
                        style={{
                          gridTemplateColumns: `repeat(${maxColumn}, minmax(72px, 72px))`,
                        }}
                      >

                        {Array.from({
                          length: maxColumn,
                        }).map(
                          (_, index) => {
                            const column =
                              index + 1;

                            const slot =
                              rowSlots.find(
                                (item) =>
                                  Number(
                                    item.column
                                  ) ===
                                  column
                              );

                            /*
                             * Empty physical position.
                             */
                            if (!slot) {
                              return (
                                <div
                                  key={`empty-${rowNumber}-${column}`}
                                  className="h-[82px] rounded-xl border border-transparent"
                                />
                              );
                            }

                            return (
                              <SlotCard
                                key={slot._id}
                                slot={slot}
                                selected={
                                  selectedSlot?._id ===
                                  slot._id
                                }
                                selectable={canSelect(
                                  slot
                                )}
                                belongsToCategory={isAllowedSlot(
                                  slot
                                )}
                                onSelect={
                                  onSelect
                                }
                              />
                            );
                          }
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">

                <p className="font-semibold text-slate-700">
                  No exhibition stalls have been configured yet.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Please contact the exhibition organizers.
                </p>

              </div>
            )}

            {/* Entrance */}

            <div className="mt-6 flex items-center justify-center sm:mt-8">

              <div className="w-40 rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-8 py-3 text-center sm:w-56 sm:py-4">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                  Entrance
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          INSTRUCTIONS
      ====================================================== */}

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-8">

        <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <p className="text-xs text-slate-500">
            <strong className="text-slate-700">
              Your category:
            </strong>{" "}
            {categoryName || "Not specified"}
          </p>

          <p className="text-xs text-slate-400">
            Only green stalls can be selected.
          </p>

        </div>

      </div>

      {/* =====================================================
          LEGEND
      ====================================================== */}

      <div className="border-t border-slate-200 bg-white px-5 py-5 sm:px-8">

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-slate-600 sm:gap-x-7">

          <Legend
            className="bg-green-50 border-green-300"
            label="Available for you"
          />

          <Legend
            className="bg-amber-400 border-amber-500"
            label="Selected"
          />

          <Legend
            className="bg-red-400 border-red-500"
            label="Booked"
          />

          <Legend
            className="bg-slate-100 border-slate-200"
            label="Unavailable"
          />

          <Legend
            className="bg-slate-200 border-slate-300"
            label="Other category"
          />

        </div>

      </div>

    </div>
  );
}

function Legend({
  className,
  label,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-4 w-4 rounded border ${className}`}
      />

      <span>{label}</span>

    </div>
  );
}