"use client";

import { useEffect, useState } from "react";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [applications, setApplications] =
    useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [status, setStatus] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (status !== "all") {
        params.set(
          "status",
          status
        );
      }

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      const response =
        await fetch(
          `/api/admin/applications?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load applications."
        );
      }

      setApplications(
        data.applications || []
      );

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-7">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Exhibition Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of exhibitor applications
            and their current status.
          </p>

        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review exhibitor applications.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <form
                  onSubmit={
                    handleSearch
                  }
                  className="flex"
                >
                  <input
                    type="search"
                    placeholder="Search applications..."
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-l-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900 sm:w-64"
                  />

                  <button
                    type="submit"
                    className="rounded-r-xl bg-slate-950 px-4 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </form>

                <select
                  value={status}
                  onChange={(
                    event
                  ) =>
                    setStatus(
                      event.target
                        .value
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900"
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

          {/* Error */}
          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading applications...
            </div>
          ) : applications.length ===
            0 ? (
            <div className="p-12 text-center">

              <div className="text-3xl">
                ○
              </div>

              <h3 className="mt-3 font-semibold text-slate-900">
                No applications found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Applications matching your
                filters will appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

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
                        key={
                          application._id
                        }
                        className="transition hover:bg-slate-50"
                      >

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

                        <td className="px-6 py-5">
                          <span className="font-medium text-slate-700">
                            {
                              application.category
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              statusStyles[
                                application
                                  .status
                              ]
                            }`}
                          >
                            {
                              application.status
                            }
                          </span>

                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(
                            application.createdAt
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            onClick={() =>
                              (window.location.href =
                                `/admin/applications/${application._id}`)
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </section>
    </div>
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
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
          {icon}
        </span>

      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}