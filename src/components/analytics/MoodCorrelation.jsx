import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { HeartPulse } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { moodCorrelation, moodSplit } from '../../lib/stats.js';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-base-300 px-2.5 py-1.5 shadow-lg">
      <p className="font-mono text-[11.5px] text-base-content/50">Day {p.day}</p>
      <p className="font-mono text-xs text-[#FB7185]">Mood: {p.mood ?? '—'}</p>
      <p className="font-mono text-xs text-[#2DD4BF]">
        Mindful: {p.mindfulRaw ? 'yes' : 'no'}
      </p>
    </div>
  );
}

export default function MoodCorrelation({ days, protocol }) {
  const data = moodCorrelation(days, protocol.dayNumber, 30);
  const split = moodSplit(days);
  const hasData = data.some((d) => d.mood != null);

  const delta =
    split.mindful != null && split.notMindful != null
      ? Math.round((split.mindful - split.notMindful) * 10) / 10
      : null;

  return (
    <Card icon={HeartPulse} title="Mood × mindfulness" accent="#FB7185">
      {/* Headline correlation */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-box bg-[#FB7185]/10 p-2.5 text-center">
          <p className="tnum font-mono text-xl font-bold text-[#FB7185]">
            {split.mindful ?? '—'}
          </p>
          <p className="text-[11.5px] text-base-content/50">avg mood · mindful days</p>
        </div>
        <div className="rounded-box bg-base-300/70 p-2.5 text-center">
          <p className="tnum font-mono text-xl font-bold text-base-content/70">
            {split.notMindful ?? '—'}
          </p>
          <p className="text-[11.5px] text-base-content/50">avg mood · rest</p>
        </div>
      </div>

      {delta != null && (
        <p className="mb-3 text-center text-[12.5px] text-base-content/50">
          {delta > 0 ? (
            <>
              Mindful days run{' '}
              <span className="font-semibold text-[#FB7185]">+{delta}</span> higher on mood.
            </>
          ) : delta < 0 ? (
            <>No positive lift yet ({delta} on mindful days).</>
          ) : (
            <>Mood is level across both — keep logging.</>
          )}
        </p>
      )}

      {hasData ? (
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(230,233,238,0.3)', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: 'rgba(230,233,238,0.3)', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="mindful" fill="rgba(45,212,191,0.35)" radius={[3, 3, 0, 0]} barSize={6} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#FB7185"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#FB7185' }}
                connectNulls
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid h-32 place-items-center">
          <p className="max-w-[15rem] text-center text-sm text-base-content/40">
            Log mood and mindfulness for a few days to reveal the correlation.
          </p>
        </div>
      )}
      <p className="mt-2 text-center font-mono text-[11.5px] text-base-content/30">
        line = mood (1–5) · bars = mindfulness done
      </p>
    </Card>
  );
}
