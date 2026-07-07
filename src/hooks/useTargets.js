import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProfile } from '../db/db.js';
import { DEFAULT_PROFILE } from '../data/profile.js';
import { deriveTargets } from '../lib/health.js';

/** The most recent logged bodyweight, or the profile's start weight. */
export function useCurrentWeight(fallback) {
  const weight = useLiveQuery(async () => {
    const latest = await db.days
      .orderBy('date')
      .reverse()
      .filter((d) => d.weight != null && !Number.isNaN(d.weight))
      .first();
    return latest?.weight ?? null;
  }, []);
  return weight ?? fallback ?? null;
}

/** Live profile (falls back to defaults before first load / seed). */
export function useProfile() {
  return useLiveQuery(() => getProfile(), []) ?? DEFAULT_PROFILE;
}

/**
 * The single reactive source for the adaptive plan: profile + the latest
 * logged weight → fully derived daily targets. Any new weigh-in re-runs this
 * and every consumer re-renders with an updated plan.
 */
export function useTargets() {
  const profile = useProfile();
  const weight = useCurrentWeight(profile.startWeightKg);
  const targets = deriveTargets(profile, weight);
  return { profile, weight: targets.basisWeight, targets };
}
