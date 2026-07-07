import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Beef, Droplet, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { db } from '../../db/db.js';
import { weightTrend, hypertrophyReview, readiness } from '../../lib/progression.js';
import { BatteryLow } from 'lucide-react';

const TONE = {
  good: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  warn: { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  info: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
};

function Stat({ icon: Icon, label, value, unit, sub, color }) {
  return (
    <div className="flex-1 rounded-box bg-base-300/50 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon size={14} style={{ color }} strokeWidth={2.5} />
        <span className="text-[12px] font-medium uppercase tracking-wide text-base-content/45">
          {label}
        </span>
      </div>
      <p className="tnum mt-1 font-mono text-xl font-bold leading-none" style={{ color }}>
        {value}
        {unit && <span className="text-[13px] font-medium text-base-content/40"> {unit}</span>}
      </p>
      {sub && <p className="tnum mt-0.5 text-[11.5px] text-base-content/40">{sub}</p>}
    </div>
  );
}

export default function PlanCard({ profile, targets }) {
  const days = useLiveQuery(() => db.days.toArray(), []) ?? [];
  const trend = weightTrend(days);
  const review = hypertrophyReview(profile, trend, targets.basisWeight);
  const ready = readiness(days, profile);
  const tone = TONE[review.tone] ?? TONE.info;

  const surplus = targets.surplusKcal;
  const energySub =
    surplus === 0
      ? 'maintenance'
      : `${surplus > 0 ? '+' : ''}${surplus} vs TDEE`;

  const TrendIcon =
    trend.direction === 'gaining' ? TrendingUp : trend.direction === 'losing' ? TrendingDown : Minus;

  return (
    <section className="animate-fade-up overflow-hidden rounded-box border border-white/5 bg-base-200">
      {/* accent header strip */}
      <div
        className="flex items-center gap-2 px-4 pt-3.5"
        style={{ color: '#2DD4BF' }}
      >
        <Sparkles size={15} strokeWidth={2.5} />
        <h2 className="font-display text-[15px] font-semibold tracking-wide text-base-content/90">
          Today's adaptive plan
        </h2>
        <span className="tnum ml-auto font-mono text-[12px] text-base-content/45">
          @ {targets.basisWeight} kg
        </span>
      </div>

      {/* Derived targets */}
      <div className="flex gap-2 px-4 pt-3">
        <Stat
          icon={Flame}
          label="Energy"
          value={targets.calorieTarget.toLocaleString()}
          unit="kcal"
          sub={energySub}
          color="#FB923C"
        />
        <Stat
          icon={Beef}
          label="Protein"
          value={targets.proteinTarget}
          unit="g"
          sub={`${targets.proteinPerKg} g/kg`}
          color="#FBBF24"
        />
        <Stat
          icon={Droplet}
          label="Water"
          value={(targets.waterTarget / 1000).toFixed(1)}
          unit="L"
          sub={`${Math.round(targets.waterTarget / 250)} cups`}
          color="#60A5FA"
        />
      </div>

      {/* Weight trend + hypertrophy coaching */}
      <div className="mt-3 px-4 pb-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-badge px-2 py-1 font-mono text-[12px] font-semibold"
            style={{ color: tone.color, backgroundColor: tone.bg }}
          >
            <TrendIcon size={13} strokeWidth={2.6} />
            {trend.hasData
              ? `${trend.weeklyRateKg > 0 ? '+' : ''}${trend.weeklyRateKg} kg/wk`
              : 'No trend yet'}
          </span>
          {trend.hasData && (
            <span className="tnum font-mono text-[11.5px] text-base-content/40">
              over {trend.spanDays}d · {trend.deltaKg > 0 ? '+' : ''}
              {trend.deltaKg} kg
            </span>
          )}
        </div>
        <div
          className="rounded-box border-l-2 p-3"
          style={{ borderColor: tone.color, backgroundColor: tone.bg }}
        >
          <p className="text-[13.5px] font-semibold" style={{ color: tone.color }}>
            {review.headline}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-base-content/70">{review.detail}</p>
        </div>

        {/* Recovery watch — only speaks when recent sleep/mood agree */}
        {ready.flag && (
          <div className="mt-2 flex items-start gap-2 rounded-box border-l-2 border-warning bg-warning/10 p-3">
            <BatteryLow size={15} className="mt-0.5 shrink-0 text-warning" strokeWidth={2.4} />
            <p className="text-[12.5px] leading-snug text-base-content/70">{ready.message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
