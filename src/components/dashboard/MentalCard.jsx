import { useState } from 'react';
import { Brain, Check, Timer, Waves, Users } from 'lucide-react';
import MeditationTimer from './MeditationTimer.jsx';
import Card from '../ui/Card.jsx';

const ACCENT = '#FB7185';

const MOODS = [
  { value: 1, emoji: '😣', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Excellent' },
];

export default function MentalCard({ day, save }) {
  const [timerOpen, setTimerOpen] = useState(false);
  const mindfulness = day?.mindfulness ?? false;
  const nsdr = day?.nsdrMin ?? 0;
  const family = day?.familyTime ?? false;
  const mood = day?.mood ?? null;
  const current = MOODS.find((m) => m.value === mood);

  return (
    <Card icon={Brain} title="Mental health" accent={ACCENT} edge>
      {/* Mindfulness toggle + guided timer */}
      <div className="flex gap-1.5">
      <button
        onClick={() => save({ mindfulness: !mindfulness })}
        className={`flex w-full items-center justify-between rounded-btn border p-3 transition-all active:scale-[0.98] ${
          mindfulness
            ? 'border-[#FB7185] bg-[#FB7185]/12'
            : 'border-white/5 bg-base-300/60'
        }`}
      >
        <span className="text-sm font-semibold">Mindfulness session</span>
        <span
          className={`grid h-6 w-6 place-items-center rounded-md border transition-colors ${
            mindfulness ? 'border-[#FB7185] bg-[#FB7185] text-white' : 'border-base-content/25'
          }`}
        >
          {mindfulness && <Check size={15} strokeWidth={3} />}
        </span>
      </button>
      <button
        onClick={() => setTimerOpen(true)}
        aria-label="Start guided timer"
        className="grid w-12 shrink-0 place-items-center rounded-btn border border-white/5 bg-base-300/60 text-[#FB7185] active:scale-95"
      >
        <Timer size={18} strokeWidth={2.3} />
      </button>
      </div>

      {/* NSDR — non-sleep deep rest */}
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium uppercase tracking-wider text-base-content/40">
          <Waves size={13} style={{ color: ACCENT }} /> NSDR
        </span>
        <span className="tnum font-mono text-[12.5px]" style={{ color: nsdr > 0 ? ACCENT : 'rgba(230,233,238,0.35)' }}>
          {nsdr > 0 ? `${nsdr} min` : '—'}
        </span>
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {[10, 20, 30].map((m) => {
          const active = nsdr === m;
          return (
            <button
              key={m}
              onClick={() => save({ nsdrMin: active ? 0 : m })}
              className={`rounded-btn border py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
                active ? 'border-[#FB7185] bg-[#FB7185]/15 text-[#FB7185]' : 'border-white/5 bg-base-300/60 text-base-content/55'
              }`}
            >
              {m}m
            </button>
          );
        })}
      </div>

      {/* Family time — protected, non-negotiable */}
      <button
        onClick={() => save({ familyTime: !family })}
        className={`mt-3 flex w-full items-center justify-between rounded-btn border p-3 transition-all active:scale-[0.98] ${
          family ? 'border-[#FB7185] bg-[#FB7185]/12' : 'border-white/5 bg-base-300/60'
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Users size={15} style={{ color: ACCENT }} /> Family time
        </span>
        <span
          className={`grid h-6 w-6 place-items-center rounded-md border transition-colors ${
            family ? 'border-[#FB7185] bg-[#FB7185] text-white' : 'border-base-content/25'
          }`}
        >
          {family && <Check size={15} strokeWidth={3} />}
        </span>
      </button>

      {/* Mood selector */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12.5px] font-medium uppercase tracking-wider text-base-content/40">
          Mood
        </p>
        <span className="text-[12.5px] font-medium" style={{ color: current ? ACCENT : 'transparent' }}>
          {current?.label ?? ''}
        </span>
      </div>
      <div className="mt-2 flex justify-between gap-1.5">
        {MOODS.map((m) => {
          const active = mood === m.value;
          return (
            <button
              key={m.value}
              onClick={() => save({ mood: active ? null : m.value })}
              aria-label={m.label}
              className={`flex flex-1 flex-col items-center rounded-btn border py-2 transition-all active:scale-90 ${
                active
                  ? 'border-[#FB7185] bg-[#FB7185]/15 animate-pop'
                  : 'border-white/5 bg-base-300/60 opacity-60'
              }`}
            >
              <span className="text-xl leading-none">{m.emoji}</span>
            </button>
          );
        })}
      </div>
      <MeditationTimer
        open={timerOpen}
        onClose={() => setTimerOpen(false)}
        onComplete={() => save({ mindfulness: true })}
      />
    </Card>
  );
}
