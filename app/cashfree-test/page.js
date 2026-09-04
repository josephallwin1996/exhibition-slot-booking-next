"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

export default function CashfreeTestPage() {
  const [cashfree, setCashfree] = useState(null);
  const [loadingSdk, setLoadingSdk] = useState(true);

  const [creatingOrder, setCreatingOrder] =
    useState(false);

  const [openingCheckout, setOpeningCheckout] =
    useState(false);

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * LOAD CASHFREE
   * =========================================================
   */

  useEffect(() => {
    async function initializeCashfree() {
      try {
        setLoadingSdk(true);
        setError("");

        const instance = await load({
          mode: "sandbox",
        });

        console.log(
          "Cashfree SDK loaded:",
          instance
        );

        setCashfree(instance);
      } catch (error) {
        console.error(
          "Cashfree SDK loading error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load Cashfree SDK."
        );
      } finally {
        setLoadingSdk(false);
      }
    }

    initializeCashfree();
  }, []);

  /*
   * =========================================================
   * CREATE TEST ORDER
   * =========================================================
   */

  async function createTestOrder() {
    try {
      setCreatingOrder(true);
      setError("");
      setOrder(null);

      const response = await fetch(
        "/api/cashfreee/test",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Non JSON response:",
          text
        );

        throw new Error(
          `API returned ${response.status} instead of JSON.`
        );
      }

      const data =
        await response.json();

      console.log(
        "Cashfree test order:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to create test order."
        );
      }

      setOrder(data.order);
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      setError(
        error?.message ||
          "Unable to create test order."
      );
    } finally {
      setCreatingOrder(false);
    }
  }

  /*
   * =========================================================
   * OPEN CHECKOUT
   * =========================================================
   */

  async function openCheckout() {
    try {
      setOpeningCheckout(true);
      setError("");

      if (!cashfree) {
        throw new Error(
          "Cashfree SDK has not loaded yet."
        );
      }

      if (
        !order?.paymentSessionId
      ) {
        throw new Error(
          "Payment session ID is missing."
        );
      }

      console.log(
        "Opening Cashfree checkout with:",
        order.paymentSessionId
      );

      const result =
        await cashfree.checkout({
          paymentSessionId:
            order.paymentSessionId,

          redirectTarget:
            "_self",
        });

      console.log(
        "Cashfree checkout result:",
        result
      );
    } catch (error) {
      console.error(
        "Open checkout error:",
        error
      );

      setError(
        error?.message ||
          "Unable to open Cashfree checkout."
      );

      setOpeningCheckout(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Sandbox
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Cashfree Payment Test
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Isolated payment gateway test.
            No exhibition booking will be created.
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* SDK STATUS */}

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500">
              Cashfree SDK
            </span>

            {loadingSdk ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Loading...
              </span>
            ) : cashfree ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Ready
              </span>
            ) : (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Failed
              </span>
            )}
          </div>

          {/* AMOUNT */}

          <div className="py-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Test Amount
            </p>

            <p className="mt-1 text-5xl font-bold text-slate-900">
              ₹1
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Cashfree Sandbox
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                Error
              </p>

              <p className="mt-1 break-words text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ORDER */}

          {order && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Order Created
              </p>

              <div className="mt-3 space-y-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-800">
                    {order.orderId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Payment Session ID
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-700">
                    {order.paymentSessionId}
                  </p>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">
                    Status
                  </span>

                  <span className="text-xs font-bold text-emerald-700">
                    {order.orderStatus}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* =================================================
              CREATE ORDER
          ================================================= */}

          {!order && (
            <button
              type="button"
              onClick={createTestOrder}
              disabled={
                creatingOrder ||
                loadingSdk
              }
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingOrder
                ? "Creating order..."
                : "Create ₹1 Test Order"}
            </button>
          )}

          {/* =================================================
              CHECKOUT
          ================================================= */}

          {order && (
            <>
              <button
                type="button"
                onClick={openCheckout}
                disabled={
                  openingCheckout ||
                  !cashfree
                }
                className="w-full rounded-xl bg-[#7d1727] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#65131f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {openingCheckout
                  ? "Opening Checkout..."
                  : "Pay ₹1 with Cashfree"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrder(null);
                  setError("");
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Create Another Test Order
              </button>
            </>
          )}
        </div>

        {/* =================================================
            DEBUG INFO
        ================================================= */}

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Environment
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Sandbox
          </p>
        </div>

      </div>
    </main>
  );
}