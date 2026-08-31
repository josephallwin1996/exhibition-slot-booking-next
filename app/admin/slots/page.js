"use client";

import { useEffect, useMemo, useState } from "react";

const statuses = [
  "available",
  "booked",
  "unavailable",
];

const statusStyles = {
  available: {
    card: "border-green-300 bg-green-50 text-green-800",
    dot: "bg-green-500",
  },

  // booked: {
  //   card: "border-blue-200 bg-blue-50 text-blue-800",
  //   dot: "bg-blue-500",
  // },

  booked: {
    card: "border-red-200 bg-red-50 text-red-800",
    dot: "bg-red-500",
  },

  unavailable: {
    card: "border-slate-200 bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [categories, setCategories] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    unavailable: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingSlot, setEditingSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadSlots() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category !== "all") {
        params.set("category", category);
      }

      if (status !== "all") {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/slots?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load slots."
        );
      }

      setSlots(data.slots || []);
      setCategories(data.categories || []);

      setStats(
        data.stats || {
          total: 0,
          available: 0,
          booked: 0,
          unavailable: 0,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to load slots."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, [category, status]);

  function handleSearch(event) {
    event.preventDefault();
    loadSlots();
  }

  const visibleSlots = useMemo(() => {
    if (!search.trim()) {
      return slots;
    }

    const query = search.trim().toLowerCase();

    return slots.filter((slot) =>
      String(slot.slotNumber)
        .toLowerCase()
        .includes(query)
    );
  }, [slots, search]);

  /*
   * Group stalls by physical row.
   */
  const rows = useMemo(() => {
    const grouped = {};

    visibleSlots.forEach((slot) => {
      const row = Number(slot.row) || 1;

      if (!grouped[row]) {
        grouped[row] = [];
      }

      grouped[row].push(slot);
    });

    Object.values(grouped).forEach((rowSlots) => {
      rowSlots.sort((a, b) => {
        const columnDifference =
          Number(a.column || 0) -
          Number(b.column || 0);

        if (columnDifference !== 0) {
          return columnDifference;
        }

        return String(a.slotNumber).localeCompare(
          String(b.slotNumber),
          undefined,
          {
            numeric: true,
          }
        );
      });
    });

    return grouped;
  }, [visibleSlots]);

  const rowNumbers = Object.keys(rows).sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <main className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-600 sm:text-xs">
                Exhibition Admin
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Slot Management
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Manage exhibition stalls,
                categories, pricing and
                availability.
              </p>
            </div>

            <div className="text-xs text-slate-500 sm:text-sm">
              <span className="font-semibold text-slate-900">
                {stats.total}
              </span>{" "}
              physical stalls
            </div>

          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

          <StatCard
            label="Total Slots"
            value={stats.total}
          />

          <StatCard
            label="Available"
            value={stats.available}
          />

          <StatCard
            label="Booked"
            value={stats.booked}
          />

          <StatCard
            label="Unavailable"
            value={stats.unavailable}
          />

        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:mt-8 sm:p-6">

          <div className="flex flex-col gap-4">

            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Exhibition Floor
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Select a stall to manage it.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {/* Search */}

              <form
                onSubmit={handleSearch}
                className="flex sm:col-span-2 lg:col-span-1"
              >
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search stall..."
                  className="min-w-0 flex-1 rounded-l-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 sm:px-4"
                />

                <button
                  type="submit"
                  className="rounded-r-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Search
                </button>
              </form>

              {/* Category */}

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 sm:px-4"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              {/* Status */}

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 sm:px-4"
              >
                <option value="all">
                  All Statuses
                </option>

                {statuses.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {capitalize(item)}
                  </option>
                ))}
              </select>

            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            FLOOR MAP CARD
        ====================================================== */}

        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 sm:mt-6 sm:rounded-3xl">

          {/* Map Header */}

          <div className="border-b border-slate-200 bg-slate-950 px-4 py-5 text-white sm:px-7 sm:py-6">

            <div className="flex flex-col gap-4">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 sm:text-xs">
                  Exhibition 2026
                </p>

                <h2 className="mt-1 text-lg font-bold sm:mt-2 sm:text-2xl">
                  Exhibition Floor Plan
                </h2>

                <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
                  Tap a stall to edit its details.
                </p>
              </div>

              {/* Legend */}

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-300 sm:gap-x-5 sm:text-xs">

                <Legend
                  dot="bg-green-500"
                  label="Available"
                />

                <Legend
                  dot="bg-red-500"
                  label="Booked"
                />

                <Legend
                  dot="bg-slate-400"
                  label="Unavailable"
                />

                <Legend
                  dot="bg-amber-400"
                  label="Unassigned"
                />

              </div>

            </div>
          </div>

          {/* =================================================
              MAP
          ================================================== */}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center sm:min-h-[500px]">
              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 sm:h-9 sm:w-9" />

                <p className="mt-4 text-xs text-slate-500 sm:text-sm">
                  Loading exhibition floor...
                </p>

              </div>
            </div>
          ) : visibleSlots.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center px-6">
              <div className="text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                  —
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No stalls found
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Try changing your search or filters.
                </p>

              </div>
            </div>
          ) : (
            /*
             * IMPORTANT:
             *
             * Only this wrapper scrolls horizontally.
             * The rest of the page remains responsive.
             */
            <div className="overflow-x-auto overscroll-x-contain">

              <div className="mx-auto w-max min-w-full px-3 py-5 sm:px-8 sm:py-8">

                {/* Exit */}

                <div className="mx-auto mb-6 w-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-center sm:mb-8 sm:w-56 sm:px-5 sm:py-3">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Exit
                  </p>

                </div>

                {/* Physical floor */}

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 sm:rounded-3xl sm:border-4 sm:p-7">

                  {/* Walkway */}

                  <div className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">

                    <div className="h-px w-20 bg-slate-200 sm:w-32" />

                    <span className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.25em]">
                      Main Walkway
                    </span>

                    <div className="h-px w-20 bg-slate-200 sm:w-32" />

                  </div>

                  {/* Rows */}

                  <div className="space-y-2 sm:space-y-3">

                    {rowNumbers.map(
                      (rowNumber) => {
                        const rowSlots =
                          rows[rowNumber];

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
                              gridTemplateColumns: `repeat(${maxColumn}, minmax(68px, 68px))`,
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

                                if (!slot) {
                                  return (
                                    <div
                                      key={`empty-${rowNumber}-${column}`}
                                      className="h-[76px] rounded-xl border border-transparent sm:h-[82px]"
                                    />
                                  );
                                }

                                return (
                                  <SlotCard
                                    key={slot._id}
                                    slot={slot}
                                    onClick={() =>
                                      setEditingSlot(
                                        slot
                                      )
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

                  {/* Entrance */}

                  <div className="mt-6 flex justify-center sm:mt-8">

                    <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-8 py-2.5 text-center sm:px-10 sm:py-3">

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">
                        Entrance
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Footer */}

          {!loading &&
            visibleSlots.length > 0 && (
              <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-7 sm:py-4">

                <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-xs">

                  <span>
                    Showing{" "}
                    <strong className="text-slate-700">
                      {visibleSlots.length}
                    </strong>{" "}
                    stalls
                  </span>

                  <span className="text-slate-400">
                    Swipe left/right on mobile to
                    view the floor
                  </span>

                </div>

              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          categories={categories}
          saving={saving}
          setSaving={setSaving}
          onClose={() =>
            setEditingSlot(null)
          }
          onSaved={() => {
            setEditingSlot(null);
            loadSlots();
          }}
        />
      )}

    </main>
  );
}

/* ============================================================
   SLOT CARD
============================================================ */

function SlotCard({
  slot,
  onClick,
}) {
  const isUnassigned =
    !slot.category;

  const style =
    isUnassigned
      ? {
          card:
            "border-amber-300 bg-amber-50 text-amber-800",
          dot: "bg-amber-500",
        }
      : statusStyles[
          slot.status
        ] || {
          card:
            "border-slate-200 bg-slate-100 text-slate-700",
          dot: "bg-slate-400",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit stall ${slot.slotNumber}`}
      className={`group relative flex h-[76px] w-[68px] flex-col items-center justify-center rounded-xl border px-1.5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400/60 sm:h-[82px] sm:w-[72px] ${style.card}`}
    >

      {/* Status */}

      <span
        className={`absolute right-2 top-2 h-2 w-2 rounded-full ${style.dot}`}
      />

      {/* Number */}

      <span className="text-sm font-bold tracking-wide sm:text-base">
        {String(
          slot.slotNumber
        ).padStart(2, "0")}
      </span>

      {/* Category */}

      <span className="mt-1 max-w-[62px] truncate text-[8px] font-semibold uppercase tracking-wide opacity-70 sm:max-w-[66px] sm:text-[9px]">
        {slot.category?.name ||
          "Unassigned"}
      </span>

      {/* Price */}

      <span className="mt-1 text-[8px] opacity-60 sm:text-[9px]">
        ₹
        {Number(
          slot.price || 0
        ).toLocaleString("en-IN")}
      </span>

      {/* Price */}

      <span className="mt-1 text-[8px] opacity-60 sm:text-[9px]">
        Size: 6 X 6 ft
      </span>

    </button>
  );
}

/* ============================================================
   EDIT MODAL
============================================================ */

function EditSlotModal({
  slot,
  categories,
  saving,
  setSaving,
  onClose,
  onSaved,
}) {
  const [category, setCategory] =
    useState(
      slot.category?._id || ""
    );

  const [price, setPrice] =
    useState(
      String(slot.price ?? "")
    );

  const [status, setStatus] =
    useState(slot.status);

  const [notes, setNotes] =
    useState(slot.notes || "");

  const [error, setError] =
    useState("");

  const isBooked =
    slot.status === "booked";

  async function saveChanges() {
    setError("");

    const numericPrice =
      Number(price);

    if (
      Number.isNaN(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (
      isBooked &&
      status !== "booked"
    ) {
      setError(
        "A booked slot cannot be changed manually."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          "/api/admin/slots",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: slot._id,
              category,
              price: numericPrice,
              status,
              notes,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update slot."
        );
      }

      onSaved();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update slot."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">

      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl sm:p-8">

        {/* Mobile handle */}

        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        {/* Header */}

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
              Manage Stall
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              {String(
                slot.slotNumber
              ).padStart(2, "0")}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Row {slot.row}
              <span className="mx-1">
                /
              </span>
              Column {slot.column}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            ×
          </button>

        </div>

        {/* Form */}

        <div className="mt-6 space-y-5 sm:mt-7">

          {/* Category */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">
                Unassigned
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Only approved exhibitors
              belonging to this category
              can select this stall.
            </p>
          </div>

          {/* Price */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Price
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-9 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />

            </div>
          </div>

          {/* Status */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              disabled={isBooked}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="available">
                Available
              </option>

              <option value="unavailable">
                Unavailable
              </option>

              <option value="booked">
                Booked
              </option>
            </select>

            {isBooked && (
              <p className="mt-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
                Booked slots are protected
                from manual status changes.
              </p>
            )}
          </div>

          {/* Notes */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Internal Notes
            </label>

            <textarea
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional internal note..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:mt-7 sm:flex-row">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">

      <p className="text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   LEGEND
============================================================ */

function Legend({
  dot,
  label,
}) {
  return (
    <div className="flex items-center gap-1.5">

      <span
        className={`h-2 w-2 rounded-full ${dot}`}
      />

      <span>{label}</span>

    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function capitalize(value) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}