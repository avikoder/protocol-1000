import { useLiveQuery } from 'dexie-react-hooks';
import { Lock, Check, Dumbbell, Beef, BookOpen, Brain, Flame, Droplet, Repeat } from 'lucide-react';
import { db } from '../../db/db.js';
import { PHASES, phaseStatus, phaseProgress } from '../../data/roadmap.js';
import { useTargets } from '../../hooks/useTargets.js';
import { weightTrend, hypertrophyReview, trainingPrescription } from '../../lib/progression.js';

const PILLAR_META = [
  { key: 'physical', label: 'Training', icon: Dumbbell, color: '#2DD4BF' },
  { key: 'nutrition', label: 'Nutrition', icon: Beef, color: '#FBBF24' },
  { key: 'cognitive', label: 'Cognitive', icon: BookOpen, color: '#60A5FA' },
  { key: 'mental', label: 'Mental', icon: Brain, color: '#FB7185' },
];

const TONE = { good: '#34D399', warn: '#FBBF24', info: '#60A5FA' };

function StatusBadge({ status }) {
  if (status === 'complete')
    return (
      <span className="flex items-center gap-1 rounded-badge bg-success/15 px-2 py-0.5 text-[12.5px] font-semibold text-success">
        <Check size={11} strokeWidth={3} /> Done
      </span>
    );
  if (status === 'active')
    return (
      <span className="flex items-center gap-1 rounded-badge bg-primary/15 px-2 py-0.5 text-[12.5px] font-semibold text-primary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Active
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-badge bg-base-300 px-2 py-0.5 text-[12.5px] font-semibold text-base-content/40">
      <Lock size={10} /> Locked
    </span>
  );
}

/** Live, computed prescription for the phase the user is currently in. */
function LivePrescription({ phase, profile, targets }) {
  const days = useLiveQuery(() => db.days.toArray(), []) ?? [];
  const trend = weightTrend(days);
  const review = hypertrophyReview(profile, trend, targets.basisWeight);
  const rx = trainingPrescription(phase.id, profile);
  const tone = TONE[review.tone] ?? TONE.info;

  const tiles = [
    { icon: Repeat, label: 'Weekly sets', value: rx.sets, sub: `${rx.rep} · ${rx.intensity}`, color: '#2DD4BF' },
    { icon: Flame, label: 'Energy', value: targets.calorieTarget.toLocaleString(), sub: `${targets.surplusKcal >= 0 ? '+' : ''}${targets.surplusKcal} kcal`, color: '#FB923C' },
    { icon: Beef, label: 'Protein', value: `${targets.proteinTarget}g`, sub: `${targets.proteinPerKg} g/kg`, color: '#FBBF24' },
    { icon: Droplet, label: 'Water', value: `${(targets.waterTarget / 1000).toFixed(1)}L`, sub: `${rx.daysPerWeek}× train/wk`, color: '#60A5FA' },
  ];

  return (
    <div className="mt-3 rounded-box border border-primary/20 bg-base-300/40 p-3">
      <p className="mb-2 flex items-center gap-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-wider text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Your live prescription · {targets.basisWeight} kg
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-box bg-base-200/70 p-2.5">
            <div className="flex items-center gap-1.5">
              <t.icon size={13} style={{ color: t.color }} strokeWidth={2.5} />
              <span className="text-[11.5px] uppercase tracking-wide text-base-content/45">{t.label}</span>
            </div>
            <p className="tnum mt-1 font-mono text-[16px] font-bold leading-none" style={{ color: t.color }}>
              {t.value}
            </p>
            <p className="tnum mt-0.5 text-[12.5px] text-base-content/40">{t.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-box border-l-2 px-3 py-2" style={{ borderColor: tone, backgroundColor: `${tone}14` }}>
        <p className="text-[12.5px] font-semibold" style={{ color: tone }}>{review.headline}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-base-content/70">{review.detail}</p>
      </div>
    </div>
  );
}

export default function Roadmap({ protocol }) {
  const { dayNumber } = protocol;
  const { profile, targets } = useTargets();

  return (
    <div className="space-y-3">
      <div className="px-0.5">
        <h1 className="font-display text-xl font-bold">The 1000-day roadmap</h1>
        <p className="mt-0.5 text-sm text-base-content/45">
          Four phases. Each unlocks as you advance. You are on day {dayNumber}.
        </p>
      </div>

      <ol className="relative space-y-3 pl-1">
        {PHASES.map((phase) => {
          const status = phaseStatus(phase, dayNumber);
          const active = status === 'active';
          const locked = status === 'locked';
          const pct = active ? Math.round(phaseProgress(dayNumber) * 100) : status === 'complete' ? 100 : 0;

          return (
            <li
              key={phase.id}
              className={`rounded-box border p-4 transition-all ${
                active
                  ? 'border-primary/40 bg-base-200 shadow-glow'
                  : locked
                    ? 'border-white/5 bg-base-200/40 opacity-70'
                    : 'border-white/5 bg-base-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[12px] tracking-widest text-base-content/40">
                    PHASE {phase.id} · {phase.codename}
                  </p>
                  <h2 className="mt-0.5 font-display text-base font-bold leading-tight">
                    {phase.name}
                  </h2>
                  <p className="mt-0.5 font-mono text-[12px] text-base-content/40">
                    Days {phase.start}–{phase.end}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>

              <p className="mt-2 text-sm italic text-base-content/55">"{phase.tagline}"</p>

              {!locked && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-base-300">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right font-mono text-[12.5px] text-base-content/40">{pct}%</p>
                </div>
              )}

              {/* Live, weight-driven prescription only for the active phase */}
              {active && <LivePrescription phase={phase} profile={profile} targets={targets} />}

              {!locked && (
                <div className="mt-3 space-y-2.5">
                  {PILLAR_META.map(({ key, label, icon: Icon, color }) => (
                    <div key={key} className="flex gap-2.5">
                      <span
                        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: `${color}1a`, color }}
                      >
                        <Icon size={13} strokeWidth={2.4} />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color }}>
                          {label}
                        </p>
                        <p className="text-[13.5px] leading-snug text-base-content/65">
                          {phase.focus[key]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {locked && (
                <p className="mt-3 flex items-center gap-1.5 text-[13.5px] text-base-content/40">
                  <Lock size={13} /> Unlocks on day {phase.start}.
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
