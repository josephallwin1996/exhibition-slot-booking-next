"use client";

import { useState } from "react";

export default function SeedAddOnsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function seedAddOns() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/addons/seed",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to seed add-ons."
        );
      }

      const created =
        data.results.filter(
          (item) =>
            item.status === "created"
        ).length;

      const existing =
        data.results.filter(
          (item) =>
            item.status === "already_exists"
        ).length;

      setMessage(
        `${created} add-ons created, ${existing} already existed.`
      );
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Exhibition Admin
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Seed Add-ons
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            This temporary development page creates the
            initial add-ons.
          </p>

          {message && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={seedAddOns}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Creating Add-ons..."
              : "Create Initial Add-ons"}
          </button>
        </div>
      </div>
    </main>
  );
}