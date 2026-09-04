"use client";

export default function TermsAndConditions({
  accepted,
  onChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        
        <h3 className="mt-2 text-lg font-bold text-slate-900">
          Exhibition Stall Rules & Terms
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Please read and accept the following exhibition stall rules before
          proceeding to payment.
        </p>
      </div>

      {/* Important Rules - Top */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-slate-900">
          Important Rules
        </p>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          <li>
            Stall size is strictly limited to <strong>6 × 6 ft</strong>.
          </li>

          <li>
            Prior approval is required for large banners and closed
            compartments.
          </li>

          <li>
            All structures, displays, products and materials must remain
            within the allocated stall area.
          </li>

          <li>
            The organisers reserve the right to relocate stalls when required
            for layout, safety or event management.
          </li>

          <li>
            A stall is confirmed only after <strong>full payment</strong> is
            received.
          </li>

          <li>
            Cancellation <strong>25 days or more</strong> before the event:
            <strong> 80% refund</strong>.
          </li>

          <li>
            Cancellation <strong>less than 25 days</strong> before the event:
            <strong> No refund</strong>.
          </li>
        </ul>
      </div>

      {/* Detailed Terms */}
      <div className="mt-5 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <ol className="space-y-5 text-sm leading-6 text-slate-700">
          {/* 1. Stall Size */}
          <li>
            <strong>1. Stall Size</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Each full stall measures 6 ft × 6 ft.</li>
              <li>
                All tables, stands, racks, banners, products and display
                materials must remain within the allocated stall area.
              </li>
              <li>
                Displays must not extend into walkways or neighbouring stalls.
              </li>
            </ul>
          </li>

          {/* 2. Tables & Chairs */}
          <li>
            <strong>2. Tables & Chairs</strong>

            <p className="mt-2">A full stall includes:</p>

            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>2 tables</li>
              <li>2 chairs</li>
            </ul>

            <p className="mt-2">Table allocation based on setup:</p>

            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Shared stall: No extra table</li>
              <li>
                Full stall requesting an additional table: Maximum 1 extra
                table
              </li>
              <li>Using 1 stand/rack: 2 tables provided</li>
              <li>Using 2 stands/racks: 1 table provided</li>
              <li>Using 3 stands/racks: No table provided</li>
            </ul>

            <p className="mt-2">
              All additional requirements must be informed in advance.
            </p>
          </li>

          {/* 3. Own Stands, Racks & Display Units */}
          <li>
            <strong>3. Own Stands, Racks & Display Units</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Exhibitors bringing their own stands, racks or display units
                must inform the organisers in advance.
              </li>
              <li>
                The dimensions and type of display should be shared before the
                event when requested.
              </li>
              <li>
                All structures must fit completely within the allocated 6 × 6
                ft stall.
              </li>
              <li>Oversized structures may not be permitted.</li>
            </ul>
          </li>

          {/* 4. Closed Compartments */}
          <li>
            <strong>4. Closed Compartments / Enclosed Displays</strong>

            <p className="mt-2">
              Exhibitors planning to bring closed compartments, enclosed
              display units, partitions or similar structures must inform the
              organisers in advance.
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Such setups will be permitted only in specifically approved
                areas.
              </li>
              <li>
                The organisers reserve the right to change or reallocate the
                exhibitor’s stall location depending on the size and nature of
                the structure.
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
          </li>

          {/* 5. Banners & Branding */}
          <li>
            <strong>5. Banners & Branding</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Exhibitors bringing large banners, backdrop frames, standees
                or branding structures must inform the organisers in advance.
              </li>
              <li>
                Large banners or structures may be allowed only in designated
                spaces.
              </li>
              <li>
                Branding materials must remain within the allotted stall and
                must not obstruct another exhibitor’s visibility.
              </li>
              <li>
                Nothing should be permanently fixed, drilled, nailed or
                attached to the venue walls, flooring or property without
                permission.
              </li>
            </ul>
          </li>

          {/* 6. Stall Sharing */}
          <li>
            <strong>6. Stall Sharing</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Stall sharing must be informed to and approved by the
                organisers in advance.
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
          </li>

          {/* 7. Stall Allocation */}
          <li>
            <strong>7. Stall Allocation</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
          </li>

          {/* 8. Stall Confirmation & Payment */}
          <li>
            <strong>8. Stall Confirmation & Payment</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                A stall will be considered confirmed only after full payment is
                received.
              </li>
              <li>Submitting the registration alone does not confirm the stall.</li>
              <li>
                Stall availability will remain subject to confirmation until
                payment is completed.
              </li>
              <li>
                Extra requirements should also be submitted through the
                prescribed form or communicated before the stated deadline.
              </li>
            </ul>
          </li>

          {/* 9. Cancellation & Refund */}
          <li>
            <strong>9. Cancellation & Refund Policy</strong>

            <p className="mt-2 font-semibold text-slate-800">
              Cancellation 25 days or more before the event:
            </p>

            <p className="mt-1">
              80% of the stall amount paid will be refunded. The remaining 20%
              will be retained towards booking and administrative costs.
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              Cancellation less than 25 days before the event:
            </p>

            <p className="mt-1">No refund will be provided.</p>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
          </li>

          {/* 10. Event Postponement */}
          <li>
            <strong>
              10. Event Postponement or Circumstances Beyond Control
            </strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                If the event has to be postponed due to circumstances beyond the
                organisers’ reasonable control, the stall booking may be
                transferred to the rescheduled date.
              </li>
              <li>
                Any refund or credit applicable in such circumstances will be
                communicated separately depending on the situation.
              </li>
              <li>
                The organisers will not be responsible for exhibitors’ travel,
                accommodation, transportation, staffing or other external
                expenses.
              </li>
            </ul>
          </li>

          {/* 11. Setup & Dismantling */}
          <li>
            <strong>11. Setup & Dismantling</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
                All materials brought by the exhibitor must be removed after
                the event.
              </li>
            </ul>
          </li>

          {/* 12. Cleanliness */}
          <li>
            <strong>12. Cleanliness</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
          </li>

          {/* 13. Venue Property */}
          <li>
            <strong>13. Venue Property & Damage</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Exhibitors are responsible for any damage caused by them, their
                staff, contractors, fixtures or display materials.
              </li>
              <li>
                Any repair or replacement charges imposed by the venue because
                of such damage may be recovered from the concerned exhibitor.
              </li>
            </ul>
          </li>

          {/* 14. Electrical Requirements */}
          <li>
            <strong>14. Electrical Requirements</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
                Extension boards, lighting and wiring should not create a
                safety or tripping hazard.
              </li>
            </ul>
          </li>

          {/* 15. Safety */}
          <li>
            <strong>15. Safety</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
          </li>

          {/* 16. Products & Activities */}
          <li>
            <strong>16. Products & Activities</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Exhibitors should display or sell products/services consistent
                with the category declared during registration.
              </li>
              <li>
                Activities creating excessive noise, obstruction or
                inconvenience to neighbouring stalls may be restricted.
              </li>
              <li>
                Any demonstrations, food preparation, machinery or unusual
                activities should be disclosed beforehand.
              </li>
            </ul>
          </li>

          {/* 17. Exhibitor Responsibility */}
          <li>
            <strong>17. Exhibitor Responsibility</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
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
          </li>

          {/* 18. Conduct */}
          <li>
            <strong>18. Conduct</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Exhibitors and their team members are expected to maintain
                professional and respectful behaviour with visitors,
                organisers, venue staff and other exhibitors.
              </li>
              <li>
                Any behaviour that seriously disrupts the exhibition may result
                in appropriate action by the organisers.
              </li>
            </ul>
          </li>

          {/* 19. Photography */}
          <li>
            <strong>19. Photography & Event Coverage</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                The organisers may photograph or record the exhibition for
                event documentation, promotional content and social media.
              </li>
              <li>
                Exhibitors who have any specific concern regarding photography
                of their stall should inform the organisers beforehand.
              </li>
            </ul>
          </li>

          {/* 20. Acceptance */}
          <li>
            <strong>20. Acceptance of Terms</strong>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Completing the stall booking and making payment will be
                considered confirmation that the exhibitor has read, understood
                and accepted the exhibition rules and terms.
              </li>
              <li>
                The organisers may make reasonable operational changes when
                required for the smooth and safe conduct of the exhibition.
              </li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Acceptance Checkbox */}
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-300">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
        />

        <span className="text-sm font-medium leading-6 text-slate-700">
          I have read and understood the Rules & Terms and Conditions above,
          and I agree to comply with them.
        </span>
      </label>
    </div>
  );
}