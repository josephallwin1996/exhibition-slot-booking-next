"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [invoiceLoading, setInvoiceLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    verifyPayment();
  }, []);

  async function verifyPayment() {
    try {
      setLoading(true);
      setError("");

      const bookingReference =
        searchParams.get("bookingReference");

      const cashfreeOrderId =
        searchParams.get("cashfreeOrderId");

      if (!bookingReference) {
        throw new Error(
          "Booking reference is missing."
        );
      }

      if (!cashfreeOrderId) {
        throw new Error(
          "Cashfree order ID is missing."
        );
      }

      /*
       * Verify the payment on the server.
       *
       * The server will contact Cashfree and confirm
       * that the order is actually PAID.
       */
      const verifyResponse =
        await fetch(
          "/api/payment/verify-cashfree",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              bookingReference,
              cashfreeOrderId,
            }),
          }
        );

      const verifyData =
        await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(
          verifyData.message ||
            "Payment verification failed."
        );
      }

      /*
       * Payment is verified successfully.
       *
       * Now load the confirmed booking.
       */
      const response =
        await fetch(
          `/api/booking/${params.token}/payment`,
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
      console.error(
        "Payment verification error:",
        error
      );

      setError(
        error.message ||
          "Payment verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadInvoice() {
    try {
      setInvoiceLoading(true);

      const response =
        await fetch(
          "/api/payment/invoice",
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

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            "Unable to generate invoice."
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${booking.bookingReference}-invoice.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message
      );
    } finally {
      setInvoiceLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-950" />

          <p className="mt-4 text-sm text-slate-500">
            Verifying your payment...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Do not show the success UI if Cashfree
   * payment verification failed.
   */
  if (error || !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600">
            !
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Payment Verification Failed
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            We could not confirm your payment
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            {error ||
              "Your payment could not be confirmed at this time."}
          </p>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Please do not make another payment immediately.
            If money was deducted from your account, it may
            take some time for the payment status to update.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600">
          ✓
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-green-600">
          Payment Successful
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Booking Confirmed
        </h1>

        {booking && (
          <>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Your payment has been successfully
              verified and your exhibition stall
              booking is confirmed.
            </p>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Booking Reference
                </span>

                <span className="font-bold text-slate-900">
                  {
                    booking.bookingReference
                  }
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Stall
                </span>

                <span className="font-bold text-slate-900">
                  {
                    booking.slotNumber
                  }
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Amount Paid
                </span>

                <span className="text-xl font-bold text-slate-900">
                  ₹
                  {Number(
                    booking.total
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={
                downloadInvoice
              }
              disabled={
                invoiceLoading
              }
              className="mt-6 w-full rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {invoiceLoading
                ? "Generating Invoice..."
                : "Download Invoice"}
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              A copy of your invoice and payment
              confirmation will also be sent to your
              registered email.
            </p>
          </>
        )}
      </div>
    </main>
  );
}