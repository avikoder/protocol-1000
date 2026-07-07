import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { weightSeries, movingAverage } from '../../lib/stats.js';
import { shortDate } from '../../lib/date.js';

const RANGES = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: Infinity },
];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-base-300 px-2.5 py-1.5 shadow-lg">
      <p className="font-mono text-[11.5px] text-base-content/50">{shortDate(p.date)} · Day {p.day}</p>
      <p className="tnum font-mono text-sm font-semibold text-primary">{p.weight} kg</p>
    </div>
  );
}

export default function WeightTrend({ days }) {
  const [range, setRange] = useState(RANGES[1]);
  const all = movingAverage(weightSeries(days), 'weight', 7);
  const data = range.days === Infinity ? all : all.slice(-range.days);

  const values = data.map((d) => d.weight);
  const min = values.length ? Math.floor(Math.min(...values) - 1) : 70;
  const max = values.length ? Math.ceil(Math.max(...values) + 1) : 90;

  return (
    <Card
      icon={TrendingDown}
      title="Bodyweight trend"
      accent="#2DD4BF"
      right={
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-0.5 font-mono text-[12.5px] transition-colors ${
                r.label === range.label
                  ? 'bg-primary/15 text-primary'
                  : 'text-base-content/40'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {data.length < 2 ? (
        <Empty />
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={[min, max]}
                tick={{ fill: 'rgba(230,233,238,0.35)', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                width={34}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="rgba(96,165,250,0.5)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2DD4BF"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#2DD4BF' }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-center font-mono text-[11.5px] text-base-content/30">
        solid = daily · dashed = 7-day average
      </p>
    </Card>
  );
}

function Empty() {
  return (
    <div className="grid h-48 place-items-center text-center">
      <p className="max-w-[14rem] text-sm text-base-content/40">
        Log your bodyweight on a few days and the trend line appears here.
      </p>
    </div>
  );
}
