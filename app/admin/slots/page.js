"use client";

import { useEffect, useState } from "react";

const categories = [
  "Jewellery",
  "Clothing",
  "Food",
  "Decor",
];

const statuses = [
  "available",
  "booked",
  "unavailable",
];

const statusStyles = {
  available: "bg-green-100 text-green-700",
  booked: "bg-blue-100 text-blue-700",
  unavailable: "bg-red-100 text-red-700",
};

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);

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

      setSlots(data.slots);
      setStats(data.stats);
    } catch (error) {
      console.error(error);
      setError(error.message);
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

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Exhibition Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Slot Management
            </h1>
          </div>

          {/* <a
            href="/admin/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </a> */}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Main Card */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Filters */}
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Exhibition Slots
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage slot availability, categories and
                  pricing.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <form
                  onSubmit={handleSearch}
                  className="flex"
                >
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search slot..."
                    className="w-full rounded-l-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900 md:w-48"
                  />

                  <button
                    type="submit"
                    className="rounded-r-xl bg-slate-950 px-4 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </form>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                >
                  <option value="all">
                    All Categories
                  </option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                >
                  <option value="all">
                    All Statuses
                  </option>

                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {capitalize(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading slots...
            </div>
          ) : slots.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="font-semibold text-slate-900">
                No slots found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Slot
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Position
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {slots.map((slot) => (
                    <tr
                      key={slot._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-900">
                          {slot.slotNumber}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-700">
                          {slot.category}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-slate-900">
                          ₹{Number(slot.price).toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[slot.status]
                          }`}
                        >
                          {slot.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {slot.row} / {slot.column}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setEditingSlot(slot)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          saving={saving}
          setSaving={setSaving}
          onClose={() => setEditingSlot(null)}
          onSaved={() => {
            setEditingSlot(null);
            loadSlots();
          }}
        />
      )}
    </main>
  );
}

function EditSlotModal({
  slot,
  saving,
  setSaving,
  onClose,
  onSaved,
}) {
  const [category, setCategory] = useState(
    slot.category
  );

  const [price, setPrice] = useState(
    String(slot.price)
  );

  const [status, setStatus] = useState(
    slot.status
  );

  const [notes, setNotes] = useState(
    slot.notes || ""
  );

  const [error, setError] = useState("");

  const isBooked = slot.status === "booked";

  async function saveChanges() {
    setError("");

    const numericPrice = Number(price);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Please enter a valid price.");
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

      const response = await fetch(
        "/api/admin/slots",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update slot."
        );
      }

      onSaved();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Slot
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {slot.slotNumber}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-2xl leading-none text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Price
            </label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={isBooked}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none disabled:bg-slate-100 disabled:text-slate-400"
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
              <p className="mt-2 text-xs text-blue-600">
                Booked slots are protected from manual status
                changes.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Internal Notes
            </label>

            <textarea
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional internal note..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-7 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex-1 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}