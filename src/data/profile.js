/* The user profile drives every adaptive target in the app. Weight, height,
 * age, goal and activity feed the energy/protein/hydration engine in
 * lib/health.js, so editing the profile literally rewrites the daily plan. */

export const SEXES = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// Mifflin-St Jeor activity multipliers → TDEE = BMR × factor.
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise', factor: 1.2 },
  { value: 'light', label: 'Light', hint: '1–3 sessions / week', factor: 1.375 },
  { value: 'moderate', label: 'Moderate', hint: '3–5 sessions / week', factor: 1.55 },
  { value: 'active', label: 'Active', hint: '6–7 sessions / week', factor: 1.725 },
  { value: 'athlete', label: 'Athlete', hint: 'Twice-daily / physical job', factor: 1.9 },
];

// Goal sets the calorie posture (surplus/deficit) and the target rate of
// bodyweight change the hypertrophy engine checks your trend against.
export const GOALS = [
  {
    value: 'lean-muscle',
    label: 'Lean muscle',
    hint: 'Slow, clean gain',
    kcalFactor: 1.08, // ~8% surplus
    weeklyRatePctBW: 0.25, // aim +0.25% bodyweight / week
    direction: 1,
  },
  {
    value: 'recomp',
    label: 'Recomp',
    hint: 'Hold weight, shift composition',
    kcalFactor: 1.0,
    weeklyRatePctBW: 0.0,
    direction: 0,
  },
  {
    value: 'bulk',
    label: 'Bulk',
    hint: 'Faster mass gain',
    kcalFactor: 1.15, // ~15% surplus
    weeklyRatePctBW: 0.5,
    direction: 1,
  },
  {
    value: 'cut',
    label: 'Cut',
    hint: 'Lose fat, keep muscle',
    kcalFactor: 0.8, // ~20% deficit
    weeklyRatePctBW: -0.6,
    direction: -1,
  },
];

// Defaults match the user's baseline: 31 yo male, 80 kg, 5'11" (180 cm),
// gym access, whole-foods diet, targeting lean muscle.
export const DEFAULT_PROFILE = {
  name: '',
  sex: 'male',
  age: 31,
  heightCm: 180,
  startWeightKg: 80,
  goal: 'lean-muscle',
  activity: 'moderate',
  proteinPerKg: 2.0, // g protein per kg bodyweight (1.6–2.4 typical)
  fatPerKg: 0.8, // g fat per kg bodyweight (hormonal floor)
  calorieOverride: null, // manual kcal target; null = auto from TDEE × goal
  trainingDaysPerWeek: 5,
  stepTarget: 8000,
  readingTarget: 30,
  sleepTargetH: 7.5, // hours/night
};

export function getGoal(value) {
  return GOALS.find((g) => g.value === value) || GOALS[0];
}

export function getActivity(value) {
  return ACTIVITY_LEVELS.find((a) => a.value === value) || ACTIVITY_LEVELS[2];
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Coerce whatever is stored/entered into a safe, complete profile. */
export function sanitizeProfile(p = {}) {
  const merged = { ...DEFAULT_PROFILE, ...p };
  return {
    ...merged,
    name: String(merged.name ?? '').slice(0, 40),
    sex: SEXES.some((s) => s.value === merged.sex) ? merged.sex : 'male',
    age: clamp(Math.round(Number(merged.age) || 31), 14, 90),
    heightCm: clamp(Math.round(Number(merged.heightCm) || 180), 130, 220),
    startWeightKg: clamp(Math.round((Number(merged.startWeightKg) || 80) * 10) / 10, 35, 220),
    goal: GOALS.some((g) => g.value === merged.goal) ? merged.goal : 'lean-muscle',
    activity: ACTIVITY_LEVELS.some((a) => a.value === merged.activity) ? merged.activity : 'moderate',
    proteinPerKg: clamp(Math.round((Number(merged.proteinPerKg) || 2.0) * 10) / 10, 1.2, 3.0),
    fatPerKg: clamp(Math.round((Number(merged.fatPerKg) || 0.8) * 10) / 10, 0.5, 1.5),
    calorieOverride:
      merged.calorieOverride == null || merged.calorieOverride === ''
        ? null
        : clamp(Math.round(Number(merged.calorieOverride) / 10) * 10, 1200, 6000),
    trainingDaysPerWeek: clamp(Math.round(Number(merged.trainingDaysPerWeek) || 5), 1, 7),
    stepTarget: clamp(Math.round((Number(merged.stepTarget) || 8000) / 500) * 500, 2000, 25000),
    readingTarget: clamp(Math.round((Number(merged.readingTarget) || 30) / 5) * 5, 5, 180),
    sleepTargetH: clamp(Math.round((Number(merged.sleepTargetH) || 7.5) * 2) / 2, 4, 12),
  };
}
