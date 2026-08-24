"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: BookingsIcon,
  },
  {
    label: "Slots",
    href: "/admin/slots",
    icon: SlotsIcon,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: CategoriesIcon,
  },
  {
    label: "Add-ons",
    href: "/admin/addons",
    icon: AddonsIcon,
  },
];

export default function AdminLayout({
  children,
}) {
  const pathname = usePathname();

  /*
   * Login page should NOT receive
   * the admin navigation/header.
   */
  const isLoginPage =
    pathname === "/admin/login";

  if (isLoginPage) {
    return children;
  }

  return (
    <AuthenticatedAdminLayout>
      {children}
    </AuthenticatedAdminLayout>
  );
}

function AuthenticatedAdminLayout({
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          ADMIN HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <span className="text-sm font-bold">
                E
              </span>
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                Exhibition
              </p>

              <p className="text-sm font-bold text-slate-900">
                Admin Panel
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">

            {navigation.map(
              (item) => (
                <AdminNavLink
                  key={item.href}
                  item={item}
                  active={
                    pathname ===
                    item.href
                  }
                />
              )
            )}

          </nav>

          {/* Desktop Logout */}
          <div className="hidden lg:block">
            <LogoutButton />
          </div>

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) =>
                  !current
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle admin navigation"
            aria-expanded={
              mobileMenuOpen
            }
          >
            {mobileMenuOpen ? (
              <CloseIcon />
            ) : (
              <MenuIcon />
            )}
          </button>

        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================== */}

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">

            <nav className="space-y-1">

              {navigation.map(
                (item) => (
                  <AdminNavLink
                    key={item.href}
                    item={item}
                    active={
                      pathname ===
                      item.href
                    }
                    mobile
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                  />
                )
              )}

            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <LogoutButton />
            </div>

          </div>
        )}

      </header>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

    </div>
  );
}

/* =========================================================
   NAVIGATION LINK
========================================================= */

function AdminNavLink({
  item,
  active,
  mobile = false,
  onClick,
}) {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl font-semibold transition ${
        mobile
          ? "px-4 py-3 text-sm"
          : "px-3 py-2 text-xs"
      } ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <Icon />

      <span>
        {item.label}
      </span>
    </a>
  );
}

/* =========================================================
   LOGOUT
========================================================= */

function LogoutButton() {
  async function logout() {
    try {
      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      window.location.href =
        "/admin/login";
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:w-auto"
    >
      <LogoutIcon />
      Logout
    </button>
  );
}

/* =========================================================
   ICONS
========================================================= */

function DashboardIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h3" />
      <path d="M8 17h5" />
    </svg>
  );
}

function SlotsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </svg>
  );
}

function AddonsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
      />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="19"
      height="19"
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

function CategoriesIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </svg>
  );
}