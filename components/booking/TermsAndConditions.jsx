"use client";

export default function TermsAndConditions({
  accepted,
  onChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
          Before payment
        </p>

        <h3 className="mt-2 text-lg font-bold text-slate-900">
          Rules & Terms and Conditions
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Please read and accept the following exhibition
          stall rules before proceeding to payment.
        </p>
      </div>

      <div className="mt-5 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <ol className="space-y-4 text-sm leading-6 text-slate-700">
          <li>
            <strong>1. Two Stands:</strong>{" "}
            If a stall member uses two stands, only one table will be provided.
          </li>

          <li>
            <strong>2. Three Stands:</strong>{" "}
            If a stall member uses three stands, no table will be provided.
          </li>

          <li>
            <strong>3. One stand:</strong>{" "}
            If a stall member uses one stand, two tables will be provided.
          </li>

          <li>
            <strong>4. Stall Setup:</strong>{" "}
            All stall setups and stands must fit within the allocated stall size.
          </li>

          <li>
            <strong>5. Own Stands / Sharing:</strong>{" "}
            Anyone bringing their own stands or sharing a stall must inform the exhibition organizers.
          </li>

          <li>
            <strong>6. Stall Confirmation:</strong>{" "}
            A stall will be confirmed only after payment is received.
          </li>

          <li>
            <strong>7. Three Stalls:</strong>{" "}
            If a stall member uses three stalls, no table
            will be provided.
          </li>

          <li>
            <strong>8.Refund Policy:</strong>{" "}
            No refund is possible after November 5.
          </li>
        </ol>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-300">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
        />

        <span className="text-sm font-medium leading-6 text-slate-700">
          I have read and understood the Rules & Terms
          and Conditions above, and I agree to comply with
          them.
        </span>
      </label>
    </div>
  );
}