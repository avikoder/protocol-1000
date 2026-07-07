import { getGoal } from '../data/profile.js';
import { weightSeries } from './stats.js';

/* Reads the logged bodyweight trend and turns it into concrete, adaptive
 * coaching: is the current rate of change on-plan for the chosen goal, and
 * what should change (food / volume) if not. This is what makes the plan
 * respond to real hypertrophy progress instead of staying static. */

/** Smoothed rate of weight change from the logged series. */
export function weightTrend(days, windowDays = 21) {
  const series = weightSeries(days);
  if (series.length < 2) {
    return { hasData: false, points: series.length };
  }

  const last = series[series.length - 1];
  // Find the earliest point still within the window; else the first point.
  const cutoff = last.day - windowDays;
  let ref = series[0];
  for (const pt of series) {
    if (pt.day <= last.day && pt.day >= cutoff) {
      ref = pt;
      break;
    }
  }
  const spanDays = Math.max(1, last.day - ref.day);
  const deltaKg = Math.round((last.weight - ref.weight) * 10) / 10;
  const weeklyRateKg = Math.round((deltaKg / spanDays) * 7 * 100) / 100;

  let direction = 'holding';
  if (weeklyRateKg > 0.1) direction = 'gaining';
  else if (weeklyRateKg < -0.1) direction = 'losing';

  return {
    hasData: true,
    current: last.weight,
    reference: ref.weight,
    deltaKg,
    spanDays,
    weeklyRateKg,
    direction,
  };
}

/** Compare the measured rate to the goal's target rate and coach accordingly. */
export function hypertrophyReview(profile, trend, weight) {
  const goal = getGoal(profile.goal);
  const w = trend?.current ?? weight ?? profile.startWeightKg;
  // Goal's target weekly change as an absolute kg figure at current weight.
  const targetKg = Math.round((w * (goal.weeklyRatePctBW / 100)) * 100) / 100;

  if (!trend?.hasData) {
    return {
      tone: 'info',
      headline: 'Log your weight to calibrate',
      detail: `Aim for about ${targetKg >= 0 ? '+' : ''}${targetKg} kg/week for a ${goal.label.toLowerCase()} goal. A few weigh-ins unlock adaptive coaching.`,
      targetKg,
      suggestKcal: 0,
    };
  }

  const rate = trend.weeklyRateKg;

  // Gaining-type goals (lean muscle / bulk).
  if (goal.direction > 0) {
    const low = targetKg * 0.5;
    const high = targetKg * 1.6;
    if (rate < low)
      return {
        tone: 'warn',
        headline: 'Under target — grow the surplus',
        detail: `You're at ${fmt(rate)} kg/wk vs a ${fmt(targetKg)} kg/wk target. Add ~150–200 kcal (carbs around training) and confirm you're hitting protein.`,
        targetKg,
        suggestKcal: 175,
      };
    if (rate > high)
      return {
        tone: 'warn',
        headline: 'Gaining fast — likely adding fat',
        detail: `${fmt(rate)} kg/wk is above the ${fmt(targetKg)} kg/wk lean-gain window. Trim ~150–200 kcal to keep the gain clean.`,
        targetKg,
        suggestKcal: -175,
      };
    return {
      tone: 'good',
      headline: 'On track for lean gain',
      detail: `${fmt(rate)} kg/wk sits in the lean-gain window around ${fmt(targetKg)} kg/wk. Hold the surplus and keep progressive overload going.`,
      targetKg,
      suggestKcal: 0,
    };
  }

  // Cutting goal.
  if (goal.direction < 0) {
    if (rate > -0.1)
      return {
        tone: 'warn',
        headline: 'Stalled — deepen the deficit',
        detail: `At ${fmt(rate)} kg/wk you're not losing. Cut ~200 kcal and push daily steps; keep protein high to protect muscle.`,
        targetKg,
        suggestKcal: -200,
      };
    if (rate < targetKg * 1.4)
      return {
        tone: 'warn',
        headline: 'Losing fast — protect muscle',
        detail: `${fmt(rate)} kg/wk is aggressive. Add ~150 kcal and keep training heavy so the loss stays fat, not tissue.`,
        targetKg,
        suggestKcal: 150,
      };
    return {
      tone: 'good',
      headline: 'Clean cut in progress',
      detail: `${fmt(rate)} kg/wk is a sustainable fat-loss pace near your ${fmt(targetKg)} kg/wk target. Stay the course.`,
      targetKg,
      suggestKcal: 0,
    };
  }

  // Recomp — want to hold weight.
  if (Math.abs(rate) <= 0.15)
    return {
      tone: 'good',
      headline: 'Holding — recomp on track',
      detail: `Weight is stable (${fmt(rate)} kg/wk) — ideal for recomposition. Let strength and the mirror track progress, not the scale.`,
      targetKg,
      suggestKcal: 0,
    };
  return {
    tone: 'info',
    headline: rate > 0 ? 'Drifting up' : 'Drifting down',
    detail: `${fmt(rate)} kg/wk. For a recomp, nudge calories ${rate > 0 ? 'down' : 'up'} ~100 kcal to hold weight while composition shifts.`,
    targetKg,
    suggestKcal: rate > 0 ? -100 : 100,
  };
}

/** Per-phase training volume prescription (weekly hard sets per muscle). */
export function trainingPrescription(phaseId, profile) {
  const table = {
    1: { sets: '10–12', rep: '8–12', intensity: 'RPE 6–7', note: 'Groove the patterns; consistency over load.' },
    2: { sets: '14–20', rep: '6–15', intensity: 'RPE 7–9', note: 'Double progression — add reps, then load.' },
    3: { sets: '12–16', rep: '3–8 heavy · 8–12 pump', intensity: 'RPE 8–9', note: 'Undulating; deload every 5–6 weeks.' },
    4: { sets: '12–18', rep: 'Autoregulated', intensity: 'By readiness', note: 'Push when fresh, pull back when not.' },
  };
  const base = table[phaseId] || table[1];
  return { ...base, daysPerWeek: profile.trainingDaysPerWeek };
}

function fmt(n) {
  const r = Math.round(n * 100) / 100;
  return `${r > 0 ? '+' : ''}${r}`;
}

/** Recovery watch. Looks at the last few logged days of sleep + mood and flags
 *  when pushing hard is likely counterproductive. Conservative on purpose —
 *  it only speaks when at least two recent data points agree. */
export function readiness(days, profile) {
  const recent = [...days]
    .filter((d) => d.sleepHours != null || d.mood != null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const sleepVals = recent.filter((d) => d.sleepHours != null).map((d) => d.sleepHours);
  const moodVals = recent.filter((d) => d.mood != null).map((d) => d.mood);
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;

  const target = profile.sleepTargetH ?? 7.5;
  const lowSleep = sleepVals.length >= 2 && avg(sleepVals) < target - 0.75;
  const lowMood = moodVals.length >= 2 && avg(moodVals) <= 2.4;

  if (!lowSleep && !lowMood) return { flag: false };

  const reasons = [];
  if (lowSleep) reasons.push(`sleep averaging ${Math.round(avg(sleepVals) * 10) / 10}h vs your ${target}h target`);
  if (lowMood) reasons.push('mood has been low');

  return {
    flag: true,
    reasons,
    message: `Recovery watch: ${reasons.join(' and ')}. Consider a lighter session, extra sleep, and food on target — adaptation happens in recovery.`,
  };
}
