/* The 1000-day programmatic roadmap.
 * Four phases unlock progressively as `dayNumber` advances. Each phase carries
 * per-pillar programming so the Roadmap tab reads like a real training block,
 * not just a label. */

export const PHASES = [
  {
    id: 1,
    codename: 'FOUNDATION',
    name: 'Foundation & Habit Building',
    start: 1,
    end: 100,
    tagline: 'Make the behaviours automatic before you make them heavy.',
    focus: {
      physical:
        'Full-body / PPL split at RPE 6–7. Grease the groove on the basic patterns: squat, hinge, push, pull. Nail form and consistency over load.',
      nutrition:
        'Hit ~150 g protein daily (chicken, eggs, whole foods). Eat at maintenance ±100 kcal. Fix meal timing and hydration (3 L water).',
      cognitive:
        'Build a 30-minute daily reading habit. Same time, same place. Focus on fundamentals in your target domain.',
      mental:
        'Daily 5–10 min mindfulness to anchor the routine. Log mood honestly — you are calibrating the baseline, not performing.',
    },
  },
  {
    id: 2,
    codename: 'HYPERTROPHY',
    name: 'Hypertrophy & Progressive Overload',
    start: 101,
    end: 400,
    tagline: 'Add volume and load systematically. Grow.',
    focus: {
      physical:
        'Structured PPL, 4–6 sessions/week. Progressive overload via double progression (reps then load). 10–20 hard sets per muscle per week.',
      nutrition:
        'Lean bulk: +200–300 kcal surplus. Protein 1.8–2.2 g/kg. Time carbs around training. Track weight trend weekly, not daily noise.',
      cognitive:
        'Move from reading to doing: build/ship small projects. 45 min deep work blocks. Apply what you read within 48 hours.',
      mental:
        'Extend mindfulness to 15 min. Use mood-vs-mindfulness data to spot what actually regulates you. Protect sleep as a training variable.',
    },
  },
  {
    id: 3,
    codename: 'STRENGTH',
    name: 'Strength & Nutrient Timing Optimization',
    start: 401,
    end: 700,
    tagline: 'Get strong, get precise, get efficient.',
    focus: {
      physical:
        'Undulating periodization: heavy (3–5 reps), moderate, and pump days. Prioritise big lifts. Deload every 5–6 weeks. Add functional/athletic work.',
      nutrition:
        'Dial in nutrient timing: pre/intra/post fuelling. Recomp or slow bulk depending on target. Micronutrient and fibre quality audit.',
      cognitive:
        'Spaced repetition + teaching to lock in mastery. 60 min focused blocks. Build one substantial artefact that proves the skill.',
      mental:
        'Stress inoculation: hard workouts, cold, breath work. Use reflection journaling to convert setbacks into protocol adjustments.',
    },
  },
  {
    id: 4,
    codename: 'MASTERY',
    name: 'Mastery, Autonomy & Peak Form',
    start: 701,
    end: 1000,
    tagline: 'Autoregulate. You run the protocol; it no longer runs you.',
    focus: {
      physical:
        'Autoregulated training by readiness and RPE. Peak strength and conditioning together. Maintain lean mass while expressing athleticism.',
      nutrition:
        'Intuitive but data-informed eating. Maintenance with intentional mini-cuts/bulks. Nutrition becomes effortless and automatic.',
      cognitive:
        'Operate at the edge of your field. Create and publish. Mentor or teach — the final test of mastery is transfer.',
      mental:
        'Full metacognitive control. Mindfulness is a tool you deploy, not a chore. Reflect on the 1000-day arc and design what comes after.',
    },
  },
];

export const TOTAL_DAYS = 1000;

export function getPhase(dayNumber) {
  return PHASES.find((p) => dayNumber >= p.start && dayNumber <= p.end) || PHASES[0];
}

/** Progress through the *current* phase, 0..1. */
export function phaseProgress(dayNumber) {
  const p = getPhase(dayNumber);
  const span = p.end - p.start + 1;
  const done = Math.min(dayNumber, p.end) - p.start + 1;
  return Math.max(0, Math.min(1, done / span));
}

/** 'locked' | 'active' | 'complete' for a given phase relative to today. */
export function phaseStatus(phase, dayNumber) {
  if (dayNumber > phase.end) return 'complete';
  if (dayNumber >= phase.start) return 'active';
  return 'locked';
}
