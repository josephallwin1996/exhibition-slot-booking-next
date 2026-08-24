"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
    position: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/categories?all=true",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load categories."
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      name: "",
      description: "",
      active: true,
      position: 0,
    });
  }

  function startEdit(category) {
    setEditingId(category._id);

    setForm({
      name: category.name || "",
      description:
        category.description || "",
      active:
        category.active !== false,
      position:
        category.position ?? 0,
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing =
        Boolean(editingId);

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim(),
        active: form.active,
        position: Number(
          form.position
        ),
      };

      if (!payload.name) {
        throw new Error(
          "Category name is required."
        );
      }

      let response;

      if (isEditing) {
        response = await fetch(
          "/api/categories",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: editingId,
              ...payload,
            }),
          }
        );
      } else {
        response = await fetch(
          "/api/categories",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save category."
        );
      }

      setSuccess(
        isEditing
          ? "Category updated successfully."
          : "Category created successfully."
      );

      resetForm();

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/categories",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: category._id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete category."
        );
      }

      setSuccess(
        "Category deleted successfully."
      );

      if (
        editingId ===
        category._id
      ) {
        resetForm();
      }

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to delete category."
      );
    }
  }

  async function toggleActive(category) {
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/categories",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: category._id,
              active:
                !category.active,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update category."
        );
      }

      setSuccess(
        category.active
          ? "Category deactivated."
          : "Category activated."
      );

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update category."
      );
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">
                Exhibition Admin
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Categories
              </h1>

              <p className="mt-1.5 max-w-xl text-sm leading-5 text-slate-500">
                Manage the categories available
                to exhibitors during application.
              </p>
            </div>

            <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
              <p className="text-lg font-bold leading-none text-slate-950">
                {categories.length}
              </p>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Categories
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {error && (
          <Alert
            type="error"
            message={error}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
          />
        )}

        {/* =====================================================
            ADD / EDIT
        ====================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Form header */}

          <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
                    {editingId ? (
                      <EditIcon />
                    ) : (
                      <PlusIcon />
                    )}
                  </div>

                  <h2 className="text-sm font-bold text-slate-950 sm:text-base">
                    {editingId
                      ? "Edit Category"
                      : "Add Category"}
                  </h2>
                </div>

                <p className="mt-1 pl-10 text-xs text-slate-500">
                  {editingId
                    ? "Update category details."
                    : "Create a category for exhibitors."}
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-2.5 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">

              {/* Category name */}

              <div className="sm:col-span-2 lg:col-span-5">
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  Category Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Decor"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
              </div>

              {/* Position */}

              <div className="lg:col-span-2">
                <label
                  htmlFor="position"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  Position
                </label>

                <input
                  id="position"
                  name="position"
                  type="number"
                  min="0"
                  value={form.position}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
              </div>

              {/* Active */}

              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Status
                </label>

                <label className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Active
                  </span>
                </label>
              </div>

              {/* Submit */}

              <div className="sm:col-span-2 lg:col-span-3 lg:flex lg:items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 w-full rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>

              {/* Description */}

              <div className="sm:col-span-2 lg:col-span-12">
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  Description
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  placeholder="Short description shown internally..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
              </div>
            </div>
          </form>
        </section>

        {/* =====================================================
            CATEGORY LIST
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* List header */}

          <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-950 sm:text-base">
                  Category List
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Manage active and inactive categories.
                </p>
              </div>

              {!loading &&
                categories.length >
                  0 && (
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 sm:inline-flex">
                    {categories.length} total
                  </span>
                )}
            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <LoadingState />
          ) : categories.length ===
            0 ? (
            <EmptyState />
          ) : (
            <>
              {/* =================================================
                  MOBILE
              ================================================== */}

              <div className="divide-y divide-slate-100 md:hidden">
                {categories.map(
                  (category) => (
                    <MobileCategoryCard
                      key={
                        category._id
                      }
                      category={
                        category
                      }
                      onEdit={
                        startEdit
                      }
                      onDelete={
                        handleDelete
                      }
                      onToggle={
                        toggleActive
                      }
                    />
                  )
                )}
              </div>

              {/* =================================================
                  DESKTOP
              ================================================== */}

              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="w-20 px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        #
                      </th>

                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </th>

                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Slug
                      </th>

                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {categories.map(
                      (category) => (
                        <DesktopCategoryRow
                          key={
                            category._id
                          }
                          category={
                            category
                          }
                          onEdit={
                            startEdit
                          }
                          onDelete={
                            handleDelete
                          }
                          onToggle={
                            toggleActive
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   ALERT
========================================================= */

function Alert({
  type,
  message,
}) {
  const isError =
    type === "error";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isError ? (
          <AlertIcon />
        ) : (
          <CheckIcon />
        )}
      </div>

      <p>{message}</p>
    </div>
  );
}

/* =========================================================
   MOBILE CATEGORY CARD
========================================================= */

function MobileCategoryCard({
  category,
  onEdit,
  onDelete,
  onToggle,
}) {
  return (
    <article className="p-4 active:bg-slate-50">
      {/* Top */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">
              {category.name}
            </h3>

            <StatusBadge
              active={category.active}
            />
          </div>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            /{category.slug}
          </p>
        </div>

        <div className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-500">
          {category.position}
        </div>
      </div>

      {/* Description */}

      {category.description && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {category.description}
        </p>
      )}

      {/* Actions */}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onEdit(category)
          }
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          <EditIcon />
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onToggle(category)
          }
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          {category.active ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}

          {category.active
            ? "Deactivate"
            : "Activate"}
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(category)
          }
          className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50/50 text-xs font-bold text-red-600 transition hover:bg-red-50 active:bg-red-100"
        >
          <TrashIcon />
          Delete Category
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function DesktopCategoryRow({
  category,
  onEdit,
  onDelete,
  onToggle,
}) {
  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-6 py-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
          {category.position}
        </span>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-bold text-slate-950">
            {category.name}
          </p>

          {category.description && (
            <p className="mt-1 max-w-lg truncate text-xs text-slate-400">
              {category.description}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
          /{category.slug}
        </span>
      </td>

      <td className="px-6 py-4">
        <StatusBadge
          active={category.active}
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() =>
              onEdit(category)
            }
            className="rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onToggle(category)
            }
            className="rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {category.active
              ? "Deactivate"
              : "Activate"}
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(category)
            }
            className="rounded-lg px-2.5 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  active,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="flex items-center gap-4 px-4 py-5 sm:px-6"
          >
            <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />

            <div className="flex-1">
              <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-2.5 w-48 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <CategoryIcon />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-950">
        No categories yet
      </h3>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
        Create your first exhibitor
        category using the form above.
      </p>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect
        x="6"
        y="5"
        width="4"
        height="14"
        rx="1"
      />
      <rect
        x="14"
        y="5"
        width="4"
        height="14"
        rx="1"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7Z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <circle
        cx="12"
        cy="12"
        r="9"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}