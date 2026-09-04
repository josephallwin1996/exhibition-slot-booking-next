"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/booking/${token}/payment`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load booking."
        );
      }

      setBooking(data.booking);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load booking."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    try {
      setPaying(true);
      setError("");

      /*
       * Step 1:
       * Create/get Cashfree order.
       */
      const response = await fetch(
        "/api/payment/create-order-cashfree",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            bookingReference:
              booking.bookingReference,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create payment order."
        );
      }

      /*
       * Step 2:
       * Open Cashfree Checkout.
       */
      await openCashfreeCheckout(
        data.order
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to start payment."
      );

      setPaying(false);
    }
  }

  async function openCashfreeCheckout(
    order
  ) {
    try {
      /*
       * Dynamically import Cashfree so
       * it only loads on the client.
       */
      const { load } =
        await import(
          "@cashfreepayments/cashfree-js"
        );

      const cashfree =
        await load({
          mode:
            process.env
              .NEXT_PUBLIC_CASHFREE_ENVIRONMENT ===
            "production"
              ? "production"
              : "sandbox",
        });

      if (!cashfree) {
        throw new Error(
          "Unable to load Cashfree payment system."
        );
      }

      /*
       * Cashfree Hosted Checkout.
       */
      const result =
        await cashfree.checkout({
          paymentSessionId:
            order.paymentSessionId,

          redirectTarget:
            "_self",
        });

      /*
       * In redirect mode Cashfree will
       * navigate the browser to the
       * return URL.
       *
       * If Cashfree reports an immediate
       * checkout error, show it here.
       */
      if (
        result?.error
      ) {
        throw new Error(
          result.error.message ||
            "Unable to open Cashfree checkout."
        );
      }
    } catch (error) {
      console.error(
        "Cashfree checkout error:",
        error
      );

      setError(
        error.message ||
          "Unable to open payment checkout."
      );

      setPaying(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-950" />

          <p className="mt-4 text-sm text-slate-500">
            Loading payment...
          </p>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load payment
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Exhibition Booking
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Complete Payment
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Booking
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {booking.bookingReference}
            </h2>

            <div className="mt-8 space-y-4">
              <DetailRow
                label="Exhibitor"
                value={
                  booking.businessName
                }
              />

              <DetailRow
                label="Contact Person"
                value={
                  booking.contactPerson
                }
              />

              <DetailRow
                label="Category"
                value={
                  booking.category?.name
                }
              />

              <DetailRow
                label="Stall"
                value={
                  booking.slotNumber
                }
              />
            </div>

            {booking.addOns?.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="font-bold text-slate-900">
                  Add-ons
                </h3>

                <div className="mt-4 space-y-3">
                  {booking.addOns.map(
                    (addOn, index) => (
                      <div
                        key={`${addOn.addOnId}-${index}`}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-slate-600">
                          {addOn.name} ×{" "}
                          {addOn.quantity}
                        </span>

                        <span className="font-semibold text-slate-900">
                          ₹
                          {Number(
                            addOn.total
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Stall
                </span>

                <span className="font-semibold">
                  ₹
                  {Number(
                    booking.slotPrice
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Add-ons
                </span>

                <span className="font-semibold">
                  ₹
                  {Number(
                    booking.addOnTotal
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Payment
            </p>

            <div className="mt-6">
              <p className="text-sm text-slate-400">
                Amount payable
              </p>

              <p className="mt-2 text-4xl font-bold">
                ₹
                {Number(
                  booking.total
                ).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={paying}
              className="mt-8 w-full rounded-xl bg-white px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying
                ? "Opening Payment..."
                : `Pay ₹${Number(
                    booking.total
                  ).toLocaleString(
                    "en-IN"
                  )}`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              You will be securely redirected to
              Cashfree's payment window.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value || "—"}
      </span>
    </div>
  );
}