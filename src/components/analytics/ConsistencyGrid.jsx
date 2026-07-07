import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { indexByDayNumber, completionScore } from '../../lib/stats.js';
import { TOTAL_DAYS } from '../../data/roadmap.js';

// score 0..4 → opacity ramp on the primary teal
const LEVELS = [
  'rgba(255,255,255,0.04)', // 0 — nothing
  'rgba(45,212,191,0.28)', // 1
  'rgba(45,212,191,0.5)', // 2
  'rgba(45,212,191,0.75)', // 3
  '#2DD4BF', // 4 — perfect day
];

export default function ConsistencyGrid({ days, protocol, targets }) {
  const { dayNumber } = protocol;

  const cells = useMemo(() => {
    const byNum = indexByDayNumber(days);
    const out = [];
    for (let n = 1; n <= TOTAL_DAYS; n++) {
      const future = n > dayNumber;
      const score = future ? -1 : completionScore(byNum.get(n), targets);
      out.push({ n, score, future, today: n === dayNumber });
    }
    return out;
  }, [days, dayNumber, targets]);

  return (
    <Card
      icon={CalendarDays}
      title="1000-day consistency"
      accent="#2DD4BF"
      right={<span className="font-mono text-[12.5px] text-base-content/40">{dayNumber}/1000</span>}
    >
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="grid grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
        >
          {cells.map((c) => (
            <span
              key={c.n}
              title={`Day ${c.n}${c.future ? '' : ` · ${Math.max(0, c.score)}/4`}`}
              className={`h-[9px] w-[9px] rounded-[2px] ${c.today ? 'ring-2 ring-white/70' : ''}`}
              style={{
                backgroundColor: c.future ? 'rgba(255,255,255,0.03)' : LEVELS[c.score],
              }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="font-mono text-[11.5px] text-base-content/35">Less</span>
        {LEVELS.map((c, i) => (
          <span key={i} className="h-[9px] w-[9px] rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span className="font-mono text-[11.5px] text-base-content/35">More</span>
      </div>
    </Card>
  );
}
