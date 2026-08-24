"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F5EF] px-4 py-8 sm:px-6">

      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Top warm glow */}
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#E8B86D]/20 blur-3xl sm:h-96 sm:w-96" />

        {/* Bottom glow */}
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-[#C96F4A]/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#3B302A 1px, transparent 1px), linear-gradient(90deg, #3B302A 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* =====================================================
          LOGIN CONTAINER
      ====================================================== */}

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="mb-7 text-center sm:mb-8">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B302A] shadow-lg shadow-[#3B302A]/15 sm:h-16 sm:w-16">
            <span className="text-xl font-bold tracking-tight text-[#F4C878] sm:text-2xl">
              E
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#A85D3E] sm:text-xs">
            Exhibition 2026
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3B302A] sm:text-3xl">
            Admin Portal
          </h1>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#75685F]">
            Sign in to manage exhibitor applications
            and bookings.
          </p>
        </div>

        {/* =====================================================
            LOGIN CARD
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#E5DDD3] bg-white p-5 shadow-[0_20px_60px_rgba(59,48,42,0.10)] sm:p-8"
        >

          {/* Card heading */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#3B302A]">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-[#8A7C72]">
              Enter your credentials to continue.
            </p>
          </div>

          <div className="space-y-5">

            {/* =================================================
                EMAIL
            ================================================== */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#4A3D35]"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[#DCD2C8]
                  bg-[#FCFAF7]
                  px-4
                  text-sm
                  text-[#3B302A]
                  outline-none
                  transition
                  placeholder:text-[#A99D94]
                  focus:border-[#A85D3E]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#A85D3E]/10
                "
              />
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#4A3D35]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[#DCD2C8]
                  bg-[#FCFAF7]
                  px-4
                  text-sm
                  text-[#3B302A]
                  outline-none
                  transition
                  placeholder:text-[#A99D94]
                  focus:border-[#A85D3E]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#A85D3E]/10
                "
              />
            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="rounded-xl border border-[#E5B8A8] bg-[#FFF4F0] px-4 py-3 text-sm font-medium leading-5 text-[#A84E35]">
                {error}
              </div>
            )}

            {/* =================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                rounded-xl
                bg-[#3B302A]
                px-6
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-[#3B302A]/10
                transition
                hover:bg-[#4B3C34]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Security note */}
          <div className="mt-6 border-t border-[#EEE7DF] pt-5 text-center">
            <p className="text-[11px] leading-4 text-[#9A8D83]">
              Authorized exhibition administrators only.
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#9A8D83]">
          Exhibition 2026 · Admin Portal
        </p>
      </div>
    </main>
  );
}