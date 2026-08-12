"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b111c] text-[#f5f1e8]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center bg-[#dcb873] text-[#0b111c]">
              <span className="font-serif text-sm font-bold">
                EV
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-white">
                EXOVAULT
              </p>

              <p className="mt-0.5 hidden text-[8px] uppercase tracking-[0.22em] text-[#9da5b2] sm:block">
                Private Trade Show
              </p>
            </div>
          </a>

          {/* Desktop Meta */}
          <div className="hidden items-center gap-8 md:flex">

            <div className="flex items-center gap-2 text-xs text-[#9da5b2]">
              <LocationIcon />

              <span>
                Mumbai · 18–20 Oct 2026
              </span>
            </div>

            <a
              href="/admin/login"
              className="flex items-center gap-2 text-xs font-medium text-[#9da5b2] transition hover:text-[#dcb873]"
            >
              Staff Login
              <LockIcon />
            </a>

          </div>

          {/* Mobile Staff Login */}
          <a
            href="/admin/login"
            className="flex items-center gap-2 text-xs font-medium text-[#9da5b2] md:hidden"
          >
            Staff
            <LockIcon />
          </a>

        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* Background glow */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#b58b45]/10 blur-[130px]" />

        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:px-12 lg:py-24">

          {/* Hero Copy */}
          <div>

            <div className="mb-7 flex items-center gap-3">

              <span className="h-px w-8 bg-[#dcb873]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dcb873]">
                The Exovault Edition / 01
              </p>

            </div>

            <h1 className="max-w-[720px] text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#f7f3eb] sm:text-6xl lg:text-[78px]">

              Where brands

              <span className="mt-2 block font-serif font-normal italic text-[#dcb873]">
                take their place.
              </span>

            </h1>

            <p className="mt-8 max-w-[520px] text-base leading-7 text-[#9da5b2] sm:text-lg">
              A considered exhibition for the
              next generation of retail. Apply
              for your stand, secure your space,
              and meet the people who matter.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">

              <a
                href="/apply"
                className="group inline-flex items-center gap-5 bg-[#dcb873] px-6 py-4 text-sm font-bold text-[#0b111c] transition hover:bg-[#ead08f]"
              >
                Apply to Exhibit

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#event"
                className="text-sm text-[#8e97a6] transition hover:text-[#dcb873]"
              >
                Explore the event
                <span className="ml-2">↓</span>
              </a>

            </div>

          </div>

          {/* =================================================
              HERO VISUAL
          ================================================== */}

          <div className="relative">

            <div className="relative aspect-[4/4.15] overflow-hidden border border-white/10 bg-[#151e2b]">

              {/* Architectural visual */}
              <div className="absolute inset-0">

                {/* Main floor */}
                <div className="absolute inset-x-0 bottom-0 h-[43%] bg-gradient-to-t from-[#27323c] to-[#16202b]" />

                {/* Back wall */}
                <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-[#273a42] to-[#16232d]" />

                {/* Glass panels */}
                <div className="absolute inset-0 opacity-50">

                  <div className="absolute left-[8%] top-0 h-[65%] w-px bg-white/30" />
                  <div className="absolute left-[24%] top-0 h-[65%] w-px bg-white/20" />
                  <div className="absolute left-[42%] top-0 h-[65%] w-px bg-white/30" />
                  <div className="absolute left-[61%] top-0 h-[65%] w-px bg-white/20" />
                  <div className="absolute left-[79%] top-0 h-[65%] w-px bg-white/30" />
                  <div className="absolute left-[94%] top-0 h-[65%] w-px bg-white/20" />

                  <div className="absolute left-0 top-[15%] h-px w-full bg-white/20" />
                  <div className="absolute left-0 top-[31%] h-px w-full bg-white/30" />
                  <div className="absolute left-0 top-[48%] h-px w-full bg-white/20" />

                </div>

                {/* Exhibition structures */}
                <div className="absolute bottom-[25%] left-[10%] h-[23%] w-[31%] border border-[#dcb873]/50 bg-[#0c1420]/60" />

                <div className="absolute bottom-[25%] right-[9%] h-[30%] w-[36%] border border-white/20 bg-[#0c1420]/50" />

                {/* Light strips */}
                <div className="absolute left-[15%] top-[19%] h-1 w-[26%] bg-[#dcb873]/70" />

                <div className="absolute right-[13%] top-[29%] h-1 w-[20%] bg-white/40" />

                {/* Central light */}
                <div className="absolute left-1/2 top-[8%] h-[48%] w-px -translate-x-1/2 bg-gradient-to-b from-[#dcb873]/60 to-transparent" />

                {/* People silhouettes */}
                <div className="absolute bottom-[15%] left-[25%] h-16 w-4 rounded-full bg-[#0a1019]" />

                <div className="absolute bottom-[14%] left-[28%] h-12 w-3 rounded-full bg-[#0a1019]" />

                <div className="absolute bottom-[17%] right-[27%] h-14 w-4 rounded-full bg-[#0a1019]" />

                {/* Floor perspective lines */}
                <div className="absolute bottom-0 left-1/2 h-[43%] w-px origin-bottom -translate-x-1/2 rotate-[28deg] bg-white/10" />

                <div className="absolute bottom-0 left-1/2 h-[43%] w-px origin-bottom -translate-x-1/2 -rotate-[28deg] bg-white/10" />

                <div className="absolute bottom-[18%] left-0 h-px w-full bg-white/10" />

                <div className="absolute bottom-[32%] left-0 h-px w-full bg-white/10" />

                {/* Warm atmospheric glow */}
                <div className="absolute bottom-[15%] left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-[#dcb873]/10 blur-3xl" />

              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07101a]/80 via-transparent to-[#07101a]/10" />

              {/* Image label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#dcb873]">
                  01 / The Show Floor
                </p>

                <p className="mt-2 font-serif text-lg italic text-white sm:text-xl">
                  Where commerce becomes culture.
                </p>

              </div>

            </div>

            {/* Decorative corner */}
            <div className="absolute -bottom-3 -left-3 h-16 w-16 border-b border-l border-[#dcb873]/50" />

            <div className="absolute -right-3 -top-3 h-16 w-16 border-r border-t border-[#dcb873]/50" />

          </div>

        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="border-y border-white/10">

        <div className="mx-auto grid max-w-[1440px] sm:grid-cols-2 lg:grid-cols-4">

          <Stat
            number="64"
            label="Curated stands"
          />

          <Stat
            number="04"
            label="Distinct categories"
          />

          <Stat
            number="03"
            label="Days of discovery"
          />

          <Stat
            number="01"
            label="Unmissable room"
          />

        </div>

      </section>

      {/* =====================================================
          EVENT / CATEGORIES
      ====================================================== */}

      <section
        id="event"
        className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dcb873]">
              Categories on the floor
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">

              What you'll find

              <span className="block font-serif font-normal italic text-[#dcb873]">
                in the room.
              </span>

            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#8e97a6]">
              A curated mix of independent
              brands, makers and distinctive
              businesses brought together under
              one roof.
            </p>

          </div>

          <div className="flex flex-wrap content-start gap-3 lg:justify-end">

            <Category label="Decor" />
            <Category label="Food" />
            <Category label="Jewellery" />
            <Category label="Clothing" />

          </div>

        </div>

      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}

      <section className="border-y border-white/10">

        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12">

          <div className="ml-auto max-w-[850px]">

            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7f8998]">
              Why Exovault
            </p>

            <h2 className="mt-6 text-4xl font-medium leading-tight tracking-[-0.035em] sm:text-5xl lg:text-6xl">

              Not a marketplace.

              <span className="block font-serif italic text-[#dcb873]">
                A meeting point.
              </span>

            </h2>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#8e97a6]">
              We bring distinctive independent
              brands into one room — a tactile,
              human-first alternative to the
              endless scroll.
            </p>

            <div className="mt-10 h-px w-20 bg-[#dcb873]" />

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,184,115,0.10),transparent_55%)]" />

        <div className="relative mx-auto max-w-[1000px] px-5 py-24 text-center sm:px-8 lg:py-32">

          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dcb873]">
            Applications are open
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">

            Your brand belongs

            <span className="block font-serif italic text-[#dcb873]">
              in the room.
            </span>

          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#8e97a6]">
            Tell us about your business and
            take the first step toward joining
            the next Exovault exhibition.
          </p>

          <a
            href="/apply"
            className="group mt-9 inline-flex items-center gap-5 bg-[#dcb873] px-7 py-4 text-sm font-bold text-[#0b111c] transition hover:bg-[#ead08f]"
          >
            Apply to Exhibit

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#687282]">
              EXOVAULT / PRIVATE TRADE SHOW 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#687282]">

            <span>
              Mumbai · 18–20 Oct 2026
            </span>

            <a
              href="/admin/login"
              className="transition hover:text-[#dcb873]"
            >
              Staff Login
            </a>

          </div>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  number,
  label,
}) {
  return (
    <div className="border-b border-white/10 px-5 py-7 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-8 lg:last:border-r-0">

      <p className="font-serif text-3xl text-[#dcb873]">
        {number}
      </p>

      <p className="mt-1 text-xs text-[#8e97a6]">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   CATEGORY
========================================================= */

function Category({
  label,
}) {
  return (
    <div className="rounded-full border border-white/10 px-6 py-3 text-xs font-medium uppercase tracking-[0.12em] text-[#d5d8dd] transition hover:border-[#dcb873]/50 hover:text-[#dcb873]">
      {label}
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function LocationIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}