import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Rocket } from 'lucide-react';
import { db, patchDay } from '../../db/db.js';
import { PILLARS, pillarDone, completionScore } from '../../lib/stats.js';
import { useTargets } from '../../hooks/useTargets.js';
import { addDays, daysBetween, prettyDate } from '../../lib/date.js';
import { getPhase, phaseProgress, TOTAL_DAYS } from '../../data/roadmap.js';
import DayHeader from './DayHeader.jsx';
import SessionPlanCard from './SessionPlanCard.jsx';
import FloorStrip from './FloorStrip.jsx';
import PlanCard from './PlanCard.jsx';
import PhysicalCard from './PhysicalCard.jsx';
import StrengthCard from './StrengthCard.jsx';
import NutritionCard from './NutritionCard.jsx';
import SleepCard from './SleepCard.jsx';
import { RhrCard, HrvCard } from './BioCards.jsx';
import CognitiveCard from './CognitiveCard.jsx';
import MentalCard from './MentalCard.jsx';
import HabitsCard from './HabitsCard.jsx';
import VitalsCard from './VitalsCard.jsx';
import ReflectionCard from './ReflectionCard.jsx';

export default function Dashboard({ protocol, onOpenSettings }) {
  const { todayKey, startDate, notStarted, startsIn } = protocol;

  /* --- day selection: today by default, navigable back to day 1 --- */
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const prevToday = useRef(todayKey);

  // If midnight rolls over while "today" is selected, follow the new day.
  useEffect(() => {
    if (selectedKey === prevToday.current) setSelectedKey(todayKey);
    prevToday.current = todayKey;
  }, [todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const isToday = selectedKey === todayKey;
  const rawNumber = daysBetween(startDate, selectedKey) + 1;
  const dayNumber = Math.max(1, Math.min(TOTAL_DAYS, rawNumber));
  const phase = getPhase(dayNumber);
  const phasePct = phaseProgress(dayNumber);

  // Live day record — any write below re-renders these cards instantly.
  const day = useLiveQuery(() => db.days.get(selectedKey), [selectedKey]);
  // Adaptive targets derived from profile + latest logged weight.
  const { profile, targets } = useTargets();

  // Every interaction routes through here → transactional upsert to IndexedDB.
  const save = useCallback(
    (patch) => patchDay(selectedKey, dayNumber, patch),
    [selectedKey, dayNumber]
  );

  const jumpToDay = (n) => setSelectedKey(addDays(startDate, n - 1));

  const score = completionScore(day, targets);

  return (
    <div className="space-y-3">
      {/* Future start date: mission countdown (from 1000-Day-OS) */}
      {notStarted && (
        <div className="flex items-start gap-2.5 rounded-box border border-primary/25 bg-primary/10 p-3.5 animate-fade-up">
          <Rocket size={17} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.4} />
          <div>
            <p className="text-[14px] font-bold text-primary">
              Mission starts in {startsIn} {startsIn === 1 ? 'day' : 'days'}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-snug text-base-content/55">
              Day 1 = {prettyDate(startDate)}. You're previewing day 1 — anything you log now counts toward it.
            </p>
          </div>
        </div>
      )}

      <DayHeader
        dayNumber={dayNumber}
        phase={phase}
        phasePct={phasePct}
        selectedKey={selectedKey}
        isToday={isToday}
        canPrev={dayNumber > 1}
        canNext={!isToday && !notStarted}
        onPrev={() => setSelectedKey(addDays(selectedKey, -1))}
        onNext={() => setSelectedKey(addDays(selectedKey, 1))}
        onToday={() => setSelectedKey(todayKey)}
        onJump={jumpToDay}
      />

      {/* Per-pillar completion pips — each lights up in its own colour */}
      <div className="flex items-center justify-center gap-1.5 pb-1">
        {PILLARS.map((p) => {
          const done = pillarDone(day, p.key, targets);
          return (
            <span
              key={p.key}
              className="h-1.5 w-8 rounded-full transition-colors duration-300"
              style={{ backgroundColor: done ? p.color : 'rgba(255,255,255,0.09)' }}
            />
          );
        })}
        <span className="tnum ml-2 font-mono text-xs text-base-content/45">{score}/4 pillars</span>
      </div>

      <FloorStrip day={day} dayNumber={dayNumber} />
      <SessionPlanCard dateKey={selectedKey} dayNumber={dayNumber} />
      {isToday && <PlanCard profile={profile} targets={targets} />}

      <PhysicalCard day={day} targets={targets} save={save} />
      <StrengthCard day={day} save={save} />
      <NutritionCard day={day} targets={targets} save={save} />

      {/* Morning check-in: weight + sleep, RHR + HRV */}
      <div className="grid grid-cols-2 gap-3">
        <VitalsCard day={day} save={save} />
        <SleepCard day={day} targets={targets} save={save} />
        <RhrCard day={day} save={save} />
        <HrvCard day={day} save={save} />
      </div>

      <CognitiveCard day={day} targets={targets} save={save} />
      <MentalCard day={day} save={save} />
      <HabitsCard day={day} dayNumber={dayNumber} save={save} onOpenSettings={onOpenSettings} />
      <ReflectionCard day={day} save={save} />
    </div>
  );
}
