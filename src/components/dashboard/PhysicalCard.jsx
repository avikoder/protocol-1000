import { useEffect, useState } from 'react';
import { Dumbbell, Footprints, HeartPulse, Minus, Plus } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { WORKOUT_TYPES } from '../../db/db.js';

const ACCENT = '#2DD4BF';

export default function PhysicalCard({ day, targets, save }) {
  const workoutType = day?.workoutType ?? null;
  const steps = day?.steps ?? 0;
  const cardio = day?.cardioMin ?? 0;
  const stepPct = Math.min(100, Math.round((steps / targets.stepTarget) * 100));

  // Session notes: local draft, committed on blur (typing stays snappy).
  const [notes, setNotes] = useState(day?.sessionNotes ?? '');
  useEffect(() => setNotes(day?.sessionNotes ?? ''), [day?.date, day?.sessionNotes]);

  const selectWorkout = (type) => {
    // Tapping the active chip clears it; otherwise select + mark done.
    if (workoutType === type) save({ workoutType: null, workoutDone: false });
    else save({ workoutType: type, workoutDone: true });
  };

  const bumpSteps = (delta) => save({ steps: Math.max(0, steps + delta) });
  const bumpCardio = (delta) => save({ cardioMin: Math.max(0, cardio + delta) });

  return (
    <Card icon={Dumbbell} title="Physical" accent={ACCENT} edge>
      {/* Workout split */}
      <p className="mb-1.5 text-[12.5px] font-medium uppercase tracking-wider text-base-content/40">
        Today's session
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {WORKOUT_TYPES.map((type) => {
          const active = workoutType === type;
          const isRest = type === 'Rest';
          return (
            <button
              key={type}
              onClick={() => selectWorkout(type)}
              className={`rounded-btn border py-2 text-sm font-semibold transition-all active:scale-95 ${
                active
                  ? isRest
                    ? 'border-base-content/20 bg-base-content/10 text-base-content'
                    : 'border-primary bg-primary text-primary-content shadow-glow'
                  : 'border-white/5 bg-base-300/60 text-base-content/55'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Session notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== (day?.sessionNotes ?? '')) save({ sessionNotes: notes });
        }}
        rows={2}
        placeholder="Session notes — top sets, how it felt…"
        className="mt-2 w-full resize-none rounded-box border border-white/5 bg-base-300/40 px-3 py-2 text-[13.5px] leading-snug outline-none placeholder:text-base-content/25 focus:border-primary/40"
      />

      {/* Cardio */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse size={16} className="text-base-content/40" />
          <div>
            <p className="tnum font-mono text-lg font-semibold leading-none">{cardio}</p>
            <p className="text-[12.5px] text-base-content/40">cardio / zone-2 min</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => bumpCardio(-10)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
            aria-label="Subtract 10 cardio minutes"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => bumpCardio(10)}
            className="flex h-8 items-center gap-1 rounded-lg bg-primary/15 px-2.5 text-sm font-semibold text-primary active:scale-90"
          >
            <Plus size={14} /> 10m
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Footprints size={16} className="text-base-content/40" />
          <div>
            <p className="tnum font-mono text-lg font-semibold leading-none">
              {steps.toLocaleString()}
            </p>
            <p className="text-[12.5px] text-base-content/40">of {targets.stepTarget.toLocaleString()} steps</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => bumpSteps(-1000)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
            aria-label="Subtract 1000 steps"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => bumpSteps(1000)}
            className="flex h-8 items-center gap-1 rounded-lg bg-primary/15 px-2.5 text-sm font-semibold text-primary active:scale-90"
          >
            <Plus size={14} /> 1k
          </button>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${stepPct}%` }}
        />
      </div>
    </Card>
  );
}
