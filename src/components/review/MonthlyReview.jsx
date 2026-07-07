import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { db, getMonthNotes, setMonthNote } from '../../db/db.js';
import { useTargets } from '../../hooks/useTargets.js';
import { floorDone, completionScore, loggedCalories } from '../../lib/stats.js';
import { TOTAL_DAYS } from '../../data/roadmap.js';

const BLOCK = 30;

/** 30-day review blocks (from 1000-Day-OS): auto-summarised adherence,
 *  sleep, macros and bodyweight trend, plus a free-form reflection each. */
export default function MonthlyReview({ protocol }) {
  const days = useLiveQuery(() => db.days.toArray(), []) ?? [];
  const notes = useLiveQuery(() => getMonthNotes(), []) ?? {};
  const { targets } = useTargets();
  const currentDay = protocol.dayNumber;

  const byNum = useMemo(() => new Map(days.map((d) => [d.dayNumber, d])), [days]);
  const reached = Math.max(1, Math.ceil(currentDay / BLOCK));
  const months = Array.from({ length: reached }, (_, i) => i + 1).reverse(); // newest first

  return (
    <div className="space-y-3">
      <div className="px-0.5">
        <h1 className="font-display text-xl font-bold">Monthly review</h1>
        <p className="mt-0.5 text-sm text-base-content/45">
          30-day blocks, auto-summarised. Add a reflection to each — milestones, measurements, lessons.
        </p>
      </div>

      {months.map((m) => (
        <MonthBlock
          key={m}
          m={m}
          byNum={byNum}
          currentDay={currentDay}
          targets={targets}
          note={notes[m] ?? ''}
        />
      ))}
    </div>
  );
}

function MonthBlock({ m, byNum, currentDay, targets, note }) {
  const a = (m - 1) * BLOCK + 1;
  const b = Math.min(TOTAL_DAYS, m * BLOCK);
  const active = currentDay >= a && currentDay <= b;

  const stats = useMemo(() => {
    const blk = [];
    for (let d = a; d <= b; d++) {
      const rec = byNum.get(d);
      if (rec) blk.push(rec);
    }
    const nums = (fn) => blk.map(fn).filter((v) => v != null && !Number.isNaN(v) && v > 0);
    const avg = (arr) => (arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null);

    const elapsed = Math.max(0, Math.min(b, currentDay) - a + 1);
    const floorN = blk.filter(floorDone).length;
    const logged = blk.filter((d) => completionScore(d, targets) >= 1).length;

    // Bodyweight trend: first vs last weigh-in inside the block.
    let bw0 = null;
    let bw1 = null;
    for (let d = a; d <= b; d++) {
      const w = byNum.get(d)?.weight;
      if (w != null && w > 0) {
        if (bw0 == null) bw0 = w;
        bw1 = w;
      }
    }

    return {
      elapsed,
      adherence: elapsed > 0 ? Math.round((floorN / elapsed) * 100) : 0,
      logged,
      floorN,
      avgSleep: avg(nums((d) => d.sleepHours)),
      avgProtein: avg(nums((d) => d.protein)),
      avgKcal: avg(blk.map(loggedCalories).filter((v) => v != null && v > 0)),
      bwDelta: bw0 != null && bw1 != null ? Math.round((bw1 - bw0) * 10) / 10 : null,
    };
  }, [a, b, byNum, currentDay, targets]);

  return (
    <section
      className={`rounded-box border p-4 animate-fade-up ${
        active ? 'border-primary/35 bg-base-200' : 'border-white/5 bg-base-200'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold">
          <CalendarCheck size={15} className={active ? 'text-primary' : 'text-base-content/40'} />
          Month {m}
          {active && (
            <span className="rounded-badge bg-primary/15 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-primary">
              CURRENT
            </span>
          )}
        </h2>
        <span className="tnum font-mono text-[12px] text-base-content/40">
          days {a}–{b}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Stat label="Adherence" value={`${stats.adherence}%`} good={stats.adherence >= 80} />
        <Stat label="Logged" value={`${stats.logged}/${stats.elapsed || b - a + 1}`} />
        <Stat label="Floor days" value={stats.floorN} />
        <Stat label="Avg sleep" value={stats.avgSleep == null ? '—' : `${stats.avgSleep.toFixed(1)}h`} />
        <Stat label="Avg protein" value={stats.avgProtein == null ? '—' : `${Math.round(stats.avgProtein)}g`} />
        <Stat label="Avg kcal" value={stats.avgKcal == null ? '—' : Math.round(stats.avgKcal).toLocaleString()} />
      </div>

      {/* Bodyweight trend across the block */}
      <div className="mt-2 flex items-center gap-1.5 font-mono text-[12px] text-base-content/45">
        <span>BW trend</span>
        {stats.bwDelta == null ? (
          <span className="text-base-content/30">—</span>
        ) : (
          <span
            className="flex items-center gap-1 rounded-badge px-2 py-0.5 font-semibold"
            style={{
              color: stats.bwDelta >= 0 ? '#34D399' : '#FB7185',
              backgroundColor: stats.bwDelta >= 0 ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
            }}
          >
            {stats.bwDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {stats.bwDelta > 0 ? '+' : ''}
            {stats.bwDelta} kg
          </span>
        )}
      </div>

      <NoteBox m={m} initial={note} />
    </section>
  );
}

function Stat({ label, value, good }) {
  return (
    <div className="rounded-box bg-base-300/50 px-2 py-1.5 text-center">
      <p className={`tnum font-mono text-[14px] font-bold ${good ? 'text-success' : ''}`}>{value}</p>
      <p className="text-[10.5px] uppercase tracking-wide text-base-content/40">{label}</p>
    </div>
  );
}

/** Debounced auto-saving reflection, same ethos as the daily journal. */
function NoteBox({ m, initial }) {
  const [text, setText] = useState(initial);
  const timer = useRef(null);
  const dirty = useRef(false);

  // Adopt external value only if the user hasn't typed yet.
  useEffect(() => {
    if (!dirty.current) setText(initial);
  }, [initial]);

  const onChange = (v) => {
    dirty.current = true;
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMonthNote(m, v), 500);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <textarea
      value={text}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      placeholder="Milestones · measurements · reflection for this block…"
      className="mt-3 w-full resize-none rounded-box border border-white/5 bg-base-300/40 px-3 py-2 text-[13.5px] leading-snug outline-none placeholder:text-base-content/25 focus:border-primary/40"
    />
  );
}
