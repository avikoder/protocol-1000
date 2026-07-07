/* Local-timezone date helpers.
 * We deliberately avoid toISOString() (which is UTC) so that a "day" starts
 * at the user's local midnight — the whole app is keyed on that boundary. */

export function todayISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole-day difference b - a (both ISO strings). */
export function daysBetween(aIso, bIso) {
  const a = isoToDate(aIso).getTime();
  const b = isoToDate(bIso).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function addDays(iso, n) {
  const d = isoToDate(iso);
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** e.g. "Sun, 5 Jul" */
export function prettyDate(iso) {
  const d = isoToDate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** e.g. "5 Jul" */
export function shortDate(iso) {
  const d = isoToDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
