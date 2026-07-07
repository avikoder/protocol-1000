import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { MoonStar } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { indexByDayNumber } from '../../lib/stats.js';

const ACCENT = '#A78BFA';
const WINDOW = 21;

/** Last 21 nights vs your sleep target. Recovery is a training variable. */
export default function SleepChart({ days, protocol, targets }) {
  const target = targets.sleepTargetH ?? 7.5;
  const currentDay = protocol.dayNumber;

  const { data, avg, hitRate } = useMemo(() => {
    const byNum = indexByDayNumber(days);
    const from = Math.max(1, currentDay - WINDOW + 1);
    const rows = [];
    let sum = 0;
    let n = 0;
    let hits = 0;
    for (let d = from; d <= currentDay; d++) {
      const rec = byNum.get(d);
      const h = rec?.sleepHours ?? null;
      rows.push({ day: d, hours: h });
      if (h != null) {
        sum += h;
        n++;
        if (h >= target) hits++;
      }
    }
    return {
      data: rows,
      avg: n ? Math.round((sum / n) * 10) / 10 : null,
      hitRate: n ? Math.round((hits / n) * 100) : null,
    };
  }, [days, currentDay, target]);

  const hasData = data.some((r) => r.hours != null);

  return (
    <Card
      icon={MoonStar}
      title="Sleep"
      accent={ACCENT}
      right={
        avg != null ? (
          <span className="tnum font-mono text-[13px] font-semibold" style={{ color: ACCENT }}>
            {avg} h avg
          </span>
        ) : null
      }
    >
      {!hasData ? (
        <p className="text-[13px] text-base-content/40">
          Log sleep on the Today tab — recovery drives everything else.
        </p>
      ) : (
        <>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -22 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={22}
                />
                <YAxis
                  domain={[0, (max) => Math.max(9, Math.ceil(max + 1))]}
                  tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#111318',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono',
                  }}
                  labelFormatter={(d) => `Day ${d}`}
                  formatter={(v) => [v != null ? `${v} h` : '—', 'Sleep']}
                />
                <ReferenceLine
                  y={target}
                  stroke={ACCENT}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={14}>
                  {data.map((r) => (
                    <Cell
                      key={r.day}
                      fill={r.hours != null && r.hours >= target ? ACCENT : `${ACCENT}55`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {hitRate != null && (
            <p className="tnum mt-1 font-mono text-[12px] text-base-content/40">
              Target ({target} h) met on {hitRate}% of logged nights.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
