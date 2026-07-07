import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Award, Flame, Crown, Sparkles, Flag, Trophy, Beef, Droplet, BookOpen,
  Footprints, Brain, MoonStar, Dumbbell, Medal, Wrench, Lock,
} from 'lucide-react';
import Card from '../ui/Card.jsx';
import { getHabits } from '../../db/db.js';
import { computeAchievements } from '../../lib/achievements.js';

const ICONS = {
  flame: Flame, crown: Crown, sparkle: Sparkles, flag: Flag, trophy: Trophy,
  beef: Beef, droplet: Droplet, book: BookOpen, steps: Footprints, brain: Brain,
  moon: MoonStar, dumbbell: Dumbbell, medal: Medal, wrench: Wrench,
};

const fmt = (n) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n.toLocaleString());

/** Gamification: 17 badges. Locked ones show honest progress, not just a lock. */
export default function Achievements({ days, protocol, targets, profile }) {
  const habits = useLiveQuery(() => getHabits(), []) ?? [];

  const list = useMemo(
    () =>
      computeAchievements({
        days,
        currentDay: protocol.dayNumber,
        targets,
        profile,
        habits,
      }),
    [days, protocol.dayNumber, targets, profile, habits]
  );

  const unlocked = list.filter((a) => a.unlocked).length;

  return (
    <Card
      icon={Award}
      title="Awards"
      accent="#FBBF24"
      right={
        <span className="tnum font-mono text-[13px] font-semibold text-warning">
          {unlocked}/{list.length}
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-1.5">
        {list.map((a) => {
          const Icon = ICONS[a.icon] || Award;
          return (
            <div
              key={a.id}
              className={`relative rounded-box border p-2.5 text-center transition-all ${
                a.unlocked ? '' : 'border-white/5 bg-base-300/40'
              }`}
              style={
                a.unlocked
                  ? { borderColor: `${a.color}55`, backgroundColor: `${a.color}14` }
                  : undefined
              }
            >
              <span
                className="mx-auto grid h-9 w-9 place-items-center rounded-xl"
                style={{
                  backgroundColor: a.unlocked ? `${a.color}26` : 'rgba(255,255,255,0.05)',
                  color: a.unlocked ? a.color : 'rgba(230,233,238,0.25)',
                }}
              >
                {a.unlocked ? <Icon size={18} strokeWidth={2.3} /> : <Lock size={15} />}
              </span>
              <p
                className={`mt-1.5 text-[12px] font-bold leading-tight ${
                  a.unlocked ? '' : 'text-base-content/45'
                }`}
                style={a.unlocked ? { color: a.color } : undefined}
              >
                {a.title}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-tight text-base-content/40">{a.desc}</p>

              {/* Progress meter for locked badges */}
              {!a.unlocked && (
                <>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-base-300">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(a.pct * 100)}%`, backgroundColor: `${a.color}88` }}
                    />
                  </div>
                  <p className="tnum mt-0.5 font-mono text-[10px] text-base-content/35">
                    {fmt(a.value)}/{fmt(a.target)}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
