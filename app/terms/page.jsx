"use client";

import Image from "next/image";

const terms = [
  {
    number: "01",
    title: "Stall Size",
    content: (
      <>
        <p>
          Each full stall measures <strong>6 ft × 6 ft</strong>.
        </p>

        <ul>
          <li>
            All tables, stands, racks, banners, products and display
            materials must remain within the allocated stall area.
          </li>
          <li>
            Displays must not extend into walkways or neighbouring stalls.
          </li>
        </ul>
      </>
    ),
  },

  {
    number: "02",
    title: "Tables & Chairs",
    content: (
      <>
        <p>
          A full stall includes <strong>2 tables and 2 chairs</strong>.
        </p>

        <p className="mt-4 font-semibold text-[#7d1727]">
          Table allocation based on setup:
        </p>

        <ul>
          <li>
            <strong>Shared stall:</strong> No extra table.
          </li>
          <li>
            <strong>Full stall requesting an additional table:</strong>{" "}
            Maximum 1 extra table.
          </li>
          <li>
            <strong>Using 1 stand/rack:</strong> 2 tables provided.
          </li>
          <li>
            <strong>Using 2 stands/racks:</strong> 1 table provided.
          </li>
          <li>
            <strong>Using 3 stands/racks:</strong> No table provided.
          </li>
        </ul>

        <p className="mt-4">
          All additional requirements must be informed in advance.
        </p>
      </>
    ),
  },

  {
    number: "03",
    title: "Own Stands, Racks & Display Units",
    content: (
      <ul>
        <li>
          Exhibitors bringing their own stands, racks or display units
          must inform the organisers in advance.
        </li>
        <li>
          The dimensions and type of display should be shared before the
          event when requested.
        </li>
        <li>
          All structures must fit completely within the allocated{" "}
          <strong>6 × 6 ft</strong> stall.
        </li>
        <li>Oversized structures may not be permitted.</li>
      </ul>
    ),
  },

  {
    number: "04",
    title: "Closed Compartments / Enclosed Displays",
    content: (
      <>
        <p>
          Exhibitors planning to bring closed compartments, enclosed
          display units, partitions or similar structures must inform the
          organisers in advance.
        </p>

        <ul>
          <li>
            Such setups will be permitted only in specifically approved
            areas.
          </li>
          <li>
            The organisers reserve the right to change or reallocate the
            exhibitor&apos;s stall location depending on the size and
            nature of the structure.
          </li>
          <li>
            Bringing an enclosed structure without prior approval does not
            guarantee that the originally allotted stall can be retained.
          </li>
          <li>
            If the structure affects neighbouring stalls, visibility,
            access or event layout, the organiser may request modification,
            relocation or removal of the structure.
          </li>
        </ul>
      </>
    ),
  },

  {
    number: "05",
    title: "Banners & Branding",
    content: (
      <ul>
        <li>
          Exhibitors bringing large banners, backdrop frames, standees or
          branding structures must inform the organisers in advance.
        </li>
        <li>
          Large banners or structures may be allowed only in designated
          spaces.
        </li>
        <li>
          Branding materials must remain within the allotted stall and
          must not obstruct another exhibitor&apos;s visibility.
        </li>
        <li>
          Nothing should be permanently fixed, drilled, nailed or attached
          to the venue walls, flooring or property without permission.
        </li>
      </ul>
    ),
  },

  {
    number: "06",
    title: "Stall Sharing",
    content: (
      <ul>
        <li>
          Stall sharing must be informed to and approved by the organisers
          in advance.
        </li>
        <li>
          All participating brands/businesses sharing the stall should be
          declared during registration.
        </li>
        <li>
          A stall cannot be transferred, resold or shared with another
          business without organiser approval.
        </li>
        <li>
          Additional tables will not be provided for shared stalls unless
          specifically agreed beforehand.
        </li>
      </ul>
    ),
  },

  {
    number: "07",
    title: "Stall Allocation",
    content: (
      <ul>
        <li>
          Stall locations are allocated by the organisers based on the
          overall exhibition layout and operational requirements.
        </li>
        <li>
          Requests for particular locations may be considered but cannot
          be guaranteed.
        </li>
        <li>
          The organisers reserve the right to relocate or adjust a stall
          when necessary for layout, safety, crowd movement or event
          management.
        </li>
        <li>
          Relocation of a stall within the exhibition will not be
          considered a cancellation.
        </li>
      </ul>
    ),
  },

  {
    number: "08",
    title: "Stall Confirmation & Payment",
    content: (
      <ul>
        <li>
          A stall will be considered confirmed only after{" "}
          <strong>full payment is received</strong>.
        </li>
        <li>
          Submitting the registration alone does not confirm the stall.
        </li>
        <li>
          Stall availability will remain subject to confirmation until
          payment is completed.
        </li>
        <li>
          Extra requirements should also be submitted through the
          prescribed form or communicated before the stated deadline.
        </li>
      </ul>
    ),
  },

  {
    number: "09",
    title: "Cancellation & Refund Policy",
    highlight: true,
    content: (
      <>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#a77932]/25 bg-[#fbf6ed] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7d1727]">
              25 days or more before the event
            </p>

            <p className="mt-1 text-xl font-bold text-[#7d1727]">
              80% Refund
            </p>

            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              80% of the stall amount paid will be refunded. The remaining
              20% will be retained towards booking and administrative
              costs.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-700">
              Less than 25 days before the event
            </p>

            <p className="mt-1 text-xl font-bold text-red-700">
              No Refund
            </p>

            <p className="mt-1.5 text-xs leading-5 text-red-700/80">
              No refund will be provided for cancellations received less
              than 25 days before the event.
            </p>
          </div>
        </div>

        <ul className="mt-5">
          <li>
            Refund eligibility will be calculated based on the date the
            organisers receive the written cancellation request.
          </li>
          <li>
            Approved refunds will be processed to the original payment
            method or agreed bank account.
          </li>
          <li>
            Stall bookings cannot automatically be transferred to another
            event unless specifically approved by the organisers.
          </li>
        </ul>
      </>
    ),
  },

  {
    number: "10",
    title: "Event Postponement or Circumstances Beyond Control",
    content: (
      <ul>
        <li>
          If the event has to be postponed due to circumstances beyond the
          organisers&apos; reasonable control, the stall booking may be
          transferred to the rescheduled date.
        </li>
        <li>
          Any refund or credit applicable in such circumstances will be
          communicated separately depending on the situation.
        </li>
        <li>
          The organisers will not be responsible for exhibitors&apos;
          travel, accommodation, transportation, staffing or other
          external expenses.
        </li>
      </ul>
    ),
  },

  {
    number: "11",
    title: "Setup & Dismantling",
    content: (
      <ul>
        <li>
          Exhibitors must follow the official setup and dismantling
          timings communicated by the organisers.
        </li>
        <li>Stall setup should be completed before visitor entry.</li>
        <li>
          Exhibitors should not dismantle their stall before the official
          closing time unless permission is given.
        </li>
        <li>
          All materials brought by the exhibitor must be removed after the
          event.
        </li>
      </ul>
    ),
  },

  {
    number: "12",
    title: "Cleanliness",
    content: (
      <ul>
        <li>
          Each exhibitor is responsible for keeping their stall clean and
          presentable throughout the event.
        </li>
        <li>
          Waste, packaging materials and unused cartons should not be
          stored in public walkways.
        </li>
        <li>The stall area should be left clean after dismantling.</li>
      </ul>
    ),
  },

  {
    number: "13",
    title: "Venue Property & Damage",
    content: (
      <ul>
        <li>
          Exhibitors are responsible for any damage caused by them, their
          staff, contractors, fixtures or display materials.
        </li>
        <li>
          Any repair or replacement charges imposed by the venue because
          of such damage may be recovered from the concerned exhibitor.
        </li>
      </ul>
    ),
  },

  {
    number: "14",
    title: "Electrical Requirements",
    content: (
      <ul>
        <li>
          Any special electrical requirements should be informed in
          advance.
        </li>
        <li>
          High-power equipment should not be connected without approval.
        </li>
        <li>
          Exhibitors should use safe and properly maintained electrical
          equipment.
        </li>
        <li>
          Extension boards, lighting and wiring should not create a safety
          or tripping hazard.
        </li>
      </ul>
    ),
  },

  {
    number: "15",
    title: "Safety",
    content: (
      <ul>
        <li>
          Walkways, entrances, emergency exits and common areas must
          remain unobstructed.
        </li>
        <li>
          Flammable, hazardous or unsafe materials should not be brought
          into the venue without prior approval.
        </li>
        <li>
          Displays must be stable and safe for visitors, especially
          children.
        </li>
      </ul>
    ),
  },

  {
    number: "16",
    title: "Products & Activities",
    content: (
      <ul>
        <li>
          Exhibitors should display or sell products/services consistent
          with the category declared during registration.
        </li>
        <li>
          Activities creating excessive noise, obstruction or inconvenience
          to neighbouring stalls may be restricted.
        </li>
        <li>
          Any demonstrations, food preparation, machinery or unusual
          activities should be disclosed beforehand.
        </li>
      </ul>
    ),
  },

  {
    number: "17",
    title: "Exhibitor Responsibility",
    content: (
      <ul>
        <li>
          Exhibitors are responsible for their products, stock, cash,
          equipment and personal belongings.
        </li>
        <li>
          The organisers cannot be held responsible for loss, theft or
          damage to exhibitor property except where legally required.
        </li>
        <li>
          Exhibitors should arrange adequate staff to manage their stall
          throughout exhibition hours.
        </li>
      </ul>
    ),
  },

  {
    number: "18",
    title: "Conduct",
    content: (
      <ul>
        <li>
          Exhibitors and their team members are expected to maintain
          professional and respectful behaviour with visitors, organisers,
          venue staff and other exhibitors.
        </li>
        <li>
          Any behaviour that seriously disrupts the exhibition may result
          in appropriate action by the organisers.
        </li>
      </ul>
    ),
  },

  {
    number: "19",
    title: "Photography & Event Coverage",
    content: (
      <ul>
        <li>
          The organisers may photograph or record the exhibition for event
          documentation, promotional content and social media.
        </li>
        <li>
          Exhibitors who have any specific concern regarding photography
          of their stall should inform the organisers beforehand.
        </li>
      </ul>
    ),
  },
];

const importantRules = [
  {
    title: "6 × 6 ft Stall Limit",
    text: "All displays, products, racks and structures must remain within the allocated stall.",
  },
  {
    title: "Prior Approval Required",
    text: "Large banners, enclosed compartments and special display structures must be approved in advance.",
  },
  {
    title: "Stall Relocation",
    text: "The organisers may relocate stalls when required for safety, layout or event management.",
  },
  {
    title: "Payment Confirms Your Stall",
    text: "Registration alone does not confirm a stall. Full payment is required.",
  },
  {
    title: "Cancellation Policy",
    text: "80% refund is available for cancellations received 25 days or more before the event. No refund thereafter.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f3] text-slate-800">
      {/* =====================================================
          MOBILE-FIRST HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-[#a77932]/20 bg-[#f7efe4]">
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[#a77932]/10 blur-3xl" />

        <div className="absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-[#7d1727]/5 blur-3xl" />

        <div className="relative mx-auto px-5 pb-10 pt-9 sm:max-w-3xl sm:px-6 sm:pb-14 sm:pt-14 lg:max-w-5xl lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#a77932]/40 bg-white shadow-sm sm:h-20 sm:w-20">
              <Image
                src="/logo.png"
                alt="Yarntree Exhibition & Sale"
                width={58}
                height={58}
                className="h-12 w-12 object-contain sm:h-16 sm:w-16"
              />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a77932] sm:text-xs sm:tracking-[0.3em]">
              Yarntree Exhibition & Sale
            </p>

            <h1 className="mt-2.5 max-w-sm font-serif text-[30px] font-bold leading-tight tracking-tight text-[#7d1727] sm:max-w-none sm:text-5xl">
              Exhibition Stall Rules
            </h1>

            <div className="mt-4 h-px w-14 bg-[#a77932] sm:mt-5 sm:w-20" />

            <p className="mt-4 max-w-md text-[13px] leading-6 text-slate-600 sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-7">
              Please read the following rules and terms carefully before
              completing your stall booking.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          IMPORTANT RULES
      ====================================================== */}
      <section className="px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#a77932]/25 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="mb-5 sm:mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a77932] sm:text-xs sm:tracking-[0.2em]">
              Please Note
            </p>

            <h2 className="mt-1.5 font-serif text-[23px] font-bold text-[#7d1727] sm:text-3xl">
              Important Rules
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Key requirements every exhibitor should know before booking.
            </p>
          </div>

          {/* Mobile = single column */}
          <div className="space-y-2.5 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
            {importantRules.map((rule, index) => (
              <div
                key={rule.title}
                className={`rounded-xl p-4 sm:rounded-2xl sm:p-5 ${
                  index === 4
                    ? "border border-red-200 bg-red-50"
                    : "border border-[#a77932]/15 bg-[#fbf8f3]"
                }`}
              >
                <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#7d1727] text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
                  {index + 1}
                </div>

                <h3 className="text-[13px] font-bold leading-5 text-[#7d1727] sm:text-sm">
                  {rule.title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          TERMS
      ====================================================== */}
      <section className="px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 sm:mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a77932] sm:text-xs sm:tracking-[0.2em]">
              Exhibition Guidelines
            </p>

            <h2 className="mt-1.5 font-serif text-[25px] font-bold text-[#7d1727] sm:text-3xl">
              Stall Rules & Terms
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {terms.map((term) => (
              <article
                key={term.number}
                className={`rounded-2xl border bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7 ${
                  term.highlight
                    ? "border-[#a77932]/40"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-6">
                  {/* Number */}
                  <div className="shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7d1727] font-serif text-[11px] font-bold text-white shadow-sm sm:h-11 sm:w-11 sm:text-sm">
                      {term.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[18px] font-bold leading-6 text-[#7d1727] sm:text-2xl sm:leading-8">
                      {term.title}
                    </h3>

                    <div className="mt-3 text-[13px] leading-6 text-slate-600 sm:mt-4 sm:text-[15px] sm:leading-7">
                      {term.content}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ACCEPTANCE
      ====================================================== */}
      <section className="border-t border-[#a77932]/20 bg-[#f7efe4]">
        <div className="mx-auto px-4 py-8 sm:max-w-5xl sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-2xl border border-[#7d1727]/10 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-9">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7d1727] text-white sm:h-11 sm:w-11">
                <CheckIcon />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a77932] sm:text-xs sm:tracking-[0.2em]">
                  Final Confirmation
                </p>

                <h2 className="mt-1.5 font-serif text-[22px] font-bold leading-7 text-[#7d1727] sm:text-3xl">
                  Acceptance of Terms
                </h2>

                <p className="mt-3 text-[13px] leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7">
                  Completing the stall booking and making payment will be
                  considered confirmation that the exhibitor has read,
                  understood and accepted the exhibition rules and terms.
                </p>

                <p className="mt-3 text-[13px] leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7">
                  The organisers may make reasonable operational changes
                  when required for the smooth and safe conduct of the
                  exhibition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto px-4 py-6 text-center sm:max-w-5xl sm:px-6">
          <p className="text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
            Yarntree Exhibition & Sale · Please retain a copy of these
            terms for your reference.
          </p>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sm:h-5 sm:w-5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}