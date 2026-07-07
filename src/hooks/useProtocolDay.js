import { useLiveQuery } from 'dexie-react-hooks';
import { getSetting } from '../db/db.js';
import { todayISO, daysBetween } from '../lib/date.js';
import { getPhase, phaseProgress, TOTAL_DAYS } from '../data/roadmap.js';

/**
 * Single source of truth for "where am I in the protocol right now".
 * Reactive to the stored start date; recomputes against the local clock.
 */
export function useProtocolDay() {
  const startDate = useLiveQuery(() => getSetting('startDate'), []);
  const todayKey = todayISO();

  if (startDate === undefined) {
    return { ready: false, todayKey };
  }
  if (!startDate) {
    // Start date not seeded yet; treat as day 1.
    return {
      ready: true,
      todayKey,
      startDate: todayKey,
      dayNumber: 1,
      phase: getPhase(1),
      phasePct: phaseProgress(1),
      totalPct: 1 / TOTAL_DAYS,
    };
  }

  const raw = daysBetween(startDate, todayKey) + 1;
  const dayNumber = Math.max(1, Math.min(TOTAL_DAYS, raw));
  // A future start date is allowed (from 1000-Day-OS): the mission hasn't
  // begun yet, and the UI shows a countdown while previewing day 1.
  const notStarted = raw < 1;

  return {
    ready: true,
    todayKey,
    startDate,
    dayNumber,
    notStarted,
    startsIn: notStarted ? 1 - raw : 0,
    phase: getPhase(dayNumber),
    phasePct: phaseProgress(dayNumber),
    totalPct: dayNumber / TOTAL_DAYS,
  };
}
