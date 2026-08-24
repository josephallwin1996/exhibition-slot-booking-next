"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ExhibitionLayout from "@/components/ExhibitionLayout";
import AddOnSelector from "@/components/AddOnSelector";
import TermsAndConditions from "@/components/booking/TermsAndConditions";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();

  const [application, setApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingStatus, setBookingStatus] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const [reserving, setReserving] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState("");

  const [addOns, setAddOns] = useState([]);
  const [addOnSelections, setAddOnSelections] = useState({});
  const [addOnsLoading, setAddOnsLoading] = useState(true);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [step, setStep] = useState(1);

  const [bookingError, setBookingError] = useState("");

  /*
   * ============================================================
   * LOAD BOOKING
   * ============================================================
   */

  useEffect(() => {
    async function loadBooking() {
      if (!params.token) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const bookingResponse = await fetch(
          `/api/booking/${params.token}`,
          {
            cache: "no-store",
          }
        );

        const bookingData =
          await bookingResponse.json();

        if (!bookingResponse.ok) {
          setError(
            bookingData.message ||
              "Invalid booking link."
          );

          return;
        }

        setApplication(
          bookingData.application
        );

        const currentBookingStatus =
          bookingData.bookingstatus || null;

        setBookingStatus(
          currentBookingStatus
        );

        setExistingBooking(
          bookingData.booking || null
        );

        /*
         * Paid users must never load
         * the booking selection UI.
         */

        if (
          String(currentBookingStatus).toLowerCase() ===
          "paid"
        ) {
          return;
        }

        /*
         * Load slots.
         */

        setSlotsLoading(true);

        const slotsResponse = await fetch(
          `/api/booking/${params.token}/slots`,
          {
            cache: "no-store",
          }
        );

        const slotsData =
          await slotsResponse.json();

        if (!slotsResponse.ok) {
          setError(
            slotsData.message ||
              "Unable to load exhibition slots."
          );

          return;
        }

        setSlots(
          slotsData.slots || []
        );

        /*
         * Load add-ons.
         */

        setAddOnsLoading(true);

        const addOnsResponse =
          await fetch(
            `/api/booking/${params.token}/addons`,
            {
              cache: "no-store",
            }
          );

        const addOnsData =
          await addOnsResponse.json();

        if (!addOnsResponse.ok) {
          setError(
            addOnsData.message ||
              "Unable to load add-ons."
          );

          return;
        }

        setAddOns(
          addOnsData.addOns || []
        );
      } catch (error) {
        console.error(
          "Booking page load error:",
          error
        );

        setError(
          "Unable to load your booking information."
        );
      } finally {
        setLoading(false);
        setSlotsLoading(false);
        setAddOnsLoading(false);
      }
    }

    loadBooking();
  }, [params.token]);

  /*
   * ============================================================
   * RESERVE SLOT
   * ============================================================
   */

  async function reserveSelectedSlot() {
    if (
      !selectedSlot ||
      bookingStatus === "paid"
    ) {
      return;
    }

    try {
      setReserving(true);
      setReservationError("");

      const response = await fetch(
        `/api/booking/${params.token}/reserve`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            slotId: selectedSlot._id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reserve stall."
        );
      }

      setReservation(
        data.reservation
      );

      /*
       * Refresh slots.
       */

      const slotsResponse =
        await fetch(
          `/api/booking/${params.token}/slots`,
          {
            cache: "no-store",
          }
        );

      const slotsData =
        await slotsResponse.json();

      if (slotsResponse.ok) {
        setSlots(
          slotsData.slots || []
        );
      }

      setStep(2);
    } catch (error) {
      console.error(error);

      setReservationError(
        error.message ||
          "Unable to reserve stall."
      );
    } finally {
      setReserving(false);
    }
  }

  /*
   * ============================================================
   * ADD-ONS
   * ============================================================
   */

  function handleAddOnChange(
    addOn,
    quantity
  ) {
    setAddOnSelections(
      (current) => {
        const next = {
          ...current,
        };

        if (quantity <= 0) {
          delete next[addOn._id];
        } else {
          next[addOn._id] =
            quantity;
        }

        return next;
      }
    );
  }

  /*
   * ============================================================
   * STEP NAVIGATION
   * ============================================================
   */

  function goToReview() {
    if (!reservation) {
      return;
    }

    setStep(3);
  }

  function goBack() {
    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  }

  /*
   * ============================================================
   * CONFIRM BOOKING
   * ============================================================
   */

  async function confirmBooking() {
    if (!reservation) {
      return false;
    }

    try {
      setBookingError("");

      const addOnsPayload =
        Object.entries(
          addOnSelections
        )
          .filter(
            ([, quantity]) =>
              Number(quantity) > 0
          )
          .map(
            ([addOnId, quantity]) => ({
              addOnId,
              quantity:
                Number(quantity),
            })
          );

      const response = await fetch(
        `/api/booking/${params.token}/confirm`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            reservationToken:
              reservation.token,

            addOns:
              addOnsPayload,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create booking."
        );
      }

      return true;
    } catch (error) {
      console.error(error);

      setBookingError(
        error.message ||
          "Unable to create booking."
      );

      return false;
    }
  }

  /*
   * ============================================================
   * PAYMENT
   * ============================================================
   */

  async function proceedToPayment() {
    if (
      !reservation ||
      bookingStatus === "paid"
    ) {
      return;
    }

    if (!termsAccepted) {
      setBookingError(
        "Please accept the Rules & Terms and Conditions before proceeding to payment."
      );

      return;
    }

    const bookingConfirmed =
      await confirmBooking();

    if (!bookingConfirmed) {
      return;
    }

    router.push(
      `/book/${params.token}/payment`
    );
  }

  /*
   * ============================================================
   * CALCULATIONS
   * ============================================================
   */

  const addOnTotal =
    addOns.reduce(
      (total, addOn) => {
        const quantity =
          Number(
            addOnSelections[
              addOn._id
            ] || 0
          );

        return (
          total +
          Number(addOn.price || 0) *
            quantity
        );
      },
      0
    );

  const slotPrice = selectedSlot
    ? Number(selectedSlot.price || 0)
    : reservation
      ? Number(
          reservation.price || 0
        )
      : 0;

  const grandTotal =
    slotPrice + addOnTotal;

  const categoryName =
    application?.categoryId?.name ||
    application?.category?.name ||
    application?.category ||
    "—";

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f1e6] px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#a77932]/30 bg-[#fffaf3]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7d1727]/15 border-t-[#7d1727]" />
          </div>

          <p className="mt-5 font-serif text-xl text-[#42151c]">
            Preparing your booking
          </p>

          <p className="mt-2 text-xs leading-5 text-[#806d64]">
            Validating your booking link...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f1e6] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-[#7d1727]/10 bg-[#fffaf3] p-6 text-center shadow-xl sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#7d1727] text-xl font-bold text-white">
            !
          </div>

          <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#7d1727]">
            Christmas Street '26
          </p>

          <h1 className="mt-2 font-serif text-2xl text-[#42151c]">
            Booking Link Invalid
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#806d64]">
            {error ||
              "Unable to load your booking information."}
          </p>

          <p className="mt-5 text-xs leading-5 text-[#a2948c]">
            If you believe this is an error,
            please contact the exhibition
            organizers.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * PAID BOOKING
   * ============================================================
   *
   * Paid customers get a completely read-only page.
   */

  if (
    String(bookingStatus).toLowerCase() ===
    "paid"
  ) {
    const paidBooking =
      existingBooking;

    return (
      <main className="min-h-screen bg-[#f8f1e6]">
        {/* Header */}

        <header className="border-b border-[#7d1727]/10 bg-[#fffaf3] px-5 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
              Christmas Street '26
            </p>

            <h1 className="mt-3 font-serif text-4xl leading-none text-[#7d1727] sm:text-5xl">
              Booking Confirmed
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#806d64]">
              Your stall has been successfully
              booked and your payment has been
              received.
            </p>
          </div>
        </header>

        <section className="px-4 py-6 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-3xl">
            {/* Success */}

            <div className="overflow-hidden rounded-[28px] border border-[#465337]/20 bg-[#465337] text-white shadow-xl">
              <div className="p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl">
                    ✓
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e7d4a4]">
                      Payment Successful
                    </p>

                    <h2 className="mt-1 font-serif text-2xl sm:text-3xl">
                      Your stall is confirmed
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Thank you for being part of
                      Christmas Street '26.
                    </p>
                  </div>
                </div>

                {paidBooking && (
                  <>
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
                        Booking Reference
                      </p>

                      <p className="mt-1 break-all text-lg font-bold sm:text-2xl">
                        {
                          paidBooking.bookingReference
                        }
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <BookingDetail
                        label="Stall"
                        value={
                          paidBooking.slotNumber ||
                          "—"
                        }
                      />

                      <BookingDetail
                        label="Payment"
                        value="Paid"
                        success
                      />

                      <BookingDetail
                        label="Stall Price"
                        value={formatCurrency(
                          paidBooking.slotPrice
                        )}
                      />

                      <BookingDetail
                        label="Add-ons"
                        value={formatCurrency(
                          paidBooking.addOnTotal ||
                            0
                        )}
                      />
                    </div>

                    {Array.isArray(
                      paidBooking.addOns
                    ) &&
                      paidBooking.addOns.length >
                        0 && (
                        <div className="mt-6 border-t border-white/10 pt-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
                            Selected Add-ons
                          </p>

                          <div className="mt-3 divide-y divide-white/10">
                            {paidBooking.addOns.map(
                              (
                                addOn,
                                index
                              ) => (
                                <div
                                  key={
                                    addOn._id ||
                                    addOn.addOnId ||
                                    index
                                  }
                                  className="flex items-center justify-between gap-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="break-words text-sm font-semibold">
                                      {
                                        addOn.name
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-white/50">
                                      Quantity:{" "}
                                      {
                                        addOn.quantity
                                      }
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-semibold">
                                    {formatCurrency(
                                      addOn.total ??
                                        Number(
                                          addOn.price ||
                                            0
                                        ) *
                                          Number(
                                            addOn.quantity ||
                                              0
                                          )
                                    )}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold">
                          Total Paid
                        </span>

                        <span className="font-serif text-2xl text-[#e7d4a4] sm:text-3xl">
                          {formatCurrency(
                            paidBooking.total
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Exhibitor */}

            <div className="mt-4 rounded-[24px] border border-[#7d1727]/10 bg-[#fffaf3] p-5 shadow-sm sm:p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#806d64]">
                Exhibitor
              </p>

              <h2 className="mt-1 break-words font-serif text-2xl text-[#42151c]">
                {application.businessName}
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <InfoItem
                  label="Contact"
                  value={
                    application.contactPerson
                  }
                />

                <InfoItem
                  label="Category"
                  value={categoryName}
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
              </div>
            </div>

            {/* Read only */}

            <div className="mt-4 rounded-[24px] border border-[#a77932]/30 bg-[#efe5d6] p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#7d1727] text-sm text-white">
                ✓
              </div>

              <h3 className="mt-3 font-serif text-xl text-[#42151c]">
                Booking Completed
              </h3>

              <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-[#806d64]">
                This booking is confirmed and
                paid. Stall selection and
                rebooking are no longer
                available through this link.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ============================================================
   * NORMAL BOOKING FLOW
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#f8f1e6] pb-28 text-[#42151c] sm:pb-10">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="border-b border-[#7d1727]/10 bg-[#fffaf3]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
              Christmas Street '26
            </p>

            <h1 className="mt-2 font-serif text-4xl leading-none text-[#7d1727] sm:text-5xl">
              Stall Booking
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-[#806d64] sm:text-sm">
              Your application has been approved.
              Select your stall, customize your
              booking and continue to payment.
            </p>
          </div>

          {/* Progress */}

          <div className="mx-auto mt-7 max-w-3xl">
            <div className="grid grid-cols-3 gap-2">
              <ProgressStep
                number="1"
                label="Stall"
                active={step === 1}
                completed={step > 1}
              />

              <ProgressStep
                number="2"
                label="Extras"
                active={step === 2}
                completed={step > 2}
              />

              <ProgressStep
                number="3"
                label="Review"
                active={step === 3}
                completed={false}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <section className="px-3 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {/* ==================================================
              EXHIBITOR CARD
          =================================================== */}

          <div className="mb-5 overflow-hidden rounded-[24px] border border-[#7d1727]/10 bg-[#fffaf3] shadow-sm">
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7d1727] font-serif text-xl text-white">
                {application.businessName
                  ?.charAt(0)
                  ?.toUpperCase() || "Y"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#806d64]">
                  Application Approved
                </p>

                <h2 className="mt-1 truncate font-serif text-xl text-[#42151c]">
                  {application.businessName}
                </h2>

                <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-[#806d64]">
                  <span>
                    {categoryName}
                  </span>

                  <span>•</span>

                  <span>
                    {application.contactPerson}
                  </span>
                </div>
              </div>

              <div className="hidden shrink-0 rounded-full bg-[#465337]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#465337] sm:block">
                Approved
              </div>
            </div>
          </div>

          {/* ==================================================
              STEP 1
          =================================================== */}

          {step === 1 && (
            <section className="overflow-hidden rounded-[28px] border border-[#7d1727]/10 bg-[#fffaf3] shadow-sm">
              <div className="border-b border-[#7d1727]/10 px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7d1727]">
                      Step 1 · Stall
                    </p>

                    <h2 className="mt-1 font-serif text-2xl text-[#42151c] sm:text-3xl">
                      Choose Your Stall
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-[#806d64] sm:text-sm">
                      The complete exhibition floor
                      plan is shown below. Only stalls
                      available for your approved
                      category can be selected.
                    </p>
                  </div>

                  <div className="hidden shrink-0 rounded-full border border-[#a77932]/30 bg-[#efe5d6] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#7d1727] sm:block">
                    {categoryName}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6">
                {slotsLoading ? (
                  <div className="rounded-2xl border border-[#7d1727]/10 bg-[#f8f1e6] p-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7d1727]/15 border-t-[#7d1727]" />

                    <p className="mt-4 text-sm text-[#806d64]">
                      Loading exhibition layout...
                    </p>
                  </div>
                ) : (
                  <ExhibitionLayout
                    slots={slots}
                    selectedSlot={
                      selectedSlot
                    }
                    categoryId={
                      application?.categoryId?._id
                    }
                    categoryName={
                      categoryName
                    }
                    onSelect={(slot) => {
                      setSelectedSlot(
                        slot
                      );

                      setReservationError(
                        ""
                      );
                    }}
                  />
                )}

                {selectedSlot && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#a77932]/40 bg-[#efe5d6]">
                    <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7d1727]">
                          Selected Stall
                        </p>

                        <p className="mt-1 font-serif text-xl text-[#42151c]">
                          Stall{" "}
                          {
                            selectedSlot.slotNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#806d64]">
                          {categoryName}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[9px] uppercase tracking-wide text-[#806d64]">
                          Stall Price
                        </p>

                        <p className="mt-1 font-serif text-xl text-[#7d1727]">
                          {formatCurrency(
                            selectedSlot.price
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {reservationError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {reservationError}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              STEP 2
          =================================================== */}

          {step === 2 && (
            <section className="overflow-hidden rounded-[28px] border border-[#7d1727]/10 bg-[#fffaf3] shadow-sm">
              <div className="border-b border-[#7d1727]/10 px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7d1727]">
                      Step 2 · Extras
                    </p>

                    <h2 className="mt-1 font-serif text-2xl text-[#42151c] sm:text-3xl">
                      Customize Your Stall
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-[#806d64] sm:text-sm">
                      Add optional products or services
                      to your booking.
                    </p>
                  </div>

                  {reservation && (
                    <div className="shrink-0 rounded-2xl bg-[#465337] px-3 py-2 text-right text-white">
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/60">
                        Reserved
                      </p>

                      <p className="font-serif text-lg">
                        {
                          reservation.slotNumber
                        }
                      </p>
                    </div>
                  )}
                </div>

                {reservation && (
                  <div className="mt-4 rounded-2xl border border-[#465337]/20 bg-[#465337]/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#465337] text-xs text-white">
                        ✓
                      </div>

                      <p className="text-xs leading-5 text-[#465337]">
                        Your stall is temporarily
                        reserved until{" "}
                        <strong>
                          {new Date(
                            reservation.expiresAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {addOnsLoading ? (
                  <div className="rounded-2xl border border-[#7d1727]/10 bg-[#f8f1e6] p-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7d1727]/15 border-t-[#7d1727]" />

                    <p className="mt-4 text-sm text-[#806d64]">
                      Loading available extras...
                    </p>
                  </div>
                ) : addOns.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#a77932]/40 bg-[#f8f1e6] p-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#efe5d6] text-[#7d1727]">
                      —
                    </div>

                    <h3 className="mt-4 font-serif text-xl text-[#42151c]">
                      No extras available
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#806d64]">
                      You can continue with your
                      stall booking.
                    </p>
                  </div>
                ) : (
                  <AddOnSelector
                    addOns={addOns}
                    selections={
                      addOnSelections
                    }
                    onChange={
                      handleAddOnChange
                    }
                  />
                )}

                {/* Current total */}

                <div className="mt-5 rounded-[24px] bg-[#7d1727] p-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">
                        Current Total
                      </p>

                      <p className="mt-1 font-serif text-3xl text-[#f2dfae]">
                        {formatCurrency(
                          grandTotal
                        )}
                      </p>
                    </div>

                    <div className="text-right text-xs leading-6 text-white/65">
                      <p>
                        Stall{" "}
                        {formatCurrency(
                          slotPrice
                        )}
                      </p>

                      <p>
                        Extras{" "}
                        {formatCurrency(
                          addOnTotal
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================================================
              STEP 3
          =================================================== */}

          {step === 3 && (
            <section className="space-y-4">
              {/* Review */}

              <div className="overflow-hidden rounded-[28px] border border-[#7d1727]/10 bg-[#fffaf3] shadow-sm">
                <div className="border-b border-[#7d1727]/10 px-4 py-5 sm:px-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7d1727]">
                    Step 3 · Review
                  </p>

                  <h2 className="mt-1 font-serif text-2xl text-[#42151c] sm:text-3xl">
                    Review Your Booking
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-[#806d64] sm:text-sm">
                    Check everything carefully before
                    proceeding to payment.
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Stall */}

                  <div className="rounded-2xl border border-[#7d1727]/10 bg-[#f8f1e6] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#806d64]">
                          Stall
                        </p>

                        <p className="mt-1 font-serif text-xl text-[#42151c]">
                          Stall{" "}
                          {
                            reservation?.slotNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#806d64]">
                          {categoryName}
                        </p>
                      </div>

                      <p className="shrink-0 font-serif text-lg text-[#7d1727]">
                        {formatCurrency(
                          slotPrice
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Add-ons */}

                  <div className="mt-3 rounded-2xl border border-[#7d1727]/10 bg-[#f8f1e6] p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#806d64]">
                        Add-ons
                      </p>

                      <p className="text-xs font-bold text-[#7d1727]">
                        {formatCurrency(
                          addOnTotal
                        )}
                      </p>
                    </div>

                    {addOns.filter(
                      (addOn) =>
                        Number(
                          addOnSelections[
                            addOn._id
                          ] || 0
                        ) > 0
                    ).length === 0 ? (
                      <p className="mt-3 text-sm text-[#806d64]">
                        No add-ons selected.
                      </p>
                    ) : (
                      <div className="mt-3 divide-y divide-[#7d1727]/10">
                        {addOns
                          .filter(
                            (addOn) =>
                              Number(
                                addOnSelections[
                                  addOn._id
                                ] || 0
                              ) > 0
                          )
                          .map(
                            (addOn) => {
                              const quantity =
                                Number(
                                  addOnSelections[
                                    addOn._id
                                  ]
                                );

                              const total =
                                Number(
                                  addOn.price
                                ) *
                                quantity;

                              return (
                                <div
                                  key={
                                    addOn._id
                                  }
                                  className="flex items-center justify-between gap-4 py-3"
                                >
                                  <span className="min-w-0 text-sm text-[#62524b]">
                                    {
                                      addOn.name
                                    }{" "}
                                    ×{" "}
                                    {
                                      quantity
                                    }
                                  </span>

                                  <span className="shrink-0 text-sm font-bold text-[#42151c]">
                                    {formatCurrency(
                                      total
                                    )}
                                  </span>
                                </div>
                              );
                            }
                          )}
                      </div>
                    )}
                  </div>

                  {/* Total */}

                  <div className="mt-4 rounded-[24px] bg-[#7d1727] p-5 text-white">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-white/70">
                        Stall
                      </span>

                      <span>
                        {formatCurrency(
                          slotPrice
                        )}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-sm text-white/70">
                        Add-ons
                      </span>

                      <span>
                        {formatCurrency(
                          addOnTotal
                        )}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-white/15 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold">
                          Total
                        </span>

                        <span className="font-serif text-3xl text-[#f2dfae]">
                          {formatCurrency(
                            grandTotal
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  TERMS
              ================================================== */}

              <div className="rounded-[28px] border border-[#7d1727]/10 bg-[#fffaf3] p-4 shadow-sm sm:p-6">
                <div className="mb-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7d1727]">
                    Before Payment
                  </p>

                  <h3 className="mt-1 font-serif text-xl text-[#42151c]">
                    Rules & Terms
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#806d64]">
                    Please read and accept the rules
                    before continuing to payment.
                  </p>
                </div>

                <TermsAndConditions
                  accepted={
                    termsAccepted
                  }
                  onChange={
                    setTermsAccepted
                  }
                />

                {!termsAccepted && (
                  <div className="mt-4 rounded-2xl border border-[#a77932]/40 bg-[#efe5d6] px-4 py-3">
                    <p className="text-xs leading-5 text-[#7d1727]">
                      Please accept the Rules &
                      Terms and Conditions before
                      proceeding to payment.
                    </p>
                  </div>
                )}

                {bookingError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {bookingError}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              DESKTOP NAVIGATION
          =================================================== */}

          <div className="mt-5 hidden items-center justify-between gap-4 sm:flex">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="rounded-full border border-[#7d1727]/15 bg-[#fffaf3] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#62524b] transition hover:bg-white disabled:invisible"
            >
              ← Back
            </button>

            <DesktopNextButton
              step={step}
              selectedSlot={
                selectedSlot
              }
              reservation={
                reservation
              }
              termsAccepted={
                termsAccepted
              }
              reserving={reserving}
              onReserve={
                reserveSelectedSlot
              }
              onReview={
                goToReview
              }
              onPayment={
                proceedToPayment
              }
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          MOBILE STICKY ACTION BAR
      ======================================================= */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#7d1727]/10 bg-[#fffaf3]/95 px-3 py-3 shadow-[0_-10px_35px_rgba(66,21,28,0.12)] backdrop-blur sm:hidden">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#806d64]">
                {step === 1
                  ? "Select stall"
                  : step === 2
                    ? "Customize"
                    : "Review & payment"}
              </p>

              {step > 1 && (
                <p className="font-serif text-lg text-[#7d1727]">
                  {formatCurrency(
                    grandTotal
                  )}
                </p>
              )}
            </div>

            {step > 1 && (
              <span className="rounded-full bg-[#efe5d6] px-3 py-1.5 text-[10px] font-bold text-[#7d1727]">
                {reservation
                  ? `Stall ${reservation.slotNumber}`
                  : ""}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-2xl border border-[#7d1727]/15 bg-white px-4 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
              >
                Back
              </button>
            )}

            <MobileNextButton
              step={step}
              selectedSlot={
                selectedSlot
              }
              reservation={
                reservation
              }
              termsAccepted={
                termsAccepted
              }
              reserving={reserving}
              onReserve={
                reserveSelectedSlot
              }
              onReview={
                goToReview
              }
              onPayment={
                proceedToPayment
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * INFO ITEM
 * ============================================================
 */

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#806d64]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-[#42151c]">
        {value || "—"}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * BOOKING DETAIL
 * ============================================================
 */

function BookingDetail({
  label,
  value,
  success = false,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-base font-bold ${
          success
            ? "text-[#9bd18b]"
            : "text-white"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * PROGRESS STEP
 * ============================================================
 */

function ProgressStep({
  number,
  label,
  active,
  completed,
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-2 ${
        active
          ? "border-[#7d1727] bg-[#7d1727] text-white"
          : completed
            ? "border-[#465337]/20 bg-[#465337]/10 text-[#465337]"
            : "border-[#7d1727]/10 bg-[#f8f1e6] text-[#a2948c]"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? "bg-[#f2dfae] text-[#7d1727]"
            : completed
              ? "bg-[#465337] text-white"
              : "bg-white text-[#a2948c]"
        }`}
      >
        {completed
          ? "✓"
          : number}
      </div>

      <span className="truncate text-[10px] font-bold uppercase tracking-[0.08em]">
        {label}
      </span>
    </div>
  );
}

/*
 * ============================================================
 * DESKTOP NEXT BUTTON
 * ============================================================
 */

function DesktopNextButton({
  step,
  selectedSlot,
  reservation,
  termsAccepted,
  reserving,
  onReserve,
  onReview,
  onPayment,
}) {
  if (step === 1) {
    return (
      <button
        type="button"
        onClick={onReserve}
        disabled={
          !selectedSlot ||
          reserving
        }
        className="rounded-full bg-[#7d1727] px-7 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#65121f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {reserving
          ? "Reserving Stall..."
          : selectedSlot
            ? `Reserve Stall ${selectedSlot.slotNumber} →`
            : "Select a Stall"}
      </button>
    );
  }

  if (step === 2) {
    return (
      <button
        type="button"
        onClick={onReview}
        disabled={!reservation}
        className="rounded-full bg-[#7d1727] px-7 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#65121f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Review Booking →
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPayment}
      disabled={
        !reservation ||
        !termsAccepted
      }
      className="rounded-full bg-[#465337] px-7 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#38442c] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Proceed to Payment →
    </button>
  );
}

/*
 * ============================================================
 * MOBILE NEXT BUTTON
 * ============================================================
 */

function MobileNextButton({
  step,
  selectedSlot,
  reservation,
  termsAccepted,
  reserving,
  onReserve,
  onReview,
  onPayment,
}) {
  if (step === 1) {
    return (
      <button
        type="button"
        onClick={onReserve}
        disabled={
          !selectedSlot ||
          reserving
        }
        className="flex-1 rounded-2xl bg-[#7d1727] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {reserving
          ? "Reserving..."
          : selectedSlot
            ? `Reserve Stall ${selectedSlot.slotNumber}`
            : "Select a Stall"}
      </button>
    );
  }

  if (step === 2) {
    return (
      <button
        type="button"
        onClick={onReview}
        disabled={!reservation}
        className="flex-1 rounded-2xl bg-[#7d1727] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Review Booking
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPayment}
      disabled={
        !reservation ||
        !termsAccepted
      }
      className="flex-1 rounded-2xl bg-[#465337] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Proceed to Payment
    </button>
  );
}

/*
 * ============================================================
 * CURRENCY
 * ============================================================
 */

function formatCurrency(value) {
  const amount = Number(
    value || 0
  );

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}