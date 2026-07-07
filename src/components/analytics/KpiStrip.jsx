import { Flame, Trophy, Target, Smile } from 'lucide-react';
import { streaks, adherence } from '../../lib/stats.js';

function Kpi({ icon: Icon, value, label, accent }) {
  return (
    <div className="rounded-box border border-white/5 bg-base-200 p-3">
      <Icon size={16} style={{ color: accent }} />
      <p className="tnum mt-2 font-mono text-xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11.5px] uppercase tracking-wider text-base-content/40">{label}</p>
    </div>
  );
}

export default function KpiStrip({ days, protocol, targets }) {
  const { current, best } = streaks(days, protocol.dayNumber, targets);
  const adhere = adherence(days, protocol.dayNumber, targets);
  const moods = days.filter((d) => d.mood != null);
  const avgMood = moods.length
    ? (moods.reduce((s, d) => s + d.mood, 0) / moods.length).toFixed(1)
    : '—';

  return (
    <div className="grid grid-cols-4 gap-2">
      <Kpi icon={Flame} value={current} label="Streak" accent="#FBBF24" />
      <Kpi icon={Trophy} value={best} label="Best" accent="#2DD4BF" />
      <Kpi icon={Target} value={`${adhere}%`} label="Adherence" accent="#60A5FA" />
      <Kpi icon={Smile} value={avgMood} label="Avg mood" accent="#FB7185" />
    </div>
  );
}
