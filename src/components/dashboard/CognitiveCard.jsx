import { BookOpen, Check, Layers } from 'lucide-react';
import Card from '../ui/Card.jsx';

const ACCENT = '#60A5FA';
const PRESETS = [15, 30, 45, 60];

export default function CognitiveCard({ day, targets, save }) {
  const minutes = day?.readingMinutes ?? 0;
  const anki = day?.ankiDone ?? false;
  const met = minutes >= targets.readingTarget;

  return (
    <Card
      icon={BookOpen}
      title="Cognitive"
      accent={ACCENT}
      edge
      right={
        <span
          className="tnum font-mono text-sm font-semibold"
          style={{ color: met ? ACCENT : 'rgba(230,233,238,0.5)' }}
        >
          {minutes} min
        </span>
      }
    >
      <p className="mb-2 text-[12.5px] font-medium uppercase tracking-wider text-base-content/40">
        Reading / deep work
      </p>

      {/* One-tap presets */}
      <div className="grid grid-cols-4 gap-1.5">
        {PRESETS.map((m) => {
          const active = minutes === m;
          return (
            <button
              key={m}
              onClick={() => save({ readingMinutes: active ? 0 : m })}
              className={`rounded-btn border py-2 text-sm font-semibold transition-all active:scale-95 ${
                active
                  ? 'border-accent bg-accent text-accent-content'
                  : 'border-white/5 bg-base-300/60 text-base-content/55'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Fine control */}
      <input
        type="range"
        min="0"
        max="120"
        step="5"
        value={minutes}
        onChange={(e) => save({ readingMinutes: Number(e.target.value) })}
        className="range range-xs mt-4 [--range-shdw:theme(colors.accent)]"
        style={{ accentColor: ACCENT }}
        aria-label="Reading minutes"
      />
      <div className="mt-1 flex justify-between font-mono text-[11.5px] text-base-content/30">
        <span>0</span>
        <span>target {targets.readingTarget}m</span>
        <span>120</span>
      </div>

      {/* Spaced repetition — part of the daily floor */}
      <button
        onClick={() => save({ ankiDone: !anki })}
        className={`mt-3 flex w-full items-center justify-between rounded-btn border p-3 transition-all active:scale-[0.98] ${
          anki ? 'border-accent bg-accent/12' : 'border-white/5 bg-base-300/60'
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Layers size={15} style={{ color: ACCENT }} /> Anki / spaced repetition
        </span>
        <span
          className={`grid h-6 w-6 place-items-center rounded-md border transition-colors ${
            anki ? 'border-accent bg-accent text-accent-content' : 'border-base-content/25'
          }`}
        >
          {anki && <Check size={15} strokeWidth={3} />}
        </span>
      </button>
    </Card>
  );
}
