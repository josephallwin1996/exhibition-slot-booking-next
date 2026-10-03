"use client";

import { useParams } from "next/navigation";

export default function PaymentCompletedPage() {
  const params = useParams();

  const token = params.token;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">

        {/* Success icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5l4.5 4.5L19 7.5"
            />
          </svg>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
          Payment Submitted
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Thank you!
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          We have received your payment
          notification.
        </p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
          <p className="text-sm font-semibold text-slate-900">
            Your payment will be manually
            verified by our team.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            We will notify you about your
            booking confirmation within
            <span className="font-bold text-slate-900">
              {" "}
              15 minutes
            </span>
            .
          </p>
        </div>

        <p className="mt-6 text-xs leading-5 text-slate-400">
          Please keep your payment screenshot
          and booking reference available until
          your payment has been verified.
        </p>

        {/* Temporary reference */}
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Payment Session
          </p>

          <p className="mt-1 truncate text-xs font-medium text-slate-600">
            {token}
          </p>
        </div>

      </section>
    </main>
  );
}