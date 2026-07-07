/* The weekly operating rhythm, ported from 1000-Day-OS. Day 1 anchors the
 * cycle to a real weekday, so the plan follows the calendar: Monday is always
 * Strength A, Sunday is always the weekly review, and every 6th week deloads. */

export const WEEK_PLAN = [
  { day: 'Monday',    focus: 'Strength A — Push',            session: 'Push: pike/HSPU progression · dips · push-ups · core (PM 45–60m)', deep: 'AM: hardest learning ~90m' },
  { day: 'Tuesday',   focus: 'Zone 2 Cardio + Mobility',     session: 'Zone 2 30–45m + 10m mobility',                                    deep: 'AM: hardest learning ~90m' },
  { day: 'Wednesday', focus: 'Strength B — Pull',            session: 'Pull: pull-ups · rows · hangs · core (PM 45–60m)',                deep: 'AM: hardest learning ~90m' },
  { day: 'Thursday',  focus: 'Active Recovery',              session: 'Mobility + easy walk + NSDR · extra family time',                 deep: 'AM skill practice' },
  { day: 'Friday',    focus: 'Strength C — Legs',            session: 'Legs: squat/pistol progression · hinge · posterior chain · core', deep: 'AM: hardest learning ~90m' },
  { day: 'Saturday',  focus: 'Strength D — Full-body/Skill', session: 'Full-body/skill OR outdoor activity · family',                    deep: 'Longer skill block ~2h' },
  { day: 'Sunday',    focus: 'Rest / Active Recovery',       session: 'Walk · mobility · meal prep · weekly review · family',            deep: 'Weekly review + plan next week' },
];

/** Weekday index for an ISO date, Monday = 0 … Sunday = 6. */
export function weekdayIndex(iso) {
  return (new Date(`${iso}T00:00:00`).getDay() + 6) % 7;
}

/** The plan entry for a given ISO date. */
export function planForDate(iso) {
  return WEEK_PLAN[weekdayIndex(iso)];
}

/** 1-based protocol week for a day number. */
export function weekNumber(dayNumber) {
  return Math.max(1, Math.ceil(dayNumber / 7));
}

/** Every 6th protocol week is a deload — go light, keep moving. */
export function isDeloadWeek(dayNumber) {
  return weekNumber(dayNumber) % 6 === 0;
}
