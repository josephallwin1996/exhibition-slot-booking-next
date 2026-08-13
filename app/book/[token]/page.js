"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExhibitionLayout from "@/components/ExhibitionLayout";
import AddOnSelector from "@/components/AddOnSelector";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState("");
  const [addOns, setAddOns] = useState([]);
  const [addOnSelections, setAddOnSelections] = useState({});
  const [addOnsLoading, setAddOnsLoading] = useState(true);
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
  async function loadBooking() {
    try {
      setLoading(true);
      setSlotsLoading(true);

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

      setApplication(bookingData.application);

      const slotsResponse = await fetch(
        `/api/booking/${params.token}/slots`,
        {
          cache: "no-store",
        }
      );

      const slotsData = await slotsResponse.json();

      if (!slotsResponse.ok) {
        setError(
          slotsData.message ||
            "Unable to load exhibition slots."
        );

        return;
      }

      setSlots(slotsData.slots);

      const addOnsResponse = await fetch(
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

      setAddOns(addOnsData.addOns);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load your booking information."
      );
    } finally {
      setLoading(false);
      setSlotsLoading(false);
      setAddOnsLoading(false);
    }
  }

  if (params.token) {
    loadBooking();
  }
}, [params.token]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center text-white">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-white" />

          <p className="mt-5 text-sm text-slate-400">
            Validating your booking link...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Booking Link Invalid
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <p className="mt-6 text-xs leading-5 text-slate-400">
            If you believe this is an error, please contact the
            exhibition organizers.
          </p>
        </div>
      </main>
    );
  }

  async function reserveSelectedSlot() {
    if (!selectedSlot) {
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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            slotId:
              selectedSlot._id,
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
      * Refresh slots so the UI reflects
      * the reservation.
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
          slotsData.slots
        );
      }
    } catch (error) {
      console.error(error);

      setReservationError(
        error.message
      );
    } finally {
      setReserving(false);
    }
  }

  async function confirmBooking() {
  if (!reservation) {
    return;
  }

  try {
    setConfirmingBooking(true);
    setBookingError("");

    const addOnsPayload = Object.entries(
      addOnSelections
    )
      .filter(
        ([, quantity]) =>
          Number(quantity) > 0
      )
      .map(
        ([addOnId, quantity]) => ({
          addOnId,
          quantity: Number(quantity),
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

    setConfirmedBooking(
      data.booking
    );
    
  } catch (error) {
    console.error(error);

    setBookingError(
      error.message
    );
  } finally {
    setConfirmingBooking(false);
  }
  }

  function handleAddOnChange(
    addOn,
    quantity
  ) {
    setAddOnSelections((current) => {
      const next = {
        ...current,
      };

      if (quantity <= 0) {
        delete next[addOn._id];
      } else {
        next[addOn._id] = quantity;
      }

      return next;
    });
  }

  const addOnTotal = addOns.reduce(
    (total, addOn) => {
      const quantity =
        addOnSelections[addOn._id] || 0;

      return (
        total +
        Number(addOn.price) *
          quantity
      );
    },
    0
  );

  const slotPrice = selectedSlot
    ? Number(selectedSlot.price)
    : 0;

  const grandTotal =
    slotPrice + addOnTotal;
  console.log("Rendering ExhibitionLayout with slots:", application)
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 px-6 py-12 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
          Exhibition 2026
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Stall Booking
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
          Your application has been approved. You can now
          continue with your stall booking.
        </p>
      </header>

      <section className="px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* Approved */}
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                ✓
              </div>

              <div>
                <h2 className="font-bold text-green-900">
                  Application Approved
                </h2>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Your application has been approved by the
                  exhibition organizers.
                </p>
              </div>
            </div>
          </div>

          {/* Exhibitor */}
          <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
            <div className="border-b border-slate-200 pb-6">
              <p className="text-sm font-medium text-slate-500">
                Welcome
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {application.businessName}
              </h2>
            </div>

            <div className="grid gap-6 py-6 sm:grid-cols-2">
              <InfoItem
                label="Contact Person"
                value={application.contactPerson}
              />

              <InfoItem
                label="Category"
                value={application.category}
              />

              <InfoItem
                label="Email"
                value={application.email}
              />

              <InfoItem
                label="Mobile"
                value={application.mobile}
              />
            </div>

            {/* Coming in Part 2 */}
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <div className="mt-8">
  <div className="mb-6">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
      Step 1
    </p>

    <h3 className="mt-2 text-2xl font-bold text-slate-900">
      Select Your Stall
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Choose an available stall from the exhibition floor
      plan below.
    </p>
  </div>

  {slotsLoading ? (
    <div className="rounded-2xl bg-slate-50 p-12 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-950" />

      <p className="mt-4 text-sm text-slate-500">
        Loading available stalls...
      </p>
    </div>
  ) : (
    <ExhibitionLayout
      slots={slots}
      selectedSlot={selectedSlot}
      categoryId={
        application?.categoryId
      }
      categoryName={
        application?.category?.name ||
        application?.categoryName ||
        application?.category
      }
      onSelect={(slot) => {
        setSelectedSlot(slot);
      }}
    />
  )}

  {selectedSlot && (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">
        Selected Stall
      </p>

      <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h4 className="text-xl font-bold text-slate-900">
            Stall {selectedSlot.slotNumber}
          </h4>

          <p className="mt-1 text-sm text-slate-600">
            {selectedSlot.category.name}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-500">
            Stall Price
          </p>

          <p className="text-xl font-bold text-slate-900">
            ₹
            {Number(
              selectedSlot.price
            ).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {reservation && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
              ✓
            </div>

            <div>
              <h3 className="font-bold text-green-900">
                Stall Reserved
              </h3>

              <p className="mt-1 text-sm leading-6 text-green-700">
                Stall{" "}
                <strong>
                  {reservation.slotNumber}
                </strong>{" "}
                has been temporarily reserved for you.
              </p>

              <p className="mt-3 text-xs text-green-700">
                Your reservation expires at{" "}
                {new Date(
                  reservation.expiresAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {reservation && (
        <div className="mt-10">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
              Step 2
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              Customize Your Stall
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select any additional products or services you
              need for your exhibition stall.
            </p>
          </div>

          {addOnsLoading ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-950" />

              <p className="mt-4 text-sm text-slate-500">
                Loading add-ons...
              </p>
            </div>
          ) : (
            <AddOnSelector
              addOns={addOns}
              selections={addOnSelections}
              onChange={handleAddOnChange}
            />
          )}
        </div>
      )}

      {reservation && (
          <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Order Summary
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-300">
                  Stall {reservation.slotNumber}
                </span>

                <span className="font-semibold">
                  ₹
                  {Number(
                    reservation.price
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              {addOns
                .filter(
                  (addOn) =>
                    addOnSelections[
                      addOn._id
                    ] > 0
                )
                .map((addOn) => {
                  const quantity =
                    addOnSelections[
                      addOn._id
                    ];

                  const total =
                    Number(addOn.price) *
                    quantity;

                  return (
                    <div
                      key={addOn._id}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-sm text-slate-300">
                        {addOn.name} ×{" "}
                        {quantity}
                      </span>

                      <span className="font-semibold">
                        ₹
                        {total.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  );
                })}

              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Add-ons
                  </span>

                  <span className="font-semibold">
                    ₹
                    {addOnTotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-amber-400">
                    ₹
                    {grandTotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={confirmBooking}
              disabled={confirmingBooking}
              className="mt-7 w-full rounded-xl bg-white px-6 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmingBooking
                ? "Creating Booking..."
                : "Confirm Booking"}
          </button>
          
          {bookingError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bookingError}
            </div>
          )}

          {confirmedBooking && (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-green-700">
                    Booking Created
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-green-950">
                    {confirmedBooking.bookingReference}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    Your stall has been successfully reserved.
                    Payment will be completed in the next step.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-green-200 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">
                    Stall
                  </span>

                  <span className="font-bold text-green-950">
                    {confirmedBooking.slotNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-green-800">
                    Total
                  </span>

                  <span className="text-xl font-bold text-green-950">
                    ₹
                    {Number(
                      confirmedBooking.total
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <button
            type="button"
            onClick={() =>
              router.push(
                `/book/${params.token}/payment`
              )
            }
            className="mt-6 w-full rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white hover:bg-slate-800"
          >
            Proceed to Payment
          </button>
            </div>
            
          )}
          </div>
        )}

      {reservationError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {reservationError}
        </div>
      )}
      {!reservation && (
        <button
        type="button"
        onClick={reserveSelectedSlot}
        disabled={reserving}
        className="mt-5 w-full rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {reserving
          ? "Reserving Stall..."
          : `Continue with Stall ${selectedSlot.slotNumber}`}
      </button>
      )}
      
    </div>
  )}
</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}
