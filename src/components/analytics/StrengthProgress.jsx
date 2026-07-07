import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { liftNames, liftSeries } from '../../lib/lifts.js';
import { shortDate } from '../../lib/date.js';

const ACCENT = '#2DD4BF';

/** Estimated-1RM progression per lift — the direct hypertrophy scoreboard. */
export default function StrengthProgress({ days }) {
  const names = useMemo(() => liftNames(days), [days]);
  const [selected, setSelected] = useState(null);
  const active = selected && names.includes(selected) ? selected : names[0];

  const series = useMemo(() => (active ? liftSeries(days, active) : []), [days, active]);

  const first = series[0]?.e1rm;
  const last = series[series.length - 1]?.e1rm;
  const gain = first != null && last != null ? Math.round((last - first) * 10) / 10 : null;

  return (
    <Card
      icon={TrendingUp}
      title="Strength progress"
      accent={ACCENT}
      right={
        gain != null && series.length > 1 ? (
          <span className="tnum font-mono text-[13px] font-semibold" style={{ color: gain >= 0 ? ACCENT : '#FB7185' }}>
            {gain >= 0 ? '+' : ''}{gain} kg e1RM
          </span>
        ) : null
      }
    >
      {names.length === 0 ? (
        <p className="text-[13px] text-base-content/40">
          Log lifts on the Today tab to unlock your e1RM progression chart.
        </p>
      ) : (
        <>
          <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
            {names.map((n) => (
              <button
                key={n}
                onClick={() => setSelected(n)}
                className={`shrink-0 rounded-btn border px-2.5 py-1.5 text-[12.5px] font-semibold transition-all active:scale-95 ${
                  n === active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-white/5 bg-base-300/60 text-base-content/55'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {series.length < 2 ? (
            <p className="text-[13px] text-base-content/40">
              One data point so far — log {active} again to draw the trend.
            </p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 6, right: 8, bottom: 0, left: -14 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111318',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono',
                    }}
                    labelFormatter={shortDate}
                    formatter={(v, _n, item) => [
                      `${v} kg (${item.payload.weightKg}×${item.payload.reps})`,
                      'e1RM',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="e1rm"
                    stroke={ACCENT}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
