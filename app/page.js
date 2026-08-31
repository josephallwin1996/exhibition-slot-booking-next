"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HomePage() {

  const [categories, setCategories] = useState([]);

    /*
     * Load categories dynamically from MongoDB.
     */
    useEffect(() => {
      async function loadCategories() {
        try {
         
          const response = await fetch("/api/categories", {
            cache: "no-store",
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load categories."
            );
          }
  
          setCategories(data.categories || []);
        } catch (error) {
          console.error(
            "Category loading error:",
            error
          );
  
          setErrorMessage(
            "Unable to load business categories. Please refresh the page."
          );
        } finally {
          
        }
      }
  
      loadCategories();
    }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f1e6] text-[#42151c]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#7d1727]/10 bg-[#f8f1e6]/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <a href="/" className="group">
            <div className="flex items-center gap-3">
              {/* <div className="relative flex h-10 w-10 items-center justify-center"> */}
                {/* <div className="absolute inset-0 rounded-full border border-[#a77932]/50" /> */}

                <Image
                  src="/logo.png"
                  alt="Exhibition Logo"
                  width={75}
                  height={75}
                  //className="relative h-8 w-8 object-contain"
                />
                
              {/* </div> */}

              <div>
                <p className="font-serif text-[18px] font-semibold leading-none text-[#7d1727]">
                  Yarntree
                </p>

                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#465337]">
                  Exhibition & Sale
                </p>
                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#465337]">
                  9th Edition
                </p>
              </div>
            </div>
            {/* <div className="flex items-center gap-3">
                <Image
                  src="/logo1.png"
                  alt="Exhibition Logo"
                  width={75}
                  height={75}
                  className="relative h-8 w-8 object-contain"
                />
            </div> */}
          </a>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#event"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f4a43] transition hover:text-[#7d1727]"
            >
              Event
            </a>

            <a
              href="#experience"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f4a43] transition hover:text-[#7d1727]"
            >
              Experience
            </a>

            <a
              href="#categories"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f4a43] transition hover:text-[#7d1727]"
            >
              Categories
            </a>

            <a
              href="/admin/login"
              className="ml-2 rounded-full border border-[#7d1727]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7d1727] transition hover:bg-[#7d1727] hover:text-white"
            >
              Staff Login
            </a>
          </nav>

          {/* Mobile CTA */}
          <a
            href="/apply"
            className="rounded-full bg-[#7d1727] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm"
          >
            Apply
          </a>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7d1727]/5 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-[#465337]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          {/* Hero content */}
          <div className="relative z-10 text-center lg:text-left">
            <div className="mx-auto mb-6 flex w-fit items-center gap-3 lg:mx-0">
              <span className="h-px w-8 bg-[#a77932]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
                Yarntree × Chakolas Pavilion
              </p>

              <span className="h-px w-8 bg-[#a77932]" />
            </div>

            <h1 className="font-serif text-[54px] font-normal leading-[0.85] tracking-[-0.04em] text-[#7d1727] sm:text-[72px] lg:text-[94px]">
              Christmas
            </h1>

            <p className="mt-3 font-serif text-[45px] font-medium leading-none tracking-[0.04em] text-[#465337] sm:text-[58px] lg:text-[70px]">
              Street
              <span className="text-[#7d1727]">'26</span>
            </p>

            <div className="mx-auto mt-7 max-w-lg lg:mx-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d1727] sm:text-sm">
                Shop · Discover · Celebrate
              </p>

              <p className="mt-3 font-serif text-lg italic leading-7 text-[#62524b] sm:text-xl">
                A premium Christmas shopping experience
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="/apply"
                className="group inline-flex w-full items-center justify-center gap-4 rounded-full bg-[#7d1727] px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#7d1727]/15 transition hover:-translate-y-0.5 hover:bg-[#65121f] sm:w-auto"
              >
                Apply to Exhibit

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#event"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#7d1727]/20 px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#7d1727] transition hover:bg-white sm:w-auto"
              >
                Explore Event
              </a>
            </div>
          </div>

          {/* Poster-inspired visual */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-[0.72] overflow-hidden rounded-[28px] border border-[#a77932]/30 bg-[#eee3d3] shadow-2xl shadow-[#42151c]/10">
              {/* Top greenery */}
              <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-[#31432c]/30 to-transparent" />

              <div className="absolute left-4 top-3 h-16 w-16 rounded-full bg-[#7d1727] shadow-lg" />
              <div className="absolute left-14 top-0 h-20 w-20 rounded-full bg-[#465337]/30 blur-xl" />

              <div className="absolute right-3 top-5 h-16 w-16 rounded-full bg-[#7d1727]/90 shadow-lg" />
              <div className="absolute right-12 top-0 h-20 w-20 rounded-full bg-[#465337]/30 blur-xl" />

              {/* Gold stars */}
              <GoldStar className="left-[16%] top-[16%]" />
              <GoldStar className="right-[17%] top-[18%]" />
              <GoldStar className="left-[9%] top-[55%]" />
              <GoldStar className="right-[9%] top-[67%]" />

              {/* Central poster content */}
              <div className="absolute inset-x-5 top-[17%] text-center sm:inset-x-8">
                <p className="font-serif text-[13px] font-semibold uppercase tracking-[0.18em] text-[#7d1727] sm:text-sm">
                  Yarntree
                </p>

                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#465337]">
                  Exhibition & Sale
                </p>
                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#465337]">
                  9th Edition
                </p>
                <div className="mx-auto my-6 flex items-center justify-center gap-4">
                  <span className="h-px w-10 bg-[#a77932]" />

                  <span className="font-serif text-xl text-[#7d1727]">
                    ×
                  </span>

                  <span className="h-px w-10 bg-[#a77932]" />
                </div>

                <p className="font-serif text-[47px] leading-[0.85] text-[#7d1727] sm:text-[58px]">
                  Christmas
                </p>

                <p className="mt-3 font-serif text-[28px] font-semibold tracking-[0.08em] text-[#465337] sm:text-[35px]">
                  STREET '26
                </p>

                <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.22em] text-[#7d1727] sm:text-[9px]">
                  Shop · Discover · Celebrate
                </p>

                <p className="mt-2 font-serif text-xs italic text-[#62524b] sm:text-sm">
                  A Premium Christmas Shopping Experience
                </p>

                {/* Date */}
                <div className="mx-auto mt-7 max-w-[300px] rounded-2xl border border-[#a77932]/50 bg-[#f8f1e6]/70 px-4 py-4 backdrop-blur-sm">
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#7d1727]">
                    November
                  </p>

                  <p className="mt-1 font-serif text-3xl text-[#465337]">
                    20 & 21
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-[#7d1727]">
                    Friday & Saturday
                  </p>
                </div>

                {/* Venue */}
                <div className="mt-5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#7d1727]">
                    Chakolas Pavilion
                  </p>

                  <p className="mt-1 text-[8px] text-[#62524b]">
                    Anchery Chira Thrissur
                  </p>
                </div>
              </div>

              {/* Bottom greenery */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#465337]/25 to-transparent" />

              <div className="absolute bottom-5 left-5 h-12 w-12 rounded-full bg-[#7d1727]/80" />
              <div className="absolute bottom-4 right-5 h-14 w-14 rounded-full bg-[#465337]/50" />
            </div>

            {/* Gold corner decorations */}
            <div className="absolute -left-3 -top-3 h-14 w-14 border-l border-t border-[#a77932]/60" />

            <div className="absolute -bottom-3 -right-3 h-14 w-14 border-b border-r border-[#a77932]/60" />
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENT DETAILS
      ====================================================== */}

      <section
        id="event"
        className="border-y border-[#7d1727]/10 bg-[#efe5d6]"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
              Save the Date
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#42151c] sm:text-5xl">
              Christmas Street '26
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#62524b]">
              Two festive days bringing together premium brands,
              shoppers, makers and Christmas lovers under one roof.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <EventCard
              icon={<CalendarIcon />}
              label="Dates"
              value="November 20 & 21"
              detail="Friday & Saturday"
            />

            <EventCard
              icon={<LocationIcon />}
              label="Venue"
              value="Chakolas Pavilion"
              detail="Anchery Chira Thrissur"
            />

            <EventCard
              icon={<ClockIcon />}
              label="Timings"
              value="10:30 AM – 8:30 PM"
              detail="Open to shoppers"
            />

            <EventCard
              icon={<BagIcon />}
              label="Stalls"
              value="Premium Stalls"
              detail="Handpicked brands"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          EXPERIENCE
      ====================================================== */}

      <section
        id="experience"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
              More than shopping
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#42151c] sm:text-5xl">
              Celebrate the season
              <span className="block italic text-[#7d1727]">
                with style.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#62524b]">
              Christmas Street brings together a carefully selected
              collection of brands for people who love discovering
              something special.
            </p>

            <div className="mt-7 h-px w-16 bg-[#a77932]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureCard
              number="01"
              title="Discover"
              text="Explore handpicked brands and distinctive products."
            />

            <FeatureCard
              number="02"
              title="Shop"
              text="Find fashion, home, lifestyle, decor and more."
            />

            <FeatureCard
              number="03"
              title="Connect"
              text="Meet the people behind the brands you love."
            />

            <FeatureCard
              number="04"
              title="Celebrate"
              text="Enjoy a festive shopping experience made for the season."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <section
        id="categories"
        className="bg-[#465337] text-[#f8f1e6]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#e1bf72]">
                On the floor
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                Something for
                <span className="block italic text-[#e1bf72]">
                  everyone.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                A festive mix of carefully selected businesses and
                brands across categories that make Christmas shopping
                exciting.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {/* {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  label={category.name}
                />
              ))} */}

              {categories
              .filter((category) => category.slug !== "shared-stall")
              .map((category) => (
                <CategoryCard
                  key={category._id}
                  label={category.name}
                />
              ))}

              {/* <CategoryCard label="Fashion" />
              <CategoryCard label="Home" />
              <CategoryCard label="Lifestyle" />
              <CategoryCard label="Decor" /> */}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXHIBITOR CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#f8f1e6]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#a77932]/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 lg:py-28">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
            For brands & businesses
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#42151c] sm:text-5xl lg:text-6xl">
            Bring your brand
            <span className="block italic text-[#7d1727]">
              to Christmas Street.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#62524b]">
            Showcase your products, meet new customers and become part
            of a premium Christmas shopping experience in Thrissur.
          </p>

          <a
            href="/apply"
            className="group mt-8 inline-flex w-full items-center justify-center gap-4 rounded-full bg-[#7d1727] px-8 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#7d1727]/15 transition hover:-translate-y-0.5 hover:bg-[#65121f] sm:w-auto"
          >
            Apply to Exhibit

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>

          <p className="mt-4 text-[10px] text-[#806d64]">
            Limited premium stalls available
          </p>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#7d1727]/10 bg-[#efe5d6]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-xl text-[#7d1727]">
                Christmas Street '26
              </p>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#465337]">
                Yarntree Exhibition & Sale
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#465337]">
                9th Edition
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs text-[#62524b] sm:items-end">
              <span>
                November 20 & 21 · Chakolas Pavilion
              </span>

              <a
                href="/admin/login"
                className="font-semibold text-[#7d1727] hover:underline"
              >
                Staff Login
              </a>
            </div>
          </div>

          <div className="mt-7 border-t border-[#7d1727]/10 pt-5 text-center text-[9px] text-[#806d64] sm:text-left">
            © 2026 Yarntree Exhibition & Sale. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({ icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[#7d1727]/10 bg-[#f8f1e6] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7d1727]/8 text-[#7d1727]">
        {icon}
      </div>

      <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7d1727]">
        {label}
      </p>

      <p className="mt-2 font-serif text-xl text-[#42151c]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#806d64]">
        {detail}
      </p>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-[#7d1727]/10 bg-white/45 p-6">
      <p className="font-serif text-2xl text-[#a77932]">
        {number}
      </p>

      <h3 className="mt-5 font-serif text-2xl text-[#42151c]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#806d64]">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   CATEGORY CARD
========================================================= */

function CategoryCard({ label }) {
  return (
    <div className="flex min-h-[130px] items-end rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:bg-white/10 sm:min-h-[160px]">
      <div>
        <span className="mb-3 block h-px w-8 bg-[#e1bf72]" />

        <p className="font-serif text-2xl text-white sm:text-3xl">
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   GOLD STAR
========================================================= */

function GoldStar({ className = "" }) {
  return (
    <div
      className={`absolute text-[#a77932] ${className}`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 1l1.8 7.2L21 10l-7.2 1.8L12 19l-1.8-7.2L3 10l7.2-1.8L12 1z" />
      </svg>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l1 12H4L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}