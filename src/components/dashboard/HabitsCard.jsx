import { useLiveQuery } from 'dexie-react-hooks';
import { ListChecks, Check, Settings2 } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { db, getHabits } from '../../db/db.js';
import { habitIcon } from '../../data/habits.js';

const ACCENT = '#34D399';

/** Current streak for one habit, counted back from the selected day. */
function habitStreak(byNum, habitId, fromDay) {
  let n = 0;
  for (let d = fromDay; d >= 1; d--) {
    if (byNum.get(d)?.habits?.[habitId]) n++;
    else break;
  }
  return n;
}

/** User-defined habits. Define them in Profile → Habits; tick them here. */
export default function HabitsCard({ day, dayNumber, save, onOpenSettings }) {
  const habits = useLiveQuery(() => getHabits(), []) ?? [];
  const allDays = useLiveQuery(() => db.days.toArray(), []) ?? [];
  const byNum = new Map(allDays.map((d) => [d.dayNumber, d]));

  const checks = day?.habits ?? {};
  const doneCount = habits.filter((h) => checks[h.id]).length;

  const toggle = (id) => save({ habits: { ...checks, [id]: !checks[id] } });

  return (
    <Card
      icon={ListChecks}
      title="Custom habits"
      accent={ACCENT}
      edge
      right={
        habits.length > 0 ? (
          <span className="tnum font-mono text-[13px] font-semibold" style={{ color: doneCount === habits.length ? ACCENT : 'rgba(230,233,238,0.5)' }}>
            {doneCount}/{habits.length}
          </span>
        ) : null
      }
    >
      {habits.length === 0 ? (
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center justify-center gap-2 rounded-box border border-dashed border-white/10 bg-base-300/40 py-3 text-[13.5px] font-medium text-base-content/50 active:scale-[0.99]"
        >
          <Settings2 size={15} /> Define your own habits in Profile
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {habits.map((h) => {
            const Icon = habitIcon(h.icon);
            const done = !!checks[h.id];
            const streak = habitStreak(byNum, h.id, dayNumber);
            return (
              <button
                key={h.id}
                onClick={() => toggle(h.id)}
                className={`flex items-center gap-2 rounded-box border px-2.5 py-2.5 text-left transition-all active:scale-[0.97] ${
                  done ? '' : 'border-white/5 bg-base-300/50'
                }`}
                style={done ? { borderColor: `${h.color}66`, backgroundColor: `${h.color}18` } : undefined}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${h.color}22`, color: h.color }}
                >
                  {done ? <Check size={15} strokeWidth={3} /> : <Icon size={15} strokeWidth={2.4} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[13.5px] font-semibold ${done ? '' : 'text-base-content/70'}`} style={done ? { color: h.color } : undefined}>
                    {h.name}
                  </span>
                  {streak > 1 && (
                    <span className="tnum block font-mono text-[11px] text-base-content/40">{streak}d streak</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
