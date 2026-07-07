import { useEffect, useState } from 'react';
import { Scale, Minus, Plus } from 'lucide-react';
import Card from '../ui/Card.jsx';

const ACCENT = '#A78BFA';

/** Compact half-width bodyweight logger. Feeds the adaptive plan + trend chart. */
export default function VitalsCard({ day, save }) {
  const stored = day?.weight ?? null;
  const [draft, setDraft] = useState(stored != null ? String(stored) : '');

  // Keep the input in sync if the underlying day changes (e.g. date navigation).
  useEffect(() => {
    setDraft(stored != null ? String(stored) : '');
  }, [stored, day?.date]);

  const commit = (value) => {
    if (value === '' || value == null) {
      save({ weight: null });
      return;
    }
    const num = Math.round(Number(value) * 10) / 10;
    if (!Number.isNaN(num) && num > 0) save({ weight: num });
  };

  const nudge = (delta) => {
    const base = stored ?? 80;
    const next = Math.round((base + delta) * 10) / 10;
    setDraft(String(next));
    commit(next);
  };

  return (
    <Card icon={Scale} title="Weight" accent={ACCENT} edge padding="p-3.5">
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={draft}
          placeholder="—"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          className="tnum w-20 bg-transparent font-mono text-2xl font-bold leading-none outline-none placeholder:text-base-content/25"
          style={{ color: stored != null ? ACCENT : undefined }}
        />
        <span className="font-mono text-[13px] text-base-content/40">kg</span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          onClick={() => nudge(-0.1)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
          aria-label="Decrease weight"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={() => nudge(0.1)}
          className="grid h-8 flex-1 place-items-center rounded-lg text-[13px] font-semibold active:scale-95"
          style={{ backgroundColor: `${ACCENT}22`, color: ACCENT }}
        >
          <span className="flex items-center gap-1"><Plus size={14} /> 0.1</span>
        </button>
      </div>
      <p className="mt-3 text-[12px] leading-snug text-base-content/35">
        Morning, post-bathroom, pre-food — same conditions daily.
      </p>
    </Card>
  );
}
