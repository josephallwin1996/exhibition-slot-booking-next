"use client";

import { useEffect, useState } from "react";

const categories = [
  "Furniture",
  "Branding",
  "Electricity",
  "Other",
];

const statuses = [
  "active",
  "inactive",
];

const statusStyles = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-500",
};

export default function AddOnsPage() {
  const [addOns, setAddOns] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingAddOn, setEditingAddOn] = useState(null);
  const [creating, setCreating] = useState(false);

  async function loadAddOns() {
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
        `/api/admin/addons?${params.toString()}`,
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
          data.message ||
            "Unable to load add-ons."
        );
      }

      setAddOns(data.addOns);
      setStats(data.stats);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddOns();
  }, [category, status]);

  function handleSearch(event) {
    event.preventDefault();
    loadAddOns();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Exhibition Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Add-on Management
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
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Add-ons"
            value={stats.total}
          />

          <StatCard
            label="Active"
            value={stats.active}
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
          />
        </div>

        {/* Add-on List */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add-ons
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage optional products and services.
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
                    placeholder="Search add-ons..."
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

                <button
                  onClick={() => setCreating(true)}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                >
                  + Add Add-on
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading add-ons...
            </div>
          ) : addOns.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="font-semibold text-slate-900">
                No add-ons found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create an add-on to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Add-on
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Max Qty
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {addOns.map((addOn) => (
                    <tr
                      key={addOn._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          {addOn.name}
                        </p>

                        {addOn.description && (
                          <p className="mt-1 max-w-sm text-sm text-slate-500">
                            {addOn.description}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-700">
                        {addOn.category}
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-slate-900">
                        ₹
                        {Number(
                          addOn.price
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {addOn.maxQuantity}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[
                              addOn.status
                            ]
                          }`}
                        >
                          {addOn.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setEditingAddOn(addOn)
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

      {(creating || editingAddOn) && (
        <AddOnModal
          addOn={editingAddOn}
          onClose={() => {
            setCreating(false);
            setEditingAddOn(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditingAddOn(null);
            loadAddOns();
          }}
        />
      )}
    </main>
  );
}

function AddOnModal({
  addOn,
  onClose,
  onSaved,
}) {
  const editing = Boolean(addOn);

  const [name, setName] = useState(
    addOn?.name || ""
  );

  const [description, setDescription] =
    useState(addOn?.description || "");

  const [price, setPrice] = useState(
    addOn?.price
      ? String(addOn.price)
      : ""
  );

  const [category, setCategory] = useState(
    addOn?.category || "Other"
  );

  const [maxQuantity, setMaxQuantity] =
    useState(
      addOn?.maxQuantity
        ? String(addOn.maxQuantity)
        : "1"
    );

  const [status, setStatus] = useState(
    addOn?.status || "active"
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        description,
        price: Number(price),
        category,
        maxQuantity: Number(maxQuantity),
        status,
      };

      if (editing) {
        payload.id = addOn._id;
      }

      const response = await fetch(
        "/api/admin/addons",
        {
          method: editing
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save add-on."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
              {editing
                ? "Edit Add-on"
                : "New Add-on"}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {editing
                ? addOn.name
                : "Create Add-on"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Name">
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Extra Chair"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe this add-on..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 resize-none"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price">
              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value
                  )
                }
                placeholder="500"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </Field>

            <Field label="Maximum Quantity">
              <input
                type="number"
                min="1"
                value={maxQuantity}
                onChange={(event) =>
                  setMaxQuantity(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </Field>
          </div>

          <Field label="Category">
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </Field>
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
            className="flex-1 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editing
              ? "Save Changes"
              : "Create Add-on"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
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