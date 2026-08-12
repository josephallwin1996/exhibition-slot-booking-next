"use client";

import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState("all");
  const [category, setCategory] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  useEffect(() => {
    loadBookings();
  }, [paymentStatus]);

  async function loadBookings() {
    try {
      setError("");

      if (loading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      params.set(
        "paymentStatus",
        paymentStatus
      );

      const response = await fetch(
        `/api/admin/bookings?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load bookings."
        );
      }

      setBookings(
        data.bookings || []
      );

      setCurrentPage(1);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleExport() {
  try {
    setExporting(true);
    setError("");

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    params.set(
      "paymentStatus",
      paymentStatus
    );

    params.set(
      "category",
      category
    );

    const response = await fetch(
      `/api/admin/bookings/export?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      let message =
        "Unable to export bookings.";

      try {
        const data =
          await response.json();

        message =
          data.message || message;
      } catch {
        // Response was not JSON.
      }

      throw new Error(message);
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

    /*
     * Use the filename returned
     * by the API when available.
     */
    const disposition =
      response.headers.get(
        "Content-Disposition"
      );

    let filename =
      "exhibition-bookings.csv";

    const filenameMatch =
      disposition?.match(
        /filename="?([^"]+)"?/i
      );

    if (filenameMatch?.[1]) {
      filename =
        filenameMatch[1];
    }

    link.download = filename;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  } catch (error) {
    console.error(
      "Booking export error:",
      error
    );

    setError(
      error.message ||
        "Unable to export bookings."
    );
  } finally {
    setExporting(false);
  }
}
  function handleSearch(event) {
    event.preventDefault();

    setCurrentPage(1);
    loadBookings();
  }

  function resetFilters() {
    setSearch("");
    setPaymentStatus("all");
    setCategory("all");
    setCurrentPage(1);

    setTimeout(() => {
      loadBookings();
    }, 0);
  }

  const categories = useMemo(() => {
    const values = bookings
      .map(
        (booking) =>
          booking.category
      )
      .filter(Boolean);

    return [
      ...new Set(values),
    ];
  }, [bookings]);

  const filteredBookings =
    useMemo(() => {
      if (category === "all") {
        return bookings;
      }

      return bookings.filter(
        (booking) =>
          booking.category ===
          category
      );
    }, [bookings, category]);

  const stats = useMemo(() => {
    const total =
      filteredBookings.length;

    const paid =
      filteredBookings.filter(
        (booking) =>
          booking.paymentStatus ===
          "paid"
      ).length;

    const pending =
      filteredBookings.filter(
        (booking) =>
          booking.paymentStatus ===
          "pending"
      ).length;

    const failed =
      filteredBookings.filter(
        (booking) =>
          booking.paymentStatus ===
          "failed"
      ).length;

    const revenue =
      filteredBookings
        .filter(
          (booking) =>
            booking.paymentStatus ===
            "paid"
        )
        .reduce(
          (sum, booking) =>
            sum +
            Number(
              booking.total || 0
            ),
          0
        );

    return {
      total,
      paid,
      pending,
      failed,
      revenue,
    };
  }, [filteredBookings]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBookings.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedBookings =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredBookings.slice(
        start,
        start + ITEMS_PER_PAGE
      );
    }, [
      filteredBookings,
      currentPage,
    ]);

  const paginationStart =
    filteredBookings.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const paginationEnd = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredBookings.length
  );

  /*
   * If a filter reduces the number
   * of pages, make sure the current
   * page remains valid.
   */
  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Exhibition Management
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Bookings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage confirmed stalls,
              exhibitor information and
              payment activity from one
              place.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

  {/* Export */}
  <button
    type="button"
    onClick={handleExport}
    disabled={
      exporting ||
      loading ||
      filteredBookings.length === 0
    }
    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <DownloadIcon
      spinning={exporting}
    />

    {exporting
      ? "Exporting..."
      : "Export CSV"}
  </button>

  {/* Refresh */}
  <button
    type="button"
    onClick={loadBookings}
    disabled={refreshing}
    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
  >
    <RefreshIcon
      spinning={refreshing}
    />

    {refreshing
      ? "Refreshing..."
      : "Refresh"}
  </button>

</div>
        </div>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Bookings"
            value={stats.total}
            description="Current booking records"
            icon={<BookingIcon />}
          />

          <StatCard
            label="Paid Bookings"
            value={stats.paid}
            description="Successfully paid"
            icon={<CheckIcon />}
            positive
          />

          <StatCard
            label="Pending Payments"
            value={stats.pending}
            description="Awaiting payment"
            icon={<ClockIcon />}
            warning
          />

          <StatCard
            label="Collected Revenue"
            value={`₹${stats.revenue.toLocaleString(
              "en-IN"
            )}`}
            description={`${stats.failed} failed payment${
              stats.failed === 1
                ? ""
                : "s"
            }`}
            icon={<RupeeIcon />}
          />

        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 xl:flex-row"
          >

            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <SearchIcon />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search booking reference, business or contact..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* Payment filter */}
            <select
              value={paymentStatus}
              onChange={(event) => {
                setPaymentStatus(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 xl:w-44"
            >
              <option value="all">
                All Payments
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="failed">
                Failed
              </option>
            </select>

            {/* Category filter */}
            <select
              value={category}
              onChange={(event) => {
                setCategory(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 xl:w-44"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            {/* Search */}
            <button
              type="submit"
              className="h-12 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>

            {/* Reset */}
            {(search ||
              paymentStatus !==
                "all" ||
              category !== "all") && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            )}

          </form>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {
                  filteredBookings.length
                }
              </span>{" "}
              booking
              {filteredBookings.length ===
              1
                ? ""
                : "s"}
            </p>

            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Paid

              <span className="ml-3 h-2 w-2 rounded-full bg-amber-400" />
              Pending

              <span className="ml-3 h-2 w-2 rounded-full bg-red-400" />
              Failed
            </div>

          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <div className="mt-0.5">
              <AlertIcon />
            </div>

            <div>
              <p className="font-semibold">
                Unable to load bookings
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            DESKTOP TABLE
        ====================================================== */}

        <div className="hidden w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

          <div className="border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Booking Records
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Click any booking to view
                complete details.
              </p>
            </div>
          </div>

          <div className="w-full">
            <table className="w-full table-fixed text-left">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="w-[17%] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Booking
                  </th>

                  <th className="w-[20%] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Exhibitor
                  </th>

                  <th className="w-[10%] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Stall
                  </th>

                  <th className="w-[14%] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </th>

                  <th className="w-[13%] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="w-[13%] px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Payment
                  </th>

                  <th className="w-[13%] px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <LoadingRows />
                ) : paginatedBookings.length ===
                  0 ? (
                  <EmptyState />
                ) : (
                  paginatedBookings.map(
                    (booking) => (
                      <BookingRow
                        key={
                          booking._id
                        }
                        booking={
                          booking
                        }
                        onClick={() =>
                          setSelectedBooking(
                            booking
                          )
                        }
                      />
                    )
                  )
                )}

              </tbody>

            </table>

            {!loading &&
              filteredBookings.length >
                0 && (
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  start={
                    paginationStart
                  }
                  end={
                    paginationEnd
                  }
                  total={
                    filteredBookings.length
                  }
                  onPageChange={
                    setCurrentPage
                  }
                />
              )}
          </div>
        </div>

        {/* =====================================================
            MOBILE CARDS
        ====================================================== */}

        <div className="space-y-3 lg:hidden">

          <div>
            <h2 className="font-bold text-slate-900">
              Booking Records
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Tap a booking for details.
            </p>
          </div>

          {loading ? (
            <MobileLoading />
          ) : paginatedBookings.length ===
            0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <BookingIcon />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No bookings found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters.
              </p>

            </div>
          ) : (
            paginatedBookings.map(
              (booking) => (
                <MobileBookingCard
                  key={booking._id}
                  booking={booking}
                  onClick={() =>
                    setSelectedBooking(
                      booking
                    )
                  }
                />
              )
            )
          )}

          {!loading &&
            filteredBookings.length >
              0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  start={
                    paginationStart
                  }
                  end={
                    paginationEnd
                  }
                  total={
                    filteredBookings.length
                  }
                  onPageChange={
                    setCurrentPage
                  }
                />
              </div>
            )}
        </div>
      </div>

      {/* =====================================================
          DETAIL DRAWER
      ====================================================== */}

      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() =>
            setSelectedBooking(null)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  positive,
  warning,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">

        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>

          <p
            className={`mt-2 text-xs ${
              positive
                ? "text-emerald-600"
                : warning
                ? "text-amber-600"
                : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : warning
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   DESKTOP BOOKING ROW
========================================================= */

function BookingRow({
  booking,
  onClick,
}) {
  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer transition hover:bg-slate-50"
    >
      <td className="max-w-0 px-5 py-5">
        <p
          title={
            booking.bookingReference
          }
          className="truncate font-bold text-slate-900"
        >
          {booking.bookingReference}
        </p>

        <p className="mt-1 truncate text-xs text-slate-400">
          {formatDate(
            booking.createdAt
          )}
        </p>
      </td>

      <td className="max-w-0 px-5 py-5">
        <p
          title={
            booking.businessName
          }
          className="truncate font-semibold text-slate-900"
        >
          {booking.businessName ||
            "—"}
        </p>

        <p
          title={
            booking.contactPerson
          }
          className="mt-1 truncate text-xs text-slate-500"
        >
          {booking.contactPerson ||
            "—"}
        </p>
      </td>

      <td className="px-5 py-5">
        <span
          title={
            booking.slotNumber
          }
          className="inline-flex max-w-full items-center rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-800"
        >
          <span className="truncate">
            {booking.slotNumber ||
              "—"}
          </span>
        </span>
      </td>

      <td className="max-w-0 px-5 py-5">
        <span
          title={booking.category}
          className="block truncate text-sm text-slate-600"
        >
          {booking.category ||
            "—"}
        </span>
      </td>

      <td className="px-5 py-5">
        <p className="whitespace-nowrap font-bold text-slate-900">
          ₹
          {Number(
            booking.total || 0
          ).toLocaleString(
            "en-IN"
          )}
        </p>
      </td>

      <td className="px-5 py-5">
        <PaymentBadge
          status={
            booking.paymentStatus
          }
        />
      </td>

      <td className="px-5 py-5 text-right">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition group-hover:border-slate-300 group-hover:bg-white hover:text-slate-900"
        >
          View
          <ArrowIcon />
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE BOOKING CARD
========================================================= */

function MobileBookingCard({
  booking,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <p className="truncate font-bold text-slate-900">
            {booking.bookingReference}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {booking.businessName ||
              "—"}
          </p>
        </div>

        <PaymentBadge
          status={
            booking.paymentStatus
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Stall
          </p>

          <p className="mt-1 truncate font-bold text-slate-900">
            {booking.slotNumber ||
              "—"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Amount
          </p>

          <p className="mt-1 truncate font-bold text-slate-900">
            ₹
            {Number(
              booking.total || 0
            ).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Category
          </p>

          <p className="mt-1 truncate text-sm font-medium text-slate-700">
            {booking.category ||
              "—"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Date
          </p>

          <p className="mt-1 truncate text-sm font-medium text-slate-700">
            {formatDate(
              booking.createdAt
            )}
          </p>
        </div>

      </div>

      <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-slate-500">
        View details
        <ArrowIcon />
      </div>
    </button>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  currentPage,
  totalPages,
  start,
  end,
  total,
  onPageChange,
}) {
  const pages = [];

  const maxVisiblePages = 5;

  let startPage = Math.max(
    1,
    currentPage -
      Math.floor(
        maxVisiblePages / 2
      )
  );

  let endPage = Math.min(
    totalPages,
    startPage +
      maxVisiblePages -
      1
  );

  if (
    endPage - startPage + 1 <
    maxVisiblePages
  ) {
    startPage = Math.max(
      1,
      endPage -
        maxVisiblePages +
        1
    );
  }

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pages.push(page);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

      <p className="text-xs font-medium text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-900">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-900">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900">
          {total}
        </span>{" "}
        bookings
      </p>

      <div className="flex items-center gap-1">

        {/* Previous */}
        <button
          type="button"
          disabled={
            currentPage === 1
          }
          onClick={() =>
            onPageChange(
              currentPage - 1
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        {/* First page */}
        {startPage > 1 && (
          <>
            <PageButton
              page={1}
              currentPage={
                currentPage
              }
              onPageChange={
                onPageChange
              }
            />

            {startPage > 2 && (
              <span className="flex h-9 w-7 items-center justify-center text-xs text-slate-400">
                ...
              </span>
            )}
          </>
        )}

        {/* Pages */}
        {pages.map((page) => (
          <PageButton
            key={page}
            page={page}
            currentPage={
              currentPage
            }
            onPageChange={
              onPageChange
            }
          />
        ))}

        {/* Last page */}
        {endPage <
          totalPages && (
          <>
            {endPage <
              totalPages - 1 && (
              <span className="flex h-9 w-7 items-center justify-center text-xs text-slate-400">
                ...
              </span>
            )}

            <PageButton
              page={totalPages}
              currentPage={
                currentPage
              }
              onPageChange={
                onPageChange
              }
            />
          </>
        )}

        {/* Next */}
        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage + 1
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>

      </div>
    </div>
  );
}

function PageButton({
  page,
  currentPage,
  onPageChange,
}) {
  const active =
    page === currentPage;

  return (
    <button
      type="button"
      onClick={() =>
        onPageChange(page)
      }
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {page}
    </button>
  );
}

/* =========================================================
   BOOKING DRAWER
========================================================= */

function BookingDrawer({
  booking,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50">

      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close booking details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Booking Details
              </span>
            </div>

            <h2
              title={
                booking.bookingReference
              }
              className="mt-2 truncate text-xl font-bold text-slate-950"
            >
              {booking.bookingReference}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <CloseIcon />
          </button>

        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">

          {/* Status */}
          <div className="flex flex-wrap items-center gap-2">
            <PaymentBadge
              status={
                booking.paymentStatus
              }
            />

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600">
              {formatStatus(
                booking.status
              )}
            </span>
          </div>

          {/* Amount */}
          <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Booking Value
            </p>

            <p className="mt-2 text-3xl font-bold">
              ₹
              {Number(
                booking.total || 0
              ).toLocaleString(
                "en-IN"
              )}
            </p>

            {booking.paidAt && (
              <p className="mt-2 text-xs text-slate-400">
                Paid on{" "}
                {formatDateTime(
                  booking.paidAt
                )}
              </p>
            )}

          </div>

          {/* Exhibitor */}
          <DetailSection title="Exhibitor">

            <DetailItem
              label="Business Name"
              value={
                booking.businessName
              }
            />

            <DetailItem
              label="Contact Person"
              value={
                booking.contactPerson
              }
            />

            <DetailItem
              label="Email"
              value={booking.email}
            />

            <DetailItem
              label="Mobile"
              value={
                booking.mobileNumber
              }
            />

          </DetailSection>

          {/* Stall */}
          <DetailSection title="Stall">

            <DetailItem
              label="Stall Number"
              value={
                booking.slotNumber
              }
              highlight
            />

            <DetailItem
              label="Category"
              value={
                booking.category
              }
            />

          </DetailSection>

          {/* Payment */}
          <DetailSection title="Payment">

            <DetailItem
              label="Amount"
              value={`₹${Number(
                booking.total || 0
              ).toLocaleString(
                "en-IN"
              )}`}
            />

            <DetailItem
              label="Payment Status"
              value={
                <PaymentBadge
                  status={
                    booking.paymentStatus
                  }
                />
              }
            />

            <DetailItem
              label="Payment ID"
              value={
                booking.razorpayPaymentId ||
                booking.paymentId ||
                "—"
              }
              mono
            />

            <DetailItem
              label="Order ID"
              value={
                booking.razorpayOrderId ||
                "—"
              }
              mono
            />

          </DetailSection>

          {/* Invoice */}
          <DetailSection title="Invoice">

            <DetailItem
              label="Invoice Number"
              value={
                booking.invoiceNumber ||
                "Not generated"
              }
            />

            <DetailItem
              label="Invoice Date"
              value={
                booking.invoiceIssuedAt
                  ? formatDate(
                      booking.invoiceIssuedAt
                    )
                  : "—"
              }
            />

          </DetailSection>

          {/* Add-ons */}
          {booking.addOns &&
            booking.addOns.length >
              0 && (
              <DetailSection title="Add-ons">

                <div className="space-y-3 p-3">

                  {booking.addOns.map(
                    (
                      addOn,
                      index
                    ) => (
                      <div
                        key={
                          addOn._id ||
                          addOn.id ||
                          index
                        }
                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"
                      >

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {
                              addOn.name
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Qty:{" "}
                            {addOn.quantity ||
                              1}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-slate-900">
                          ₹
                          {Number(
                            addOn.total ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </DetailSection>
            )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-3 sm:flex-row">

            {booking.paymentStatus ===
              "paid" && (
              <button
                type="button"
                onClick={() =>
                  downloadInvoice(
                    booking.bookingReference
                  )
                }
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <DownloadIcon />
                Invoice
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Done
            </button>

          </div>

        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   DETAIL SECTION
========================================================= */

function DetailSection({
  title,
  children,
}) {
  return (
    <section className="mt-7">

      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
  highlight,
  mono,
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">

      <span className="shrink-0 text-xs text-slate-400">
        {label}
      </span>

      <div
        className={`max-w-[65%] break-words text-right text-sm ${
          highlight
            ? "font-bold text-slate-950"
            : "font-medium text-slate-700"
        } ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >
        {value || "—"}
      </div>

    </div>
  );
}

/* =========================================================
   PAYMENT BADGE
========================================================= */

function PaymentBadge({ status }) {
  const config = {
    paid: {
      label: "Paid",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
      dot: "bg-emerald-500",
    },

    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 ring-amber-600/10",
      dot: "bg-amber-500",
    },

    failed: {
      label: "Failed",
      className:
        "bg-red-50 text-red-700 ring-red-600/10",
      dot: "bg-red-500",
    },
  };

  const item =
    config[status] || {
      label:
        status || "Unknown",
      className:
        "bg-slate-100 text-slate-600 ring-slate-500/10",
      dot: "bg-slate-400",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${item.className}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`}
      />

      {item.label}
    </span>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingRows() {
  return (
    <>
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <tr key={index}>

          {Array.from({
            length: 7,
          }).map(
            (_, cellIndex) => (
              <td
                key={cellIndex}
                className="px-5 py-6"
              >
                <div className="h-4 animate-pulse rounded bg-slate-100" />
              </td>
            )
          )}

        </tr>
      ))}
    </>
  );
}

function MobileLoading() {
  return (
    <div className="space-y-3">

      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
        />
      ))}

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <tr>
      <td
        colSpan="7"
        className="px-6 py-20 text-center"
      >

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <BookingIcon />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No bookings found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search
          or filters.
        </p>

      </td>
    </tr>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

/* =========================================================
   INVOICE DOWNLOAD
========================================================= */

async function downloadInvoice(
  bookingReference
) {
  try {
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
            bookingReference,
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
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${bookingReference}-invoice.pdf`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  } catch (error) {
    console.error(
      "Invoice download error:",
      error
    );

    alert(
      error.message ||
        "Unable to download invoice."
    );
  }
}

/* =========================================================
   ICONS
========================================================= */

function BookingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function RupeeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h12" />
      <path d="M6 8h12" />
      <path d="M8 4c4 0 6 1.5 6 4s-2 4-6 4h-2l8 8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function RefreshIcon({
  spinning,
}) {
  return (
    <svg
      className={
        spinning
          ? "animate-spin"
          : ""
      }
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.3 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}