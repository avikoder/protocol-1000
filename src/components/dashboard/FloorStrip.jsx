import { useLiveQuery } from 'dexie-react-hooks';
import { Shield } from 'lucide-react';
import { db } from '../../db/db.js';
import { FLOOR_ITEMS, floorChecks, floorStreak } from '../../lib/stats.js';

/** "The floor that cannot break" (1000-Day-OS): move · Anki · sleep ≥6h ·
 *  reflect. Lower bar than the pillars — a minimum-viable day, every day. */
export default function FloorStrip({ day, dayNumber }) {
  const allDays = useLiveQuery(() => db.days.toArray(), []) ?? [];
  const checks = floorChecks(day);
  const streak = floorStreak(allDays, dayNumber);
  const allDone = FLOOR_ITEMS.every((i) => checks[i.key]);

  return (
    <section className="animate-fade-up rounded-box border border-white/5 bg-base-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-wider text-base-content/45">
          <Shield size={13} className={allDone ? 'text-success' : 'text-base-content/35'} strokeWidth={2.5} />
          Daily floor
        </span>
        {streak > 0 && (
          <span className="tnum rounded-badge bg-success/12 px-2 py-0.5 font-mono text-[11.5px] font-bold text-success">
            {streak}d unbroken
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {FLOOR_ITEMS.map((item) => {
          const done = checks[item.key];
          return (
            <div
              key={item.key}
              className={`flex flex-col items-center rounded-box border py-2 transition-all ${
                done ? 'border-success/40 bg-success/10' : 'border-white/5 bg-base-300/40'
              }`}
            >
              <span className={`text-lg leading-none ${done ? '' : 'opacity-40 grayscale'}`}>{item.emoji}</span>
              <span className={`mt-1 text-[10.5px] font-semibold ${done ? 'text-success' : 'text-base-content/40'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
