"use client";

import { useEffect, useState } from "react";

const statusStyles = {
  pending:
    "bg-amber-100 text-amber-700 border-amber-200",
  approved:
    "bg-green-100 text-green-700 border-green-200",
  rejected:
    "bg-red-100 text-red-700 border-red-200",
};

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [status, setStatus] = useState("all");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status !== "all") {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/admin/applications?${params.toString()}`,
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
            "Unable to load applications."
        );
      }

      setApplications(data.applications || []);

      setStats(
        data.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [status]);

  function handleSearch(event) {
    event.preventDefault();

    loadApplications();
  }

  function getCategoryName(category) {
    if (!category) {
      return "-";
    }

    if (typeof category === "string") {
      return category;
    }

    if (typeof category === "object") {
      return category.name || "-";
    }

    return String(category);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      <section className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-5 sm:mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 sm:text-xs">
            Exhibition Admin
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-5 text-slate-500">
            Overview of exhibitor applications and
            their current status.
          </p>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon="◉"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon="◷"
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            icon="✓"
          />

          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon="×"
          />
        </div>

        {/* =====================================================
            APPLICATIONS
        ====================================================== */}

        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 sm:mt-7">

          {/* =================================================
              HEADER / FILTERS
          ================================================== */}

          <div className="border-b border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col gap-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review exhibitor applications.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-between">

                {/* Search */}
                <form
                  onSubmit={handleSearch}
                  className="flex w-full sm:max-w-md"
                >
                  <input
                    type="search"
                    placeholder="Search applications..."
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    className="
                      min-w-0
                      flex-1
                      rounded-l-xl
                      border
                      border-r-0
                      border-slate-300
                      bg-white
                      px-3
                      py-2
                      text-sm
                      text-slate-900
                      outline-none
                      placeholder:text-slate-400
                      focus:border-slate-900
                      focus:ring-1
                      focus:ring-slate-900
                      sm:px-4
                    "
                  />

                  <button
                    type="submit"
                    className="
                      shrink-0
                      rounded-r-xl
                      bg-slate-950
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-slate-800
                      active:bg-slate-900
                    "
                  >
                    Search
                  </button>
                </form>

                {/* Status Filter */}
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-3
                    pr-9
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition
                    focus:border-slate-900
                    focus:ring-1
                    focus:ring-slate-900
                    sm:w-auto
                    sm:min-w-[170px]
                  "
                >
                  <option value="all">
                    All Applications
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="m-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-5">
              {error}
            </div>
          )}

          {/* =====================================================
              LOADING
          ====================================================== */}

          {loading ? (
            <LoadingState />
          ) : applications.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* =================================================
                  MOBILE CARDS
              ================================================== */}

              <div className="divide-y divide-slate-100 md:hidden">
                {applications.map(
                  (application) => (
                    <MobileApplicationCard
                      key={application._id}
                      application={application}
                      category={getCategoryName(
                        application.categoryId
                      )}
                    />
                  )
                )}
              </div>

              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Business
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Submitted
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {applications.map(
                      (application) => (
                        <tr
                          key={application._id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Business */}
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {
                                  application.businessName
                                }
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  application.email
                                }
                              </p>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-5">
                            <p className="font-medium text-slate-700">
                              {
                                application.contactPerson
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                application.mobile
                              }
                            </p>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-5">
                            <span className="font-medium text-slate-700">
                              {getCategoryName(
                                application.categoryId
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                application.status
                              }
                            />
                          </td>

                          {/* Submitted */}
                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(
                              application.createdAt
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-5 text-right">
                            <ViewButton
                              applicationId={
                                application._id
                              }
                            />
                          </td>

                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   MOBILE APPLICATION CARD
========================================================= */

function MobileApplicationCard({
  application,
  category,
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4">

        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-900">
              {application.businessName}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {application.email}
            </p>
          </div>

          <StatusBadge
            status={application.status}
          />
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">

          <InfoItem
            label="Contact"
            value={application.contactPerson}
          />

          <InfoItem
            label="Mobile"
            value={application.mobile}
          />

          <InfoItem
            label="Category"
            value={category}
          />

          <InfoItem
            label="Submitted"
            value={formatDate(
              application.createdAt
            )}
          />

        </div>

        {/* Action */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <ViewButton
            applicationId={application._id}
            fullWidth
          />
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const style =
    statusStyles[status] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-bold
        capitalize
        ${style}
      `}
    >
      {status || "unknown"}
    </span>
  );
}

/* =========================================================
   VIEW BUTTON
========================================================= */

function ViewButton({
  applicationId,
  fullWidth = false,
}) {
  return (
    <button
      type="button"
      className={`
        rounded-lg
        border
        border-slate-300
        px-3
        py-2
        text-sm
        font-semibold
        text-slate-700
        transition
        hover:bg-slate-100
        active:bg-slate-200
        ${fullWidth ? "w-full" : ""}
      `}
      onClick={() =>
        (window.location.href =
          `/admin/applications/${applicationId}`)
      }
    >
      View Application
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">

      <div className="flex items-start justify-between gap-2">

        <p className="text-xs font-medium leading-4 text-slate-500 sm:text-sm">
          {label}
        </p>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 sm:h-9 sm:w-9">
          {icon}
        </span>

      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900 sm:mt-4 sm:text-3xl">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="p-10 text-center sm:p-12">

      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

      <p className="mt-4 text-sm text-slate-500">
        Loading applications...
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="p-10 text-center sm:p-12">

      <div className="text-3xl text-slate-300">
        ○
      </div>

      <h3 className="mt-3 font-semibold text-slate-900">
        No applications found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Applications matching your filters
        will appear here.
      </p>

    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}