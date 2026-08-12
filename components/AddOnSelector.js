"use client";

export default function AddOnSelector({
  addOns,
  selections,
  onChange,
}) {
  if (!addOns.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="font-semibold text-slate-700">
          No add-ons are currently available.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          You can continue without selecting any add-ons.
        </p>
      </div>
    );
  }

  const grouped = addOns.reduce((groups, addOn) => {
    const category = addOn.category || "Other";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(addOn);

    return groups;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(
        ([category, categoryAddOns]) => (
          <div key={category}>
            <div className="mb-4">
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                {category}
              </h4>
            </div>

            <div className="space-y-3">
              {categoryAddOns.map((addOn) => {
                const quantity =
                  selections[addOn._id] || 0;

                return (
                  <AddOnRow
                    key={addOn._id}
                    addOn={addOn}
                    quantity={quantity}
                    onChange={(nextQuantity) =>
                      onChange(
                        addOn,
                        nextQuantity
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function AddOnRow({
  addOn,
  quantity,
  onChange,
}) {
  const isSelected = quantity > 0;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isSelected
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h5 className="font-bold text-slate-900">
              {addOn.name}
            </h5>

            <span className="text-sm font-bold text-slate-900">
              ₹
              {Number(
                addOn.price
              ).toLocaleString("en-IN")}
            </span>
          </div>

          {addOn.description && (
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {addOn.description}
            </p>
          )}

          <p className="mt-1 text-xs text-slate-400">
            Maximum {addOn.maxQuantity}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={quantity <= 0}
            onClick={() =>
              onChange(
                Math.max(quantity - 1, 0)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-lg font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>

          <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-900">
            {quantity}
          </div>

          <button
            type="button"
            disabled={
              quantity >= addOn.maxQuantity
            }
            onClick={() =>
              onChange(
                Math.min(
                  quantity + 1,
                  addOn.maxQuantity
                )
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-lg font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}