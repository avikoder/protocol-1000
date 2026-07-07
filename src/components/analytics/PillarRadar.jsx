import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Radar as RadarIcon } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { radarData } from '../../lib/stats.js';

export default function PillarRadar({ days, protocol, targets }) {
  const data = radarData(days, protocol.dayNumber, targets, 30);

  return (
    <Card
      icon={RadarIcon}
      title="Pillar balance"
      accent="#60A5FA"
      right={<span className="font-mono text-[12.5px] text-base-content/40">last 30 days</span>}
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="pillar"
              tick={{ fill: 'rgba(230,233,238,0.6)', fontSize: 11, fontFamily: 'Inter' }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={false}
              axisLine={false}
              tickCount={5}
            />
            <Radar
              dataKey="value"
              stroke="#60A5FA"
              strokeWidth={2}
              fill="#60A5FA"
              fillOpacity={0.25}
              isAnimationActive={true}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 grid grid-cols-4 gap-1 text-center">
        {data.map((d) => (
          <div key={d.pillar}>
            <p className="tnum font-mono text-sm font-semibold">{d.value}%</p>
            <p className="text-[11.5px] text-base-content/40">{d.pillar}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
