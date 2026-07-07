import { getActivity, getGoal, sanitizeProfile } from '../data/profile.js';

/* The adaptive engine. Every number the daily plan shows is DERIVED here from
 * the profile plus the user's *current* logged weight — so as bodyweight moves,
 * protein, calories and hydration move with it automatically. */

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function bmr(profile, weightKg) {
  const p = sanitizeProfile(profile);
  const w = Number(weightKg) || p.startWeightKg;
  const base = 10 * w + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(base + (p.sex === 'female' ? -161 : 5));
}

/** Total daily energy expenditure = BMR × activity factor. */
export function tdee(profile, weightKg) {
  const factor = getActivity(profile.activity).factor;
  return Math.round(bmr(profile, weightKg) * factor);
}

/** Rounded macro + energy + hydration targets for a given bodyweight. */
export function deriveTargets(profile, weightKg) {
  const p = sanitizeProfile(profile);
  const w = Number(weightKg) || p.startWeightKg;
  const goal = getGoal(p.goal);

  const maintenance = tdee(p, w);
  const autoTarget = Math.round((maintenance * goal.kcalFactor) / 10) * 10;
  // Manual override wins when set; the surplus readout stays honest vs TDEE.
  const calorieTarget = p.calorieOverride ?? autoTarget;

  // Protein scales directly with bodyweight — the core adaptive link.
  const proteinTarget = Math.round(w * p.proteinPerKg);
  // Fat floor (g/kg, configurable) for hormones; carbs fill remaining energy.
  const fatTarget = Math.round(w * p.fatPerKg);
  const carbTarget = Math.max(
    0,
    Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4)
  );

  // Hydration ≈ 35 ml/kg, snapped to a clean 250 ml cup count.
  const waterTarget = Math.min(
    4500,
    Math.max(2000, Math.round((w * 35) / 250) * 250)
  );

  return {
    basisWeight: Math.round(w * 10) / 10,
    bmr: bmr(p, w),
    tdee: maintenance,
    calorieTarget,
    proteinTarget,
    fatTarget,
    carbTarget,
    proteinPerKg: p.proteinPerKg,
    fatPerKg: p.fatPerKg,
    calorieOverridden: p.calorieOverride != null,
    autoCalorieTarget: autoTarget,
    waterTarget,
    stepTarget: p.stepTarget,
    readingTarget: p.readingTarget,
    sleepTargetH: p.sleepTargetH,
    surplusKcal: calorieTarget - maintenance, // signed: + surplus / − deficit
  };
}
