"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  async function loadApplication() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/applications/${params.id}`,
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
          data.message || "Unable to load application."
        );
      }

      setApplication(data.application);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      loadApplication();
    }
  }, [params.id]);

  async function updateApplication(action) {
    if (
      action === "reject" &&
      !rejectionReason.trim()
    ) {
      setError("Please provide a rejection reason.");
      return;
    }

    const confirmed = window.confirm(
      action === "approve"
        ? "Are you sure you want to approve this application?"
        : "Are you sure you want to reject this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const response = await fetch(
        `/api/admin/applications/${params.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            rejectionReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update application."
        );
      }

      setApplication((previous) => ({
        ...previous,
        ...data.application,
      }));

      setShowReject(false);
      setRejectionReason("");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading application...
        </p>
      </main>
    );
  }

  if (error && !application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load application
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const isPending = application.status === "pending";

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Exhibition Admin
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Application Details
            </h1>
          </div>

          <button
            onClick={() =>
              router.push("/admin/dashboard")
            }
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Status */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Application Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-4 py-1.5 text-sm font-bold capitalize ${
                application.status === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : application.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {application.status}
            </span>
          </div>

          {isPending && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={processing}
                onClick={() =>
                  updateApplication("approve")
                }
                className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : "Approve Application"}
              </button>

              <button
                disabled={processing}
                onClick={() => setShowReject(true)}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject Application
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Rejection Form */}
        {showReject && isPending && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Reject Application
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please provide a reason. This will be included in
              the rejection email.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(event.target.value)
              }
              rows={4}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            />

            <div className="mt-4 flex gap-3">
              <button
                disabled={processing}
                onClick={() =>
                  updateApplication("reject")
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>

              <button
                onClick={() => {
                  setShowReject(false);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Business Information */}
        <div className="space-y-6">
          <InfoSection title="Business Information">
            <InfoItem
              label="Business Name"
              value={application.businessName}
            />

            <InfoItem
              label="Category"
              value={application.categoryId.name}
            />

            <InfoItem
              label="Description"
              value={application.description}
              full
            />
          </InfoSection>

          <InfoSection title="Contact Information">
            <InfoItem
              label="Contact Person"
              value={application.contactPerson}
            />

            <InfoItem
              label="Mobile"
              value={application.mobile}
            />

            <InfoItem
              label="Email"
              value={application.email}
            />
          </InfoSection>

          <InfoSection title="Social Media">
            <InfoItem
              label="Instagram"
              value={application.instagram || "Not provided"}
            />

            <InfoItem
              label="Other Social Media"
              value={
                application.socialMedia ||
                "Not provided"
              }
            />
          </InfoSection>

          <InfoSection title="Application Information">
            <InfoItem
              label="Application ID"
              value={application._id}
            />

            <InfoItem
              label="Submitted"
              value={formatDateTime(
                application.createdAt
              )}
            />

            {application.approvedAt && (
              <InfoItem
                label="Approved"
                value={formatDateTime(
                  application.approvedAt
                )}
              />
            )}

            {application.rejectedAt && (
              <InfoItem
                label="Rejected"
                value={formatDateTime(
                  application.rejectedAt
                )}
              />
            )}

            {application.rejectionReason && (
              <InfoItem
                label="Rejection Reason"
                value={application.rejectionReason}
                full
              />
            )}
          </InfoSection>
        </div>
      </section>
    </main>
  );
}

function InfoSection({ title, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h2 className="mb-6 text-lg font-bold text-slate-900">
        {title}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function InfoItem({ label, value, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}