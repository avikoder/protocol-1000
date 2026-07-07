/* Strength-log math. A "lift entry" is { id, name, weightKg, reps } stored on
 * a day record. Everything downstream (PR stars, progression chart, awards)
 * derives from estimated one-rep max so different rep ranges stay comparable. */

export const LIFT_PRESETS = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row'];

/** Epley estimated 1RM. Falls back to raw weight for singles. */
export function e1rm(weightKg, reps) {
  const w = Number(weightKg);
  const r = Number(reps);
  if (!w || !r || w <= 0 || r <= 0) return 0;
  if (r === 1) return Math.round(w * 10) / 10;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

/** All lift names ever logged, most-recently-used first. */
export function liftNames(days) {
  const seen = new Map(); // name -> latest date
  for (const d of days) {
    for (const l of d.lifts || []) {
      const prev = seen.get(l.name);
      if (!prev || d.date > prev) seen.set(l.name, d.date);
    }
  }
  return [...seen.entries()].sort((a, b) => b[1].localeCompare(a[1])).map(([n]) => n);
}

/** Best e1RM for `name` on each day it appears — the progression series. */
export function liftSeries(days, name) {
  const out = [];
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    let best = null;
    for (const l of d.lifts || []) {
      if (l.name !== name) continue;
      const v = e1rm(l.weightKg, l.reps);
      if (!best || v > best.e1rm) best = { e1rm: v, weightKg: l.weightKg, reps: l.reps };
    }
    if (best) out.push({ date: d.date, day: d.dayNumber, ...best });
  }
  return out;
}

/** Best e1RM for `name` strictly before `date`. */
export function bestBefore(days, name, date) {
  let best = 0;
  for (const d of days) {
    if (d.date >= date) continue;
    for (const l of d.lifts || []) {
      if (l.name === name) best = Math.max(best, e1rm(l.weightKg, l.reps));
    }
  }
  return best;
}

/** Count all-time PRs: each chronological improvement of a lift's best e1RM. */
export function totalPRs(days) {
  const best = new Map();
  let prs = 0;
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const l of d.lifts || []) {
      const v = e1rm(l.weightKg, l.reps);
      const b = best.get(l.name) || 0;
      if (v > b) {
        best.set(l.name, v);
        if (b > 0) prs++; // the first-ever entry sets a baseline, not a PR
      }
    }
  }
  return prs;
}

/** Total logged set count (each entry = one top set). */
export function totalLiftEntries(days) {
  return days.reduce((n, d) => n + (d.lifts?.length || 0), 0);
}
