import { useMemo } from 'react';
import { Sigma } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { summaryStats } from '../../lib/stats.js';

const fmt = (v, dec = 0, suffix = '') =>
  v == null ? '—' : `${dec ? v.toFixed(dec) : Math.round(v).toLocaleString()}${suffix}`;

/** "Averages when logged" + consistency counts + latest biomarkers,
 *  ported from the 1000-Day-OS stats view. */
export default function AveragesCard({ days, targets }) {
  const s = useMemo(() => summaryStats(days, targets), [days, targets]);

  const counts = [
    { label: 'Logged', value: s.logged },
    { label: 'Training', value: s.trainingDays },
    { label: 'Floor days', value: s.floorDays, good: true },
    { label: 'Protein hit', value: s.proteinHitDays, good: true },
  ];
  const avgs = [
    { label: 'Sleep', value: fmt(s.avgSleep, 1, 'h'), color: '#A78BFA' },
    { label: 'Deep work', value: fmt(s.avgDeepMin, 0, 'm'), color: '#60A5FA' },
    { label: 'Cardio', value: fmt(s.avgCardio, 0, 'm'), color: '#2DD4BF' },
    { label: 'Protein', value: fmt(s.avgProtein, 0, 'g'), color: '#FBBF24' },
    { label: 'Calories', value: fmt(s.avgCalories), color: '#FB923C' },
    { label: 'Mood', value: fmt(s.avgMood, 1), color: '#FB7185' },
  ];

  return (
    <Card icon={Sigma} title="Averages & counts" accent="#60A5FA">
      <div className="grid grid-cols-4 gap-1.5">
        {counts.map((c) => (
          <div key={c.label} className="rounded-box bg-base-300/50 px-2 py-2 text-center">
            <p className={`tnum font-mono text-[16px] font-bold ${c.good ? 'text-success' : ''}`}>{c.value}</p>
            <p className="text-[10.5px] uppercase tracking-wide text-base-content/40">{c.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-1.5 mt-3 text-[11.5px] font-medium uppercase tracking-wider text-base-content/40">
        Averages when logged
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {avgs.map((a) => (
          <div key={a.label} className="rounded-box bg-base-300/50 px-2 py-2 text-center">
            <p className="tnum font-mono text-[15px] font-bold" style={{ color: a.color }}>{a.value}</p>
            <p className="text-[10.5px] uppercase tracking-wide text-base-content/40">{a.label}</p>
          </div>
        ))}
      </div>

      {(s.latestRhr != null || s.latestHrv != null) && (
        <p className="tnum mt-2.5 font-mono text-[12px] text-base-content/45">
          Latest biomarkers · RHR{' '}
          <span className="font-semibold text-[#FB7185]">{s.latestRhr ?? '—'}</span> bpm · HRV{' '}
          <span className="font-semibold text-[#60A5FA]">{s.latestHrv ?? '—'}</span> ms
        </p>
      )}
    </Card>
  );
}
