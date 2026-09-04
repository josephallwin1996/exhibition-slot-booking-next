"use client";

import { useEffect, useState } from "react";

/*
 * ============================================================
 * PHYSICAL STALL LAYOUT
 * ============================================================
 *
 * IMPORTANT:
 * This mapping is the physical hall drawing.
 *
 * Do NOT use database row/column values for visual positioning.
 *
 * The database still controls:
 * - slot number
 * - price
 * - category
 * - status
 * - notes
 *
 * This mapping controls ONLY the physical position.
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

  /*
   * Search is intentionally applied on the client too.
   *
   * The physical map still stays in the exact same position.
   * Slots that don't match the search simply disappear.
   */
  const visibleSlots = search.trim()
    ? slots.filter((slot) =>
        String(slot.slotNumber)
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
    : slots;

  const slotMap = new Map(
    visibleSlots.map((slot) => [
      String(slot.slotNumber),
      slot,
    ])
  );

  function getSlot(number) {
    return slotMap.get(String(number));
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-600 sm:text-xs">
                Exhibition Admin
              </p> */}

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Slot Management
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Manage exhibition stalls, categories,
                pricing and availability.
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
             * Only this wrapper scrolls horizontally.
             * The rest of the dashboard remains responsive.
             */
            <div className="overflow-x-auto overscroll-x-contain">
              <div className="mx-auto min-w-[1050px] max-w-[1500px] px-3 py-5 sm:px-8 sm:py-8">
                {/* Exit */}

                <div className="mx-auto mb-6 w-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-center sm:mb-8 sm:w-56 sm:px-5 sm:py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Exit
                  </p>
                </div>

                {/* =================================================
                    PHYSICAL HALL
                ================================================== */}

                <div className="relative overflow-hidden rounded-2xl border-4 border-double border-slate-400 bg-slate-50 sm:rounded-3xl">
                  {/* Hall inner map */}

                  <div
                    className="relative w-full overflow-hidden rounded-xl bg-white"
                    style={{
                      aspectRatio: "1600 / 900",
                    }}
                  >
                    {/* ------------------------------------------
                        UPPER GREY STRUCTURE
                    ------------------------------------------- */}

                    <div
                      className="absolute rounded-sm bg-slate-300"
                      style={{
                        left: "14%",
                        top: "5%",
                        width: "60%",
                        height: "10%",
                      }}
                    />

                    {/* ------------------------------------------
                        UPPER CENTRAL GREY STRUCTURE
                    ------------------------------------------- */}

                    <div
                      className="absolute rounded-sm bg-slate-300"
                      style={{
                        left: "15%",
                        top: "34%",
                        width: "60%",
                        height: "9%",
                      }}
                    />

                    {/* ------------------------------------------
                        LARGE LOWER CENTRAL STRUCTURE
                    ------------------------------------------- */}

                    <div
                      className="absolute rounded-sm bg-slate-300"
                      style={{
                        left: "19%",
                        top: "54%",
                        width: "50%",
                        height: "14%",
                      }}
                    />

                    {/* ------------------------------------------
                        STRUCTURAL SUPPORTS
                    ------------------------------------------- */}

                    {[21, 32, 43, 54, 65].map(
                      (left) => (
                        <div
                          key={left}
                          className="absolute h-[3%] w-[1%] rounded-sm bg-slate-400"
                          style={{
                            left: `${left}%`,
                            top: "53%",
                          }}
                        />
                      )
                    )}

                    {/* ------------------------------------------
                        ENTRY
                    ------------------------------------------- */}

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

                    {/* ------------------------------------------
                        WALKING ARROWS
                    ------------------------------------------- */}

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

                    {/* ------------------------------------------
                        STALLS
                    ------------------------------------------- */}

                    {Object.keys(STALL_LAYOUT).map(
                      (number) => {
                        const slot = getSlot(number);

                        if (!slot) {
                          return null;
                        }

                        const layout =
                          STALL_LAYOUT[number];

                        return (
                          <AdminStall
                            key={String(slot._id)}
                            slot={slot}
                            layout={layout}
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
   ADMIN STALL
============================================================ */

function AdminStall({
  slot,
  layout,
  onClick,
}) {
  const isUnassigned =
    !slot.category;

  const style = isUnassigned
    ? {
        card:
          "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:border-amber-400",
        dot: "bg-amber-500",
      }
    : statusStyles[slot.status] || {
        card:
          "border-slate-200 bg-slate-100 text-slate-700",
        dot: "bg-slate-400",
      };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit stall ${slot.slotNumber}`}
      className={`absolute flex items-center justify-center rounded-lg border-2 shadow-sm transition-all duration-150 hover:z-20 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${style.card}`}
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        width: `${layout.w}%`,
        height: `${layout.h}%`,
      }}
    >
      {/* Stall number */}

      <span className="text-sm font-extrabold leading-none sm:text-base">
        {String(slot.slotNumber).padStart(2, "0")}
      </span>

      {/* Status dot */}

      <span
        className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full sm:right-2 sm:top-2 sm:h-2 sm:w-2 ${style.dot}`}
      />

      {/* Desktop hover information */}

      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-40 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-[10px] text-white shadow-xl group-hover:block">
        Stall {slot.slotNumber}
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
      Number.isNaN(numericPrice) ||
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