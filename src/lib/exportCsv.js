import { db, getSetting } from '../db/db.js';
import { addDays } from './date.js';
import { getPhase } from '../data/roadmap.js';
import { planForDate, weekdayIndex, weekNumber, isDeloadWeek, WEEK_PLAN } from '../data/weekplan.js';
import { floorDone, loggedCalories } from './stats.js';

/* Spreadsheet-grade CSV export, ported from 1000-Day-OS and extended to the
 * full Protocol 1000 data model — every logged day plus computed columns
 * (weekday, week, phase, deload, plan focus, calories, protein-hit, floor). */

const HEADERS = [
  'Day', 'Date', 'Weekday', 'Week', 'Phase', 'Deload', 'PlanFocus',
  'WorkoutType', 'WorkoutDone', 'CardioMin', 'Steps', 'SessionNotes',
  'Lifts', 'ReadingMin', 'Anki', 'NSDRMin', 'Mindfulness', 'FamilyTime', 'Mood',
  'SleepH', 'SleepQuality', 'RHR', 'HRV', 'WeightKg',
  'Protein', 'Carbs', 'Fat', 'Calories', 'ProteinHit', 'WaterMl',
  'Habits', 'Reflection', 'FloorDone',
];

const esc = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function buildCsv(proteinTarget) {
  const [days, startDate] = await Promise.all([
    db.days.orderBy('date').toArray(),
    getSetting('startDate'),
  ]);

  const rows = [HEADERS.join(',')];
  for (const d of days) {
    const date = d.date ?? (startDate ? addDays(startDate, (d.dayNumber ?? 1) - 1) : '');
    const n = d.dayNumber ?? 0;
    const lifts = (d.lifts || [])
      .map((l) => `${l.name} ${l.weightKg}x${l.reps}`)
      .join(' | ');
    const habits = Object.entries(d.habits || {})
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(' | ');
    const kcal = loggedCalories(d);

    rows.push(
      [
        n,
        date,
        WEEK_PLAN[weekdayIndex(date)]?.day ?? '',
        weekNumber(n),
        getPhase(n).name,
        isDeloadWeek(n) ? 'DELOAD' : '',
        planForDate(date)?.focus ?? '',
        d.workoutType ?? '',
        d.workoutDone ? 'Y' : '',
        d.cardioMin || '',
        d.steps || '',
        esc(d.sessionNotes),
        esc(lifts),
        d.readingMinutes || '',
        d.ankiDone ? 'Y' : '',
        d.nsdrMin || '',
        d.mindfulness ? 'Y' : '',
        d.familyTime ? 'Y' : '',
        d.mood ?? '',
        d.sleepHours ?? '',
        d.sleepQuality ?? '',
        d.rhr ?? '',
        d.hrv ?? '',
        d.weight ?? '',
        d.protein || '',
        d.carbs ?? '',
        d.fat ?? '',
        kcal ?? '',
        (d.protein ?? 0) >= proteinTarget ? 'Y' : '',
        d.water || '',
        esc(habits),
        esc(d.reflection),
        floorDone(d) ? 'Y' : '',
      ].join(',')
    );
  }
  return rows.join('\n');
}
