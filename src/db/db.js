import Dexie from 'dexie';
import { todayISO } from '../lib/date.js';
import { DEFAULT_PROFILE, sanitizeProfile } from '../data/profile.js';

/* --------------------------------------------------------------------------
 * Protocol 1000 — local database (IndexedDB via Dexie)
 *
 * Everything lives on the device. There is no server, no sync, no network.
 * A single `days` table keyed by ISO date holds one record per day; a tiny
 * `settings` table holds the protocol start date and the user's targets.
 * ------------------------------------------------------------------------ */

export const db = new Dexie('Protocol1000');

db.version(1).stores({
  // Primary key `date` = 'YYYY-MM-DD'. Extra indexes power analytics queries.
  days: 'date, dayNumber, mood, weight',
  settings: 'key',
});

// Sensible defaults for an 80 kg, 5'11" male targeting lean muscle gain.
export const DEFAULT_TARGETS = {
  proteinTarget: 150, // grams/day  (~1.8 g/kg)
  waterTarget: 3000, // millilitres/day
  stepTarget: 8000, // steps/day
  readingTarget: 30, // minutes/day
};

export const WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Rest'];

/** A blank day record. Never write partial records without going through here. */
export function makeEmptyDay(date, dayNumber) {
  const now = Date.now();
  return {
    date,
    dayNumber,
    // Physical
    workoutType: null, // 'Push' | 'Pull' | 'Legs' | 'Rest'
    workoutDone: false,
    steps: 0,
    cardioMin: 0, // zone-2 / cardio minutes
    sessionNotes: '', // what the session actually was
    // Nutrition
    protein: 0, // grams
    carbs: null, // grams (optional)
    fat: null, // grams (optional)
    water: 0, // millilitres
    // Cognitive
    readingMinutes: 0,
    ankiDone: false, // spaced-repetition review done
    // Mental health
    mindfulness: false,
    mood: null, // 1..5
    familyTime: false, // protected family/relationship time
    // Recovery
    sleepHours: null, // hours slept last night
    sleepQuality: null, // 1..5
    rhr: null, // resting heart rate, bpm
    hrv: null, // heart-rate variability, ms
    nsdrMin: 0, // non-sleep deep rest, minutes
    // Strength log — [{ id, name, weightKg, reps }]
    lifts: [],
    // Custom habit checks — { [habitId]: true }
    habits: {},
    // Body
    weight: null, // kilograms
    // Journal
    reflection: '',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Merge a patch into a day, creating the record if it doesn't exist.
 * Wrapped in a transaction so rapid taps (e.g. +250 ml water) never race.
 */
export async function patchDay(date, dayNumber, patch) {
  return db.transaction('rw', db.days, async () => {
    const existing = await db.days.get(date);
    if (existing) {
      await db.days.update(date, { ...patch, updatedAt: Date.now() });
    } else {
      await db.days.put({ ...makeEmptyDay(date, dayNumber), ...patch });
    }
  });
}

/* ------------------------------- settings ------------------------------- */

export async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

export async function getTargets() {
  return (await getSetting('targets')) || DEFAULT_TARGETS;
}

/* ------------------------------- profile -------------------------------- */

/** The user profile drives all adaptive targets. Always returns a complete,
 *  sanitised object even if nothing has been saved yet. */
export async function getProfile() {
  const stored = await getSetting('profile');
  return sanitizeProfile(stored || {});
}

export async function setProfile(profile) {
  await setSetting('profile', sanitizeProfile(profile));
}

/** Seed the default profile on first launch. Idempotent. */
export async function ensureProfile() {
  const existing = await getSetting('profile');
  if (!existing) await setSetting('profile', { ...DEFAULT_PROFILE });
}

/* -------------------------------- habits -------------------------------- */

/** User-defined habits: [{ id, name, icon, color }]. Checked per-day in
 *  `day.habits`. Definitions live in settings so they survive day churn. */
export async function getHabits() {
  return (await getSetting('habits')) || [];
}

export async function setHabits(list) {
  await setSetting('habits', Array.isArray(list) ? list.slice(0, 8) : []);
}

/* ---------------------------- monthly review ----------------------------- */

/** Free-form reflection per 30-day block: { [monthIndex]: note }. */
export async function getMonthNotes() {
  return (await getSetting('monthNotes')) || {};
}

export async function setMonthNote(month, note) {
  const all = await getMonthNotes();
  await setSetting('monthNotes', { ...all, [month]: note });
}

/**
 * Ensure the protocol has a start date. Runs once on first launch and is
 * idempotent thereafter. Returns the ISO start date.
 */
export async function ensureStartDate() {
  return db.transaction('rw', db.settings, async () => {
    const existing = await db.settings.get('startDate');
    if (existing) return existing.value;
    const start = todayISO();
    await db.settings.put({ key: 'startDate', value: start });
    return start;
  });
}

/** Seed default targets if the user has never customised them. */
export async function ensureTargets() {
  const existing = await getSetting('targets');
  if (!existing) await setSetting('targets', DEFAULT_TARGETS);
}

/* --------------------------- data ownership ----------------------------- */

/** Export the entire database as a JSON string the user can save anywhere. */
export async function exportAll() {
  const [days, settings] = await Promise.all([
    db.days.orderBy('date').toArray(),
    db.settings.toArray(),
  ]);
  return JSON.stringify({ app: 'protocol-1000', version: 1, days, settings }, null, 2);
}

/** Restore from a previously exported JSON blob (replaces current data). */
export async function importAll(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  await db.transaction('rw', db.days, db.settings, async () => {
    await db.days.clear();
    await db.settings.clear();
    if (Array.isArray(parsed.days)) await db.days.bulkPut(parsed.days);
    if (Array.isArray(parsed.settings)) await db.settings.bulkPut(parsed.settings);
  });
}
