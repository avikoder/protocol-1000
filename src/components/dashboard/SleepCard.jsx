import { MoonStar, Minus, Plus } from 'lucide-react';
import Card from '../ui/Card.jsx';

const ACCENT = '#A78BFA';

/** Compact half-width card: hours of sleep (±0.5) + 5-dot quality. */
export default function SleepCard({ day, targets, save }) {
  const hours = day?.sleepHours ?? null;
  const quality = day?.sleepQuality ?? null;
  const target = targets.sleepTargetH ?? 7.5;

  const bump = (delta) => {
    const base = hours ?? target;
    const next = Math.max(0, Math.min(14, Math.round((base + delta) * 2) / 2));
    save({ sleepHours: next });
  };

  return (
    <Card icon={MoonStar} title="Sleep" accent={ACCENT} edge padding="p-3.5">
      <div className="flex items-baseline gap-1">
        <span
          className="tnum font-mono text-2xl font-bold leading-none"
          style={{ color: hours != null ? ACCENT : 'rgba(230,233,238,0.25)' }}
        >
          {hours != null ? hours : '—'}
        </span>
        <span className="font-mono text-[13px] text-base-content/40">/ {target} h</span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          onClick={() => bump(-0.5)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
          aria-label="Half hour less sleep"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={() => bump(0.5)}
          className="grid h-8 flex-1 place-items-center rounded-lg text-[13px] font-semibold active:scale-95"
          style={{ backgroundColor: `${ACCENT}22`, color: ACCENT }}
        >
          <span className="flex items-center gap-1"><Plus size={14} /> 30 min</span>
        </button>
      </div>

      {/* Quality dots */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] text-base-content/40">Quality</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((q) => (
            <button
              key={q}
              onClick={() => save({ sleepQuality: quality === q ? null : q })}
              aria-label={`Sleep quality ${q}`}
              className="h-3.5 w-3.5 rounded-full transition-all active:scale-75"
              style={{
                backgroundColor: quality != null && q <= quality ? ACCENT : 'rgba(255,255,255,0.10)',
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
