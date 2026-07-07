import { DEFAULT_TARGETS } from '../db/db.js';

/* Pure analytics helpers. Given the raw `days` array from Dexie plus the
 * user's targets, derive everything the Insights tab and grid need. */

export const PILLARS = [
  { key: 'physical', label: 'Physical', color: '#2DD4BF' },
  { key: 'nutrition', label: 'Nutrition', color: '#FBBF24' },
  { key: 'cognitive', label: 'Cognitive', color: '#60A5FA' },
  { key: 'mental', label: 'Mental', color: '#FB7185' },
];

/** Was a given pillar "met" on this day? Thresholds are intentionally
 *  forgiving so the grid rewards showing up, not perfection. */
export function pillarDone(day, pillar, targets = DEFAULT_TARGETS) {
  if (!day) return false;
  switch (pillar) {
    case 'physical':
      return !!day.workoutDone || (day.cardioMin ?? 0) >= 20;
    case 'nutrition':
      // Counts if protein OR hydration goal is essentially met.
      return day.protein >= targets.proteinTarget * 0.7 || day.water >= targets.waterTarget;
    case 'cognitive':
      return day.readingMinutes >= 15 || !!day.ankiDone;
    case 'mental':
      return !!day.mindfulness || (day.nsdrMin ?? 0) >= 10 || day.mood != null;
    default:
      return false;
  }
}

/** 0..4 — how many pillars were completed on this day. */
export function completionScore(day, targets = DEFAULT_TARGETS) {
  return PILLARS.reduce((n, p) => n + (pillarDone(day, p.key, targets) ? 1 : 0), 0);
}

/** Index days by their protocol dayNumber for O(1) lookups. */
export function indexByDayNumber(days) {
  const map = new Map();
  for (const d of days) map.set(d.dayNumber, d);
  return map;
}

/** Current & best "did anything" streak, counted backwards from `currentDay`. */
export function streaks(days, currentDay, targets = DEFAULT_TARGETS) {
  const byNum = indexByDayNumber(days);
  const active = (n) => {
    const d = byNum.get(n);
    return d ? completionScore(d, targets) >= 1 : false;
  };

  let current = 0;
  for (let n = currentDay; n >= 1; n--) {
    if (active(n)) current++;
    else break;
  }

  let best = 0;
  let run = 0;
  for (let n = 1; n <= currentDay; n++) {
    if (active(n)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return { current, best };
}

/** Overall adherence % across elapsed days (avg pillars-per-day / 4). */
export function adherence(days, currentDay, targets = DEFAULT_TARGETS) {
  if (currentDay < 1) return 0;
  const total = days.reduce((s, d) => s + completionScore(d, targets), 0);
  return Math.round((total / (currentDay * 4)) * 100);
}

/** Per-pillar consistency % over the last `window` days. Powers the radar. */
export function radarData(days, currentDay, targets = DEFAULT_TARGETS, window = 30) {
  const byNum = indexByDayNumber(days);
  const from = Math.max(1, currentDay - window + 1);
  const span = currentDay - from + 1;
  return PILLARS.map((p) => {
    let hits = 0;
    for (let n = from; n <= currentDay; n++) {
      if (pillarDone(byNum.get(n), p.key, targets)) hits++;
    }
    return { pillar: p.label, value: span > 0 ? Math.round((hits / span) * 100) : 0, fullMark: 100 };
  });
}

/** Weight series (chronological) for the trend line. */
export function weightSeries(days) {
  return days
    .filter((d) => d.weight != null && !Number.isNaN(d.weight))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, day: d.dayNumber, weight: Number(d.weight) }));
}

/** Simple centered/ trailing moving average for smoothing weight noise. */
export function movingAverage(series, key, window = 7) {
  return series.map((point, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    const avg = slice.reduce((s, p) => s + p[key], 0) / slice.length;
    return { ...point, avg: Math.round(avg * 10) / 10 };
  });
}

/** Mood vs mindfulness over the last `window` days for the combined chart. */
export function moodCorrelation(days, currentDay, window = 30) {
  const byNum = indexByDayNumber(days);
  const from = Math.max(1, currentDay - window + 1);
  const out = [];
  for (let n = from; n <= currentDay; n++) {
    const d = byNum.get(n);
    out.push({
      day: n,
      date: d?.date ?? null,
      mood: d?.mood ?? null,
      // scale the binary flag onto the mood axis so both read on one chart
      mindful: d?.mindfulness ? 5 : 0,
      mindfulRaw: d?.mindfulness ? 1 : 0,
    });
  }
  return out;
}

/** Average mood on mindful days vs the rest — the headline correlation stat. */
export function moodSplit(days) {
  const withMood = days.filter((d) => d.mood != null);
  const mindful = withMood.filter((d) => d.mindfulness);
  const notMindful = withMood.filter((d) => !d.mindfulness);
  const avg = (arr) =>
    arr.length ? Math.round((arr.reduce((s, d) => s + d.mood, 0) / arr.length) * 10) / 10 : null;
  return { mindful: avg(mindful), notMindful: avg(notMindful), nMindful: mindful.length, nRest: notMindful.length };
}

/* ------------------------------ daily floor ------------------------------ */

/** The floor that cannot break (from 1000-Day-OS): moved, reviewed Anki,
 *  slept ≥6h, wrote one reflection. A minimum-viable day, below the pillars. */
export const FLOOR_ITEMS = [
  { key: 'move', label: 'Move', emoji: '🚶' },
  { key: 'learn', label: 'Anki', emoji: '🧠' },
  { key: 'sleep', label: 'Sleep 6h+', emoji: '😴' },
  { key: 'reflect', label: 'Reflect', emoji: '✍️' },
];

export function floorChecks(day) {
  return {
    move: !!day?.workoutDone || (day?.cardioMin ?? 0) >= 20 || (day?.steps ?? 0) >= 6000,
    learn: !!day?.ankiDone,
    sleep: (day?.sleepHours ?? 0) >= 6,
    reflect: !!day?.reflection?.trim(),
  };
}

export function floorDone(day) {
  const c = floorChecks(day);
  return c.move && c.learn && c.sleep && c.reflect;
}

/** Consecutive floor days counted back from `currentDay`. */
export function floorStreak(days, currentDay) {
  const byNum = indexByDayNumber(days);
  let n = 0;
  for (let d = currentDay; d >= 1; d--) {
    if (floorDone(byNum.get(d))) n++;
    else break;
  }
  return n;
}

/* ------------------------- averages & counts ----------------------------- */

/** Auto-calories from logged macros (4P + 4C + 9F); null when none logged. */
export function loggedCalories(day) {
  if (!day) return null;
  const p = day.protein ?? 0;
  const c = day.carbs;
  const f = day.fat;
  if (!p && c == null && f == null) return null;
  return 4 * p + 4 * (c ?? 0) + 9 * (f ?? 0);
}

/** Averages "when logged" + consistency counts, for the Insights panel. */
export function summaryStats(days, targets) {
  const vals = (fn) => days.map(fn).filter((v) => v != null && !Number.isNaN(v) && v > 0);
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  return {
    logged: days.filter((d) => completionScore(d, targets) >= 1).length,
    trainingDays: days.filter((d) => d.workoutDone).length,
    floorDays: days.filter(floorDone).length,
    proteinHitDays: days.filter((d) => (d.protein ?? 0) >= targets.proteinTarget).length,
    avgSleep: avg(vals((d) => d.sleepHours)),
    avgDeepMin: avg(vals((d) => d.readingMinutes)),
    avgCardio: avg(vals((d) => d.cardioMin)),
    avgProtein: avg(vals((d) => d.protein)),
    avgCalories: avg(days.map(loggedCalories).filter((v) => v != null && v > 0)),
    avgMood: avg(vals((d) => d.mood)),
    latestRhr: latestValue(days, 'rhr'),
    latestHrv: latestValue(days, 'hrv'),
  };
}

export function latestValue(days, key) {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  for (const d of sorted) {
    const v = d[key];
    if (v != null && !Number.isNaN(+v) && +v > 0) return +v;
  }
  return null;
}
