import { CalendarRange, Flag } from 'lucide-react';
import { planForDate, weekNumber, isDeloadWeek } from '../../data/weekplan.js';

/** The auto plan from 1000-Day-OS: the weekday dictates focus, session, and
 *  deep-work block; every 6th protocol week is a deload. */
export default function SessionPlanCard({ dateKey, dayNumber }) {
  const plan = planForDate(dateKey);
  const week = weekNumber(dayNumber);
  const deload = isDeloadWeek(dayNumber);

  return (
    <section className="animate-fade-up overflow-hidden rounded-box border border-white/5 bg-base-200">
      <div className="flex items-center gap-2 px-4 pt-3.5" style={{ color: '#60A5FA' }}>
        <CalendarRange size={15} strokeWidth={2.5} />
        <h2 className="font-display text-[15px] font-semibold tracking-wide text-base-content/90">
          Session plan
        </h2>
        <span className="tnum ml-auto font-mono text-[12px] uppercase tracking-wider text-base-content/45">
          Week {week} · {plan.day}
        </span>
      </div>

      {deload && (
        <div className="mx-4 mt-2.5 flex items-center gap-2 rounded-box border border-warning/30 bg-warning/10 px-3 py-2">
          <Flag size={14} className="shrink-0 text-warning" strokeWidth={2.5} />
          <p className="text-[12.5px] font-semibold text-warning">
            Deload week — go light, keep moving, bank recovery.
          </p>
        </div>
      )}

      <div className="space-y-2 px-4 pb-4 pt-3">
        <PlanLine k="Focus" v={plan.focus} strong />
        <PlanLine k="Session" v={plan.session} />
        <PlanLine k="Deep work" v={plan.deep} />
      </div>
    </section>
  );
}

function PlanLine({ k, v, strong }) {
  return (
    <div className="flex gap-3">
      <span className="w-[4.6rem] shrink-0 pt-px font-mono text-[11.5px] uppercase tracking-wider text-base-content/40">
        {k}
      </span>
      <span className={`text-[13.5px] leading-snug ${strong ? 'font-semibold text-base-content/90' : 'text-base-content/65'}`}>
        {v}
      </span>
    </div>
  );
}
