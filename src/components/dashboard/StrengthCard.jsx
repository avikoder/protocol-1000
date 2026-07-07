import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Dumbbell, Plus, Minus, X, Star, ChevronDown } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { db } from '../../db/db.js';
import { LIFT_PRESETS, e1rm, bestBefore } from '../../lib/lifts.js';

const ACCENT = '#2DD4BF';

/** Log top sets per lift. Each entry shows its e1RM; beating your all-time
 *  best for that lift earns a PR star — the strength side of hypertrophy. */
export default function StrengthCard({ day, save }) {
  const lifts = day?.lifts ?? [];
  const allDays = useLiveQuery(() => db.days.toArray(), []) ?? [];

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(LIFT_PRESETS[0]);
  const [custom, setCustom] = useState('');
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(5);

  const finalName = custom.trim() || name;
  const preview = e1rm(weight, reps);

  const add = () => {
    if (!finalName || preview <= 0) return;
    const entry = {
      id: `l_${Date.now().toString(36)}`,
      name: finalName,
      weightKg: weight,
      reps,
    };
    save({ lifts: [...lifts, entry] });
    setCustom('');
    setOpen(false);
  };

  const remove = (id) => save({ lifts: lifts.filter((l) => l.id !== id) });

  return (
    <Card
      icon={Dumbbell}
      title="Strength log"
      accent={ACCENT}
      edge
      right={
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1 rounded-btn px-2.5 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
            open ? 'bg-base-300 text-base-content/70' : 'bg-primary/15 text-primary'
          }`}
        >
          {open ? <ChevronDown size={14} /> : <Plus size={14} />} {open ? 'Close' : 'Add lift'}
        </button>
      }
    >
      {/* Today's entries */}
      {lifts.length === 0 && !open && (
        <p className="text-[13px] text-base-content/40">
          Log your top set per lift — PRs are detected automatically.
        </p>
      )}

      {lifts.length > 0 && (
        <ul className="space-y-1.5">
          {lifts.map((l) => {
            const v = e1rm(l.weightKg, l.reps);
            const isPR = v > bestBefore(allDays, l.name, day?.date ?? '9999');
            return (
              <li
                key={l.id}
                className="flex items-center gap-2 rounded-box bg-base-300/50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{l.name}</p>
                  <p className="tnum font-mono text-[12px] text-base-content/45">
                    {l.weightKg} kg × {l.reps}
                  </p>
                </div>
                {isPR && (
                  <span className="flex items-center gap-1 rounded-badge bg-warning/15 px-2 py-0.5 text-[11.5px] font-bold text-warning">
                    <Star size={11} fill="currentColor" /> PR
                  </span>
                )}
                <span className="tnum rounded-badge bg-primary/10 px-2 py-0.5 font-mono text-[12px] font-semibold text-primary">
                  e1RM {v}
                </span>
                <button
                  onClick={() => remove(l.id)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-base-content/35 active:scale-90"
                  aria-label={`Remove ${l.name}`}
                >
                  <X size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add form */}
      {open && (
        <div className="mt-3 rounded-box border border-white/5 bg-base-300/40 p-3">
          <div className="flex flex-wrap gap-1.5">
            {LIFT_PRESETS.map((p) => {
              const active = !custom && name === p;
              return (
                <button
                  key={p}
                  onClick={() => { setName(p); setCustom(''); }}
                  className={`rounded-btn border px-2.5 py-1.5 text-[12.5px] font-semibold transition-all active:scale-95 ${
                    active ? 'border-primary bg-primary/15 text-primary' : 'border-white/5 bg-base-200 text-base-content/55'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="…or a custom lift"
            className="mt-2 w-full rounded-lg bg-base-200 px-3 py-2 text-[14px] outline-none placeholder:text-base-content/30"
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stepper label="Weight" value={weight} unit="kg" step={2.5} min={2.5} max={400} onChange={setWeight} />
            <Stepper label="Reps" value={reps} unit="" step={1} min={1} max={30} onChange={setReps} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="tnum font-mono text-[12.5px] text-base-content/50">
              → e1RM <span className="font-bold text-primary">{preview} kg</span>
            </p>
            <button
              onClick={add}
              className="rounded-btn bg-primary px-4 py-2 text-[13.5px] font-bold text-primary-content active:scale-95"
            >
              Log set
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Stepper({ label, value, unit, step, min, max, onChange }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, Math.round(v * 10) / 10)));
  return (
    <div>
      <p className="mb-1 text-[11.5px] uppercase tracking-wider text-base-content/40">{label}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => set(value - step)} className="grid h-8 w-8 place-items-center rounded-lg bg-base-200 text-base-content/70 active:scale-90" aria-label={`decrease ${label}`}>
          <Minus size={14} />
        </button>
        <span className="tnum flex-1 text-center font-mono text-[15px] font-bold">
          {value}{unit && <span className="text-[11px] font-medium text-base-content/40"> {unit}</span>}
        </span>
        <button onClick={() => set(value + step)} className="grid h-8 w-8 place-items-center rounded-lg bg-base-200 text-base-content/70 active:scale-90" aria-label={`increase ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
