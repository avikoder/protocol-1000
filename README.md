# Protocol 1000

A local-first, offline PWA for a **1000-day transformation** across fitness, nutrition, cognition, and mental health. Zero backend. Every byte of your data lives in **IndexedDB on your device** — private, portable, and available offline.

Built for a 31-year-old, 80 kg, 5'11" lifter with gym access and a whole-foods diet (chicken, eggs), targeting lean muscle gain and functional fitness. Defaults reflect that (150 g protein, 3 L water, 8k steps) and are configurable in `src/db/db.js`.

## Stack

- **React + Vite** — reactive, state-driven UI
- **Tailwind CSS + DaisyUI** — custom high-contrast dark theme (`protocol`)
- **Dexie.js** (+ `dexie-react-hooks`) — transactional IndexedDB; `useLiveQuery` re-renders instantly on every write
- **Recharts** — weight trend, radar, mood×mindfulness charts
- **Lucide-React** — icons
- Hand-rolled **service worker** tuned for standalone iOS

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve the build (service worker runs here, not in dev)
```

> The service worker registers in **production builds only** (Vite dev doesn't serve `/service-worker.js`). Use `npm run preview` to test offline behaviour and installability.

## Project structure

```
protocol-1000/
├── index.html                 # iOS PWA meta, apple-touch-icon, viewport-fit=cover
├── vite.config.js
├── tailwind.config.js         # custom 'protocol' DaisyUI theme + pillar colors
├── postcss.config.js
├── public/
│   ├── manifest.webmanifest   # standalone display, icons, theme color
│   ├── service-worker.js      # precache shell + SWR assets + offline nav fallback
│   ├── offline.html
│   └── icons/                 # 192 / 512 / maskable / apple-touch
└── src/
    ├── main.jsx               # mount + storage.persist() + SW registration
    ├── App.jsx                # seeds DB, tab state, header, bottom nav
    ├── index.css              # fonts, Tailwind layers, safe-area utilities
    ├── db/db.js               # Dexie schema + upsert/settings/export helpers
    ├── lib/date.js            # local-timezone ISO date math
    ├── lib/stats.js           # pillar completion, streaks, radar, correlation
    ├── data/roadmap.js        # hardcoded 4-phase architecture + phase helpers
    ├── hooks/useProtocolDay.js
    └── components/
        ├── BottomNav.jsx
        ├── ui/                # Card, Ring (signature progress ring)
        ├── dashboard/         # DayHeader + 4 pillar cards + vitals + reflection
        ├── analytics/         # KpiStrip, WeightTrend, ConsistencyGrid, PillarRadar, MoodCorrelation
        └── roadmap/           # Roadmap.jsx
```

## Data model

One `days` record per calendar day (keyed by local ISO date), plus a tiny `settings` table:

```
days:     date(PK) · dayNumber · workoutType · workoutDone · steps ·
          protein · water · readingMinutes · mindfulness · mood ·
          weight · reflection · createdAt · updatedAt
settings: key(PK) · value        # 'startDate', 'targets'
```

Every interaction flows through `patchDay()` — a transactional upsert — so rapid taps (e.g. +250 ml water) never race, and `useLiveQuery` reflects each change immediately.

**Your data, portable:** `exportAll()` / `importAll()` in `db.js` serialize the whole database to/from JSON. Wire them to a button if you want manual backups.

## Installing on iPhone (standalone)

1. Host the built `dist/` over **HTTPS** (any static host).
2. Open in **Safari** → Share → **Add to Home Screen**.
3. Launch from the home-screen icon — it runs full-screen, offline, no browser chrome.

`main.jsx` requests `navigator.storage.persist()` on launch, which makes IndexedDB far less likely to be evicted by iOS under storage pressure.

## Deploying to a sub-path (e.g. GitHub Pages project site)

If serving from `https://<user>.github.io/protocol-1000/`:

1. Set `base: '/protocol-1000/'` in `vite.config.js`.
2. In `index.html` and `manifest.webmanifest`, prefix asset paths with the sub-path (or make them relative).
3. In `service-worker.js`, update `APP_SHELL` paths and the registration `scope` in `main.jsx` to the sub-path.

A root domain or a user site (`<user>.github.io`) needs no changes.

## What's in v1.2 — the 1000-Day-OS merge

Everything from the original single-file 1000-Day-OS, rebuilt on the adaptive engine:

- **Weekday session plan** — Mon–Sun auto-plan (Strength A Push / Zone 2 / Pull / Recovery / Legs / Full-body-skill / Rest) with focus, session prescription and deep-work block, shown per selected day.
- **Deload weeks** — every 6th protocol week is flagged on the plan card: go light, bank recovery.
- **Daily floor** — the 4 non-negotiables (Move · Anki · Sleep 6h+ · Reflect) as a strip under the pillars, with an unbroken-floor streak counter.
- **New trackables** — cardio minutes, session notes, Anki/spaced-repetition toggle, NSDR minutes, family-time toggle, resting HR, HRV, and full macros (carbs + fat) with auto-calories (4P+4C+9F) vs your adaptive target.
- **Monthly review tab** — 30-day blocks auto-summarised (adherence, logged, floor days, avg sleep/protein/kcal, bodyweight trend) each with a saved reflection.
- **Recovery vitals chart** + **averages & counts panel** in Insights.
- **Jump to day #** (tap the date pill), **future start dates** with a mission countdown, **CSV export** with computed columns, **erase-all**, manual **calorie override**, configurable **fat g/kg**.

## What's in v1.1

- **Backfill any day** — ‹ › arrows on the Today tab let you edit past days back to day 1 (future days are locked). Streak insurance for a 1000-day run.
- **Strength log** — record top sets per lift; Epley e1RM is computed live, PRs are auto-detected (star badge), and Insights charts per-lift e1RM progression.
- **Sleep tracking** — hours (±30 min) + 1–5 quality on the Today tab, target in Profile, 21-night chart vs target in Insights.
- **Readiness watch** — if your last few days of sleep/mood run low, the plan card flags it and suggests going lighter. Conservative: needs 2+ agreeing data points.
- **Custom habits** — define up to 8 of your own habits (icon + colour) in Profile; tick them daily; per-habit streaks shown inline.
- **Awards** — 17 achievements with honest progress meters on locked badges (streaks, milestones, protein/hydration/sleep consistency, reading, steps, PRs…).
- **Guided mindfulness timer** — 2/5/10-minute countdown ring; completing a session marks mindfulness done.

## Adaptive plan & profile

Open the gear icon (top-right) to set your parameters: sex, age, height, start
weight, goal, activity level, protein-per-kg, training days, and step/reading
targets. These live in `settings` under the `profile` key.

Every daily target is **derived**, not hard-coded (`src/lib/health.js`):

- **Calories** — Mifflin-St Jeor BMR × activity factor (TDEE), then adjusted by
  goal (lean muscle +8%, bulk +15%, cut −20%, recomp 0).
- **Protein** — `bodyweight × proteinPerKg` (default 2.0 g/kg).
- **Carbs / fat** — fat floored at 0.8 g/kg, carbs fill the remaining energy.
- **Water** — ~35 ml/kg, snapped to 250 ml cups.

The basis weight is your **latest logged bodyweight** (falling back to start
weight), so logging a weigh-in on the Today tab instantly rewrites protein,
calories, and hydration everywhere.

The **hypertrophy engine** (`src/lib/progression.js`) reads your smoothed weight
trend (kg/week over ~21 days) and compares it to the goal's target rate, then
coaches you on the dashboard and in the active roadmap phase ("on track for lean
gain", "gaining fast — trim ~175 kcal", etc.) and prescribes weekly training
volume per phase.

Tune the model in one place: goal factors and target rates in
`src/data/profile.js`, energy/macros in `src/lib/health.js`, and the coaching
thresholds in `src/lib/progression.js`.

## Customising

- **Targets** (protein/water/steps/reading): `DEFAULT_TARGETS` in `src/db/db.js`.
- **Phase content**: `PHASES` in `src/data/roadmap.js`.
- **Pillar thresholds** for the consistency grid: `pillarDone()` in `src/lib/stats.js`.
- **Theme colors**: the `protocol` theme in `tailwind.config.js`.
