"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationDetailsPage({
  params,
}) {
  const router = useRouter();

  const [application, setApplication] =
    useState(null);

  const [slots, setSlots] = useState([]);

  const [selectedSlotIds, setSelectedSlotIds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showReject, setShowReject] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState("");

  /*
   * =====================================================
   * LOAD APPLICATION
   * =====================================================
   */

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        const response = await fetch(
          `/api/admin/applications/${id}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load application."
          );
        }

        setApplication(
          data.application
        );

        /*
         * If the application already has assigned
         * slots, initialize the selection.
         */
        if (
          Array.isArray(
            data.application
              ?.allowedSlotIds
          )
        ) {
          setSelectedSlotIds(
            data.application.allowedSlotIds.map(
              (slot) =>
                typeof slot === "string"
                  ? slot
                  : slot._id
            )
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load application."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [params]);

  /*
   * =====================================================
   * LOAD AVAILABLE SLOTS
   * =====================================================
   */

  useEffect(() => {
    if (!application?.categoryId?._id) {
      return;
    }

    /*
     * Only load slots while the application is
     * pending. Once approved, the saved assigned
     * slots are displayed from the application.
     */
    if (
      application.status !==
      "pending"
    ) {
      return;
    }

    async function loadSlots() {
      try {
        setLoadingSlots(true);

        const categoryId =
          application.categoryId._id;

        const response = await fetch(
          `/api/admin/slots?category=${categoryId}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load slots."
          );
        }

        setSlots(
          Array.isArray(data.slots)
            ? data.slots
            : []
        );
      } catch (err) {
        console.error(
          "Load slots error:",
          err
        );

        setError(
          err.message ||
            "Unable to load available slots."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [
    application?.categoryId?._id,
    application?.status,
  ]);

  /*
   * =====================================================
   * TOGGLE SLOT
   * =====================================================
   */

  function toggleSlot(slot) {
    if (
      !slot ||
      slot.status !== "available"
    ) {
      return;
    }

    const slotId =
      String(slot._id);

    setSelectedSlotIds(
      (current) => {
        if (
          current.includes(slotId)
        ) {
          return current.filter(
            (id) => id !== slotId
          );
        }

        return [
          ...current,
          slotId,
        ];
      }
    );
  }

  /*
   * =====================================================
   * APPROVE
   * =====================================================
   */

  async function handleApprove() {
    if (
      selectedSlotIds.length === 0
    ) {
      setError(
        "Please select at least one stall before approving the application."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Approve this application with ${selectedSlotIds.length} selected stall${
          selectedSlotIds.length === 1
            ? ""
            : "s"
        }?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const { id } = await params;

      const response =
        await fetch(
          `/api/admin/applications/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "approve",

              selectedSlotIds,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to approve application."
        );
      }

      setSuccess(
        "Application approved successfully."
      );

      /*
       * Update the local application state
       * instead of immediately leaving the page.
       */
      setApplication(
        (current) => ({
          ...current,

          status: "approved",

          bookingToken:
            data.application
              ?.bookingToken,

          allowedSlotIds:
            data.application
              ?.allowedSlotIds ||
            selectedSlotIds,
        })
      );

      /*
       * Hide selection UI after approval.
       */
      setSlots([]);
    } catch (err) {
      console.error(
        "Approval error:",
        err
      );

      setError(
        err.message ||
          "Unable to approve application."
      );
    } finally {
      setProcessing(false);
    }
  }

  /*
   * =====================================================
   * REJECT
   * =====================================================
   */

  async function handleReject() {
    if (
      !rejectionReason.trim()
    ) {
      setError(
        "Please provide a rejection reason."
      );

      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const { id } = await params;

      const response =
        await fetch(
          `/api/admin/applications/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "reject",

              rejectionReason:
                rejectionReason.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to reject application."
        );
      }

      setSuccess(
        "Application rejected successfully."
      );

      setApplication(
        (current) => ({
          ...current,

          status: "rejected",

          rejectionReason:
            rejectionReason.trim(),

          allowedSlotIds: [],
        })
      );

      setShowReject(false);
    } catch (err) {
      console.error(
        "Rejection error:",
        err
      );

      setError(
        err.message ||
          "Unable to reject application."
      );
    } finally {
      setProcessing(false);
    }
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-[#eadfce]" />

            <div className="h-48 rounded-2xl bg-white shadow-sm" />

            <div className="h-64 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (!application) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error ||
              "Application not found."}
          </div>
        </div>
      </div>
    );
  }

  const categoryName =
    application.categoryId
      ?.name ||
    application.categoryName ||
    "—";

  const assignedSlots =
    Array.isArray(
      application.allowedSlotIds
    )
      ? application.allowedSlotIds
      : [];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#7d1727] transition hover:opacity-70"
          >
            <span>←</span>
            Back to applications
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a77932]">
                Application
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-[#3d3027] sm:text-3xl">
                {application.businessName}
              </h1>

              <p className="mt-1 text-sm text-[#75675b]">
                {application.contactPerson ||
                  "No contact person"}{" "}
                · {categoryName}
              </p>
            </div>

            <StatusBadge
              status={
                application.status
              }
            />
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* =================================================
            APPLICATION INFORMATION
        ================================================= */}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-[#3d3027]">
                  Application details
                </h2>

                <p className="mt-1 text-sm text-[#75675b]">
                  Information submitted by
                  the applicant.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Business name"
                  value={
                    application.businessName
                  }
                />

                <InfoItem
                  label="Contact person"
                  value={
                    application.contactPerson ||
                    "—"
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    application.email
                  }
                />

                <InfoItem
                  label="Mobile"
                  value={
                    application.mobile
                  }
                />

                <InfoItem
                  label="Category"
                  value={
                    categoryName
                  }
                />

                <InfoItem
                  label="Submitted"
                  value={formatDate(
                    application.createdAt
                  )}
                />
              </div>

              {application.description && (
                <div className="mt-5 border-t border-[#eee4d7] pt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8b7a6b]">
                    Description
                  </p>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#51463d]">
                    {
                      application.description
                    }
                  </p>
                </div>
              )}
            </section>

            {/* =================================================
                STALL ASSIGNMENT
            ================================================= */}

            {application.status ===
              "pending" && (
              <section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#3d3027]">
                      Stall allocation
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-5 text-[#75675b]">
                      Select the stalls this
                      applicant will be allowed
                      to choose from during
                      booking.
                    </p>
                  </div>

                  <div className="rounded-full bg-[#f7efe2] px-3 py-1.5 text-sm font-semibold text-[#7d1727]">
                    {
                      selectedSlotIds.length
                    }{" "}
                    selected
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {Array.from({
                      length: 8,
                    }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-24 animate-pulse rounded-xl bg-[#f3ede4]"
                        />
                      )
                    )}
                  </div>
                ) : slots.length ===
                  0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9cbb9] bg-[#fcfaf7] px-5 py-8 text-center">
                    <p className="font-medium text-[#51463d]">
                      No stalls found
                    </p>

                    <p className="mt-1 text-sm text-[#8b7a6b]">
                      There are no stalls
                      available for this
                      category.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {slots.map(
                        (slot) => {
                          const slotId =
                            String(
                              slot._id
                            );

                          const isSelected =
                            selectedSlotIds.includes(
                              slotId
                            );

                          const isAvailable =
                            slot.status ===
                            "available";

                          return (
                            <button
                              key={
                                slot._id
                              }
                              type="button"
                              disabled={
                                !isAvailable
                              }
                              onClick={() =>
                                toggleSlot(
                                  slot
                                )
                              }
                              className={[
                                "relative min-h-24 rounded-xl border p-3 text-left transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-[#a77932]/40",
                                isAvailable
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed opacity-50",
                                isSelected
                                  ? "border-[#7d1727] bg-[#7d1727] text-white shadow-md"
                                  : isAvailable
                                  ? "border-[#e2d6c6] bg-[#fcfaf7] text-[#3d3027] hover:-translate-y-0.5 hover:border-[#a77932] hover:shadow-sm"
                                  : "border-[#e5ddd2] bg-[#f1ede7] text-[#81766c]",
                              ].join(
                                " "
                              )}
                            >
                              {isSelected && (
                                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#7d1727]">
                                  ✓
                                </span>
                              )}

                              <div className="flex h-full flex-col justify-between">
                                <div>
                                  <p
                                    className={[
                                      "text-base font-bold",
                                      isSelected
                                        ? "text-white"
                                        : "",
                                    ].join(
                                      " "
                                    )}
                                  >
                                    {
                                      slot.slotNumber
                                    }
                                  </p>

                                  <p
                                    className={[
                                      "mt-1 text-xs",
                                      isSelected
                                        ? "text-white/75"
                                        : "text-[#8b7a6b]",
                                    ].join(
                                      " "
                                    )}
                                  >
                                    ₹
                                    {Number(
                                      slot.price ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>

                                {!isAvailable && (
                                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                                    {
                                      slot.status
                                    }
                                  </p>
                                )}

                                {isAvailable &&
                                  !isSelected && (
                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#a77932]">
                                      Available
                                    </p>
                                  )}

                                {isSelected && (
                                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/80">
                                    Allowed
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#eee4d7] pt-4 text-xs text-[#75675b]">
                      <Legend
                        className="bg-[#fcfaf7] border-[#e2d6c6]"
                        label="Available"
                      />

                      <Legend
                        className="bg-[#7d1727] border-[#7d1727]"
                        label="Selected"
                      />

                      <Legend
                        className="bg-[#f1ede7] border-[#e5ddd2]"
                        label="Unavailable"
                      />
                    </div>
                  </>
                )}
              </section>
            )}

            {/* =================================================
                ASSIGNED SLOTS AFTER APPROVAL
            ================================================= */}

            {application.status ===
              "approved" && (
              <section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-[#3d3027]">
                    Assigned stalls
                  </h2>

                  <p className="mt-1 text-sm text-[#75675b]">
                    The applicant can choose
                    one stall from this list.
                  </p>
                </div>

                {assignedSlots.length ===
                0 ? (
                  <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700">
                    No stalls have been assigned
                    to this application.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {assignedSlots.map(
                      (slot) => {
                        const slotNumber =
                          typeof slot ===
                          "string"
                            ? slot
                            : slot.slotNumber;

                        return (
                          <div
                            key={
                              typeof slot ===
                              "string"
                                ? slot
                                : slot._id
                            }
                            className="rounded-xl border border-[#e2d6c6] bg-[#fcfaf7] px-4 py-3"
                          >
                            <p className="font-bold text-[#7d1727]">
                              {slotNumber}
                            </p>

                            {typeof slot !==
                              "string" &&
                              slot.price !=
                                null && (
                                <p className="mt-0.5 text-xs text-[#8b7a6b]">
                                  ₹
                                  {Number(
                                    slot.price
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a77932]">
                Status
              </p>

              <div className="mt-3">
                <StatusBadge
                  status={
                    application.status
                  }
                />
              </div>

              {application.approvedAt && (
                <p className="mt-3 text-xs text-[#8b7a6b]">
                  Approved{" "}
                  {formatDate(
                    application.approvedAt
                  )}
                </p>
              )}

              {application.rejectedAt && (
                <div className="mt-3">
                  <p className="text-xs text-[#8b7a6b]">
                    Rejected{" "}
                    {formatDate(
                      application.rejectedAt
                    )}
                  </p>

                  {application.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm leading-5 text-red-700">
                      {
                        application.rejectionReason
                      }
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                ACTIONS
            ================================================= */}

            {application.status ===
              "pending" && (
              <section className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">
                {!showReject ? (
                  <>
                    <button
                      type="button"
                      disabled={
                        processing ||
                        selectedSlotIds.length ===
                          0
                      }
                      onClick={
                        handleApprove
                      }
                      className="w-full rounded-xl bg-[#7d1727] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#68131f] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {processing
                        ? "Processing..."
                        : `Approve Application${
                            selectedSlotIds.length
                              ? ` (${selectedSlotIds.length} stalls)`
                              : ""
                          }`}
                    </button>

                    {selectedSlotIds.length ===
                      0 && (
                      <p className="mt-2 text-center text-xs text-[#9a8d80]">
                        Select at least one
                        stall to approve.
                      </p>
                    )}

                    <div className="my-4 border-t border-[#eee4d7]" />

                    <button
                      type="button"
                      disabled={
                        processing
                      }
                      onClick={() =>
                        setShowReject(
                          true
                        )
                      }
                      className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject Application
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-[#3d3027]">
                      Reject application
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#75675b]">
                      Please provide a reason
                      for the applicant.
                    </p>

                    <textarea
                      value={
                        rejectionReason
                      }
                      onChange={(event) =>
                        setRejectionReason(
                          event.target
                            .value
                        )
                      }
                      rows={5}
                      placeholder="Enter rejection reason..."
                      className="mt-4 w-full resize-none rounded-xl border border-[#ddd1c1] bg-[#fcfaf7] px-3 py-3 text-sm text-[#3d3027] outline-none transition placeholder:text-[#a89b8e] focus:border-[#a77932] focus:ring-2 focus:ring-[#a77932]/10"
                    />

                    <button
                      type="button"
                      disabled={
                        processing ||
                        !rejectionReason.trim()
                      }
                      onClick={
                        handleReject
                      }
                      className="mt-3 w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {processing
                        ? "Processing..."
                        : "Confirm Rejection"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        processing
                      }
                      onClick={() => {
                        setShowReject(
                          false
                        );

                        setRejectionReason(
                          ""
                        );

                        setError("");
                      }}
                      className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-medium text-[#75675b] transition hover:bg-[#f7f1e8]"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * INFO ITEM
 * =========================================================
 */

function InfoItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9a8d80]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-[#3d3027]">
        {value || "—"}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * STATUS BADGE
 * =========================================================
 */

function StatusBadge({
  status,
}) {
  const config = {
    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    approved: {
      label: "Approved",
      className:
        "bg-green-50 text-green-700 border-green-200",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
  };

  const current =
    config[status] ||
    config.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${current.className}`}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
      {current.label}
    </span>
  );
}

/*
 * =========================================================
 * LEGEND
 * =========================================================
 */

function Legend({
  className,
  label,
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded border ${className}`}
      />

      <span>{label}</span>
    </span>
  );
}

/*
 * =========================================================
 * DATE FORMAT
 * =========================================================
 */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "—";
  }
}