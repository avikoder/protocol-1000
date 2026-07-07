import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db.js';
import { useTargets } from '../../hooks/useTargets.js';
import StrengthProgress from './StrengthProgress.jsx';
import SleepChart from './SleepChart.jsx';
import Achievements from './Achievements.jsx';
import AveragesCard from './AveragesCard.jsx';
import RecoveryChart from './RecoveryChart.jsx';
import KpiStrip from './KpiStrip.jsx';
import WeightTrend from './WeightTrend.jsx';
import ConsistencyGrid from './ConsistencyGrid.jsx';
import PillarRadar from './PillarRadar.jsx';
import MoodCorrelation from './MoodCorrelation.jsx';

export default function Analytics({ protocol }) {
  const days = useLiveQuery(() => db.days.orderBy('date').toArray(), []) ?? [];
  const { profile, targets } = useTargets();

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-0.5">
        <h1 className="font-display text-xl font-bold">Insights</h1>
        <span className="font-mono text-[12.5px] text-base-content/40">
          {days.length} days logged
        </span>
      </div>

      <KpiStrip days={days} protocol={protocol} targets={targets} />
      <AveragesCard days={days} targets={targets} />
      <WeightTrend days={days} />
      <RecoveryChart days={days} />
      <StrengthProgress days={days} />
      <SleepChart days={days} protocol={protocol} targets={targets} />
      <ConsistencyGrid days={days} protocol={protocol} targets={targets} />
      <PillarRadar days={days} protocol={protocol} targets={targets} />
      <MoodCorrelation days={days} protocol={protocol} />
      <Achievements days={days} protocol={protocol} targets={targets} profile={profile} />
    </div>
  );
}
