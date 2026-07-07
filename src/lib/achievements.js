import { completionScore, streaks } from './stats.js';
import { totalPRs, totalLiftEntries } from './lifts.js';

/* Gamification layer. Every achievement is { value, target } so locked badges
 * can show honest progress ("620/1000 min") instead of a bare padlock. */

export const ACHIEVEMENT_DEFS = [
  { id: 'streak7',   title: 'Ignition',        desc: '7-day streak',                    icon: 'flame',   color: '#FB923C', target: 7 },
  { id: 'streak30',  title: 'Momentum',        desc: '30-day streak',                   icon: 'flame',   color: '#FB923C', target: 30 },
  { id: 'streak100', title: 'Unbreakable',     desc: '100-day streak',                  icon: 'crown',   color: '#FBBF24', target: 100 },
  { id: 'perfect7',  title: 'Clean sweep',     desc: '7 straight 4/4 days',             icon: 'sparkle', color: '#2DD4BF', target: 7 },
  { id: 'day100',    title: 'Foundation laid', desc: 'Reach day 100',                   icon: 'flag',    color: '#60A5FA', target: 100 },
  { id: 'day250',    title: 'Quarter mark',    desc: 'Reach day 250',                   icon: 'flag',    color: '#60A5FA', target: 250 },
  { id: 'day500',    title: 'Halfway summit',  desc: 'Reach day 500',                   icon: 'trophy',  color: '#FBBF24', target: 500 },
  { id: 'day1000',   title: 'Protocol complete', desc: 'Reach day 1000',                icon: 'crown',   color: '#FBBF24', target: 1000 },
  { id: 'protein30', title: 'Builder',         desc: 'Hit protein target ×30 days',     icon: 'beef',    color: '#FBBF24', target: 30 },
  { id: 'hydrate30', title: 'Reservoir',       desc: 'Hit water target ×30 days',       icon: 'droplet', color: '#60A5FA', target: 30 },
  { id: 'read1k',    title: 'Deep reader',     desc: '1,000 minutes of reading',        icon: 'book',    color: '#60A5FA', target: 1000 },
  { id: 'steps1m',   title: 'Million steps',   desc: '1,000,000 cumulative steps',      icon: 'steps',   color: '#2DD4BF', target: 1000000 },
  { id: 'mind50',    title: 'Still mind',      desc: '50 mindfulness sessions',         icon: 'brain',   color: '#FB7185', target: 50 },
  { id: 'sleep14',   title: 'Well rested',     desc: 'Hit sleep target ×14 nights',     icon: 'moon',    color: '#A78BFA', target: 14 },
  { id: 'firstLift', title: 'First iron',      desc: 'Log your first lift',             icon: 'dumbbell', color: '#2DD4BF', target: 1 },
  { id: 'pr10',      title: 'PR machine',      desc: 'Set 10 strength PRs',             icon: 'medal',   color: '#FB923C', target: 10 },
  { id: 'habit1',    title: 'Habit smith',     desc: 'Create a custom habit',           icon: 'wrench',  color: '#34D399', target: 1 },
];

/** Longest run of consecutive 4/4 days. */
function bestPerfectStreak(days, currentDay, targets) {
  const byNum = new Map(days.map((d) => [d.dayNumber, d]));
  let best = 0;
  let run = 0;
  for (let n = 1; n <= currentDay; n++) {
    if (completionScore(byNum.get(n), targets) === 4) {
      run++;
      best = Math.max(best, run);
    } else run = 0;
  }
  return best;
}

/**
 * Compute every achievement's { value, target, unlocked, pct }.
 * `targets` are today's adaptive targets — historical days are judged against
 * the current bar, which keeps the code honest and the meaning simple.
 */
export function computeAchievements({ days, currentDay, targets, profile, habits }) {
  const st = streaks(days, currentDay, targets);
  const perfect = bestPerfectStreak(days, currentDay, targets);

  let proteinDays = 0;
  let waterDays = 0;
  let readTotal = 0;
  let stepTotal = 0;
  let mindCount = 0;
  let sleepDays = 0;
  for (const d of days) {
    if ((d.protein ?? 0) >= targets.proteinTarget) proteinDays++;
    if ((d.water ?? 0) >= targets.waterTarget) waterDays++;
    readTotal += d.readingMinutes ?? 0;
    stepTotal += d.steps ?? 0;
    if (d.mindfulness) mindCount++;
    if (d.sleepHours != null && d.sleepHours >= (profile.sleepTargetH ?? 7.5)) sleepDays++;
  }

  const values = {
    streak7: st.best, streak30: st.best, streak100: st.best,
    perfect7: perfect,
    day100: currentDay, day250: currentDay, day500: currentDay, day1000: currentDay,
    protein30: proteinDays,
    hydrate30: waterDays,
    read1k: readTotal,
    steps1m: stepTotal,
    mind50: mindCount,
    sleep14: sleepDays,
    firstLift: totalLiftEntries(days),
    pr10: totalPRs(days),
    habit1: habits?.length ?? 0,
  };

  return ACHIEVEMENT_DEFS.map((def) => {
    const value = values[def.id] ?? 0;
    const unlocked = value >= def.target;
    return {
      ...def,
      value: Math.min(value, def.target),
      unlocked,
      pct: Math.max(0, Math.min(1, value / def.target)),
    };
  });
}
