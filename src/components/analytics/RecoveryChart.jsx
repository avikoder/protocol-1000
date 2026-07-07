import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { HeartPulse } from 'lucide-react';
import Card from '../ui/Card.jsx';

const RHR = '#FB7185';
const HRV = '#60A5FA';

/** Resting HR + HRV over time. RHR trending down and HRV trending up is the
 *  cleanest signal that the engine under the hood is adapting. */
export default function RecoveryChart({ days }) {
  const data = useMemo(
    () =>
      [...days]
        .filter((d) => (d.rhr != null && d.rhr > 0) || (d.hrv != null && d.hrv > 0))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-60)
        .map((d) => ({ day: d.dayNumber, rhr: d.rhr || null, hrv: d.hrv || null })),
    [days]
  );

  if (data.length === 0) {
    return (
      <Card icon={HeartPulse} title="Recovery vitals" accent={RHR}>
        <p className="text-[13px] text-base-content/40">
          Log resting HR and HRV in the morning check-in to chart your recovery trend.
        </p>
      </Card>
    );
  }

  return (
    <Card icon={HeartPulse} title="Recovery vitals" accent={RHR}>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              minTickGap={26}
              tickFormatter={(d) => `d${d}`}
            />
            <YAxis
              tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={38}
              domain={['dataMin - 4', 'dataMax + 4']}
            />
            <Tooltip
              contentStyle={{
                background: '#111318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
              }}
              labelFormatter={(d) => `Day ${d}`}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 11.5, fontFamily: 'JetBrains Mono', color: 'rgba(230,233,238,0.5)' }}
            />
            <Line type="monotone" dataKey="rhr" name="RHR bpm" stroke={RHR} strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="hrv" name="HRV ms" stroke={HRV} strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-base-content/35">
        Healthy adaptation: RHR drifts down, HRV drifts up. Both dipping together = back off.
      </p>
    </Card>
  );
}
