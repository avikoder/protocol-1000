import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ChevronLeft, Minus, Plus, User, Ruler, Scale, Target, Activity,
  Beef, Footprints, BookOpen, Dumbbell, Flame, Droplet, Download, Upload, CalendarClock, Check,
  MoonStar, ListChecks, Trash2, FileSpreadsheet, AlertTriangle, Flame as FlameIcon,
} from 'lucide-react';
import {
  db, getProfile, setProfile, getSetting, setSetting, exportAll, importAll, getHabits, setHabits,
} from '../../db/db.js';
import { GOALS, ACTIVITY_LEVELS, SEXES, DEFAULT_PROFILE } from '../../data/profile.js';
import { deriveTargets } from '../../lib/health.js';
import { buildCsv } from '../../lib/exportCsv.js';
import { HABIT_ICONS, HABIT_COLORS, habitIcon, newHabitId } from '../../data/habits.js';

/* ------------------------------- atoms --------------------------------- */

function Row({ icon: Icon, label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-base-300 text-base-content/60">
            <Icon size={16} strokeWidth={2.3} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-medium">{label}</p>
          {hint && <p className="text-[12px] text-base-content/40">{hint}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Stepper({ value, onChange, step = 1, min = -Infinity, max = Infinity, format }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, Math.round(v * 100) / 100)));
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => set(value - step)}
        className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
        aria-label="decrease"
      >
        <Minus size={15} />
      </button>
      <span className="tnum w-14 text-center font-mono text-[16px] font-semibold">
        {format ? format(value) : value}
      </span>
      <button
        onClick={() => set(value + step)}
        className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
        aria-label="increase"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function ChipRow({ options, value, onChange, cols = 2 }) {
  return (
    <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-btn border px-2 py-2 text-left transition-all active:scale-95 ${
              active
                ? 'border-primary bg-primary/15'
                : 'border-white/5 bg-base-300/60'
            }`}
          >
            <span className={`block text-[13.5px] font-semibold ${active ? 'text-primary' : 'text-base-content/80'}`}>
              {o.label}
            </span>
            {o.hint && <span className="block text-[11.5px] text-base-content/40">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return `${ft}'${inch}"`;
}

/* ------------------------------ screen --------------------------------- */

export default function Settings({ onClose }) {
  const stored = useLiveQuery(() => getProfile(), []);
  const startDate = useLiveQuery(() => getSetting('startDate'), []);
  const [draft, setDraft] = useState(null);
  const [flash, setFlash] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (stored && !draft) setDraft(stored);
  }, [stored, draft]);

  if (!draft) return null;

  // Persist immediately — same instant-save ethos as the rest of the app.
  const update = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    setProfile(next);
  };

  const preview = deriveTargets(draft, draft.startWeightKg);

  const doExport = async () => {
    const json = await exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocol-1000-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importAll(text);
      setFlash(true);
      setTimeout(() => setFlash(false), 1600);
    } catch {
      alert('That file could not be read as a Protocol 1000 backup.');
    }
    e.target.value = '';
  };

  const resetStartToday = () => setSetting('startDate', new Date().toISOString().slice(0, 10));

  const doExportCsv = async () => {
    const csv = await buildCsv(preview.proteinTarget);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocol-1000-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doWipe = async () => {
    const sure = window.confirm(
      'Erase ALL Protocol 1000 data on this device? Export a backup first if unsure. This cannot be undone.'
    );
    if (!sure) return;
    await db.days.clear();
    await db.settings.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold leading-tight">Profile &amp; plan</h1>
          <p className="text-[12.5px] text-base-content/45">These values drive every adaptive target.</p>
        </div>
      </div>

      {/* Live derived preview */}
      <section className="animate-fade-up overflow-hidden rounded-box border border-primary/20 bg-base-200">
        <div className="flex items-center gap-2 px-4 pt-3 text-primary">
          <Target size={15} strokeWidth={2.5} />
          <h2 className="font-display text-[14px] font-semibold tracking-wide">Your plan at {draft.startWeightKg} kg</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 pt-3">
          <Mini icon={Flame} label="Calories" value={preview.calorieTarget.toLocaleString()} unit="kcal" color="#FB923C" />
          <Mini icon={Beef} label="Protein" value={preview.proteinTarget} unit="g" color="#FBBF24" />
          <Mini icon={Droplet} label="Water" value={(preview.waterTarget / 1000).toFixed(1)} unit="L" color="#60A5FA" />
        </div>
        <p className="tnum -mt-1 px-4 pb-3 font-mono text-[11.5px] text-base-content/40">
          BMR {preview.bmr} · TDEE {preview.tdee} · {preview.surplusKcal >= 0 ? '+' : ''}
          {preview.surplusKcal} kcal {preview.surplusKcal >= 0 ? 'surplus' : 'deficit'}. Live plan tracks your latest logged weight.
        </p>
      </section>

      {/* Body metrics */}
      <section className="rounded-box border border-white/5 bg-base-200 px-4 py-1 divide-y divide-white/5">
        <Row icon={User} label="Name">
          <input
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Optional"
            className="w-32 rounded-lg bg-base-300 px-2.5 py-1.5 text-right text-[14px] outline-none placeholder:text-base-content/25"
          />
        </Row>
        <Row icon={User} label="Sex" hint="Used for BMR">
          <div className="w-40"><ChipRow options={SEXES} value={draft.sex} onChange={(v) => update({ sex: v })} cols={2} /></div>
        </Row>
        <Row icon={CalendarClock} label="Age">
          <Stepper value={draft.age} min={14} max={90} onChange={(v) => update({ age: v })} />
        </Row>
        <Row icon={Ruler} label="Height" hint={cmToFtIn(draft.heightCm)}>
          <Stepper value={draft.heightCm} min={130} max={220} onChange={(v) => update({ heightCm: v })} format={(v) => `${v}cm`} />
        </Row>
        <Row icon={Scale} label="Start weight" hint="Baseline for the plan">
          <Stepper value={draft.startWeightKg} step={0.5} min={35} max={220} onChange={(v) => update({ startWeightKg: v })} format={(v) => `${v}kg`} />
        </Row>
      </section>

      {/* Goal */}
      <section className="rounded-box border border-white/5 bg-base-200 p-4">
        <div className="mb-2 flex items-center gap-2 text-base-content/60">
          <Target size={15} /><h2 className="text-[13px] font-semibold uppercase tracking-wider">Goal</h2>
        </div>
        <ChipRow options={GOALS} value={draft.goal} onChange={(v) => update({ goal: v })} cols={2} />
      </section>

      {/* Activity */}
      <section className="rounded-box border border-white/5 bg-base-200 p-4">
        <div className="mb-2 flex items-center gap-2 text-base-content/60">
          <Activity size={15} /><h2 className="text-[13px] font-semibold uppercase tracking-wider">Activity level</h2>
        </div>
        <ChipRow options={ACTIVITY_LEVELS} value={draft.activity} onChange={(v) => update({ activity: v })} cols={1} />
      </section>

      {/* Training + targets */}
      <section className="rounded-box border border-white/5 bg-base-200 px-4 py-1 divide-y divide-white/5">
        <Row icon={Beef} label="Protein" hint={`${Math.round(draft.startWeightKg * draft.proteinPerKg)} g/day at start weight`}>
          <Stepper value={draft.proteinPerKg} step={0.1} min={1.2} max={3.0} onChange={(v) => update({ proteinPerKg: v })} format={(v) => `${v.toFixed(1)}g/kg`} />
        </Row>
        <Row icon={Beef} label="Fat" hint="g/kg — hormonal floor">
          <Stepper value={draft.fatPerKg} step={0.1} min={0.5} max={1.5} onChange={(v) => update({ fatPerKg: v })} format={(v) => `${v.toFixed(1)}g/kg`} />
        </Row>
        <Row icon={Dumbbell} label="Training days" hint="Per week">
          <Stepper value={draft.trainingDaysPerWeek} min={1} max={7} onChange={(v) => update({ trainingDaysPerWeek: v })} format={(v) => `${v}/wk`} />
        </Row>
        <Row icon={Footprints} label="Step target">
          <Stepper value={draft.stepTarget} step={500} min={2000} max={25000} onChange={(v) => update({ stepTarget: v })} format={(v) => `${(v / 1000).toFixed(1)}k`} />
        </Row>
        <Row icon={BookOpen} label="Reading target" hint="Minutes/day">
          <Stepper value={draft.readingTarget} step={5} min={5} max={180} onChange={(v) => update({ readingTarget: v })} format={(v) => `${v}m`} />
        </Row>
        <Row icon={MoonStar} label="Sleep target" hint="Hours/night">
          <Stepper value={draft.sleepTargetH} step={0.5} min={4} max={12} onChange={(v) => update({ sleepTargetH: v })} format={(v) => `${v}h`} />
        </Row>
        <Row
          icon={FlameIcon}
          label="Calorie target"
          hint={draft.calorieOverride == null ? `Auto: ${preview.autoCalorieTarget.toLocaleString()} kcal` : 'Manual override'}
        >
          {draft.calorieOverride == null ? (
            <button
              onClick={() => update({ calorieOverride: preview.autoCalorieTarget })}
              className="rounded-btn bg-base-300 px-3 py-1.5 text-[13px] font-medium text-base-content/75 active:scale-95"
            >
              Set manually
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Stepper value={draft.calorieOverride} step={50} min={1200} max={6000} onChange={(v) => update({ calorieOverride: v })} />
              <button
                onClick={() => update({ calorieOverride: null })}
                className="rounded-btn bg-base-300 px-2.5 py-1.5 text-[12.5px] font-medium text-base-content/60 active:scale-95"
              >
                Auto
              </button>
            </div>
          )}
        </Row>
      </section>

      <HabitsManager />

      {/* Data + protocol */}
      <section className="rounded-box border border-white/5 bg-base-200 px-4 py-1 divide-y divide-white/5">
        <Row icon={CalendarClock} label="Protocol start" hint="Day 1 — future dates allowed">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => e.target.value && setSetting('startDate', e.target.value)}
              className="rounded-lg bg-base-300 px-2.5 py-1.5 font-mono text-[13px] outline-none"
              aria-label="Protocol start date"
            />
            <button onClick={resetStartToday} className="rounded-btn bg-base-300 px-2.5 py-1.5 text-[12.5px] font-medium text-base-content/60 active:scale-95">
              Today
            </button>
          </div>
        </Row>
        <Row icon={Download} label="Export data" hint="Download a JSON backup">
          <button onClick={doExport} className="rounded-btn bg-primary/15 px-3 py-1.5 text-[13px] font-semibold text-primary active:scale-95">
            Export
          </button>
        </Row>
        <Row icon={FileSpreadsheet} label="Export CSV" hint="Spreadsheet with computed columns">
          <button onClick={doExportCsv} className="rounded-btn bg-primary/15 px-3 py-1.5 text-[13px] font-semibold text-primary active:scale-95">
            CSV
          </button>
        </Row>
        <Row icon={Upload} label="Import data" hint="Restore from a backup">
          <>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={doImport} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className={`rounded-btn px-3 py-1.5 text-[13px] font-semibold active:scale-95 ${flash ? 'bg-success/20 text-success' : 'bg-base-300 text-base-content/75'}`}
            >
              {flash ? <span className="flex items-center gap-1"><Check size={13} /> Done</span> : 'Import'}
            </button>
          </>
        </Row>
        <Row icon={AlertTriangle} label="Erase all data" hint="Cannot be undone">
          <button onClick={doWipe} className="rounded-btn border border-error/30 bg-error/10 px-3 py-1.5 text-[13px] font-semibold text-error active:scale-95">
            Erase
          </button>
        </Row>
      </section>

      <button
        onClick={() => update(DEFAULT_PROFILE)}
        className="w-full rounded-btn border border-white/5 bg-base-200 py-2.5 text-[13px] font-medium text-base-content/45 active:scale-[0.99]"
      >
        Reset to defaults
      </button>
      <div className="h-1" />
    </div>
  );
}

function Mini({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="rounded-box bg-base-300/50 p-2.5">
      <div className="flex items-center gap-1"><Icon size={13} style={{ color }} strokeWidth={2.5} /><span className="text-[11.5px] uppercase tracking-wide text-base-content/45">{label}</span></div>
      <p className="tnum mt-1 font-mono text-lg font-bold leading-none" style={{ color }}>{value}<span className="text-[12.5px] font-medium text-base-content/40"> {unit}</span></p>
    </div>
  );
}

/* --------------------------- habits manager ----------------------------- */

function HabitsManager() {
  const habits = useLiveQuery(() => getHabits(), []) ?? [];
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('zap');
  const [color, setColor] = useState(HABIT_COLORS[0]);

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed || habits.length >= 8) return;
    await setHabits([...habits, { id: newHabitId(), name: trimmed.slice(0, 24), icon, color }]);
    setName('');
  };

  const remove = async (id) => {
    await setHabits(habits.filter((h) => h.id !== id));
  };

  return (
    <section className="rounded-box border border-white/5 bg-base-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-base-content/60">
          <ListChecks size={15} />
          <h2 className="text-[13px] font-semibold uppercase tracking-wider">Custom habits</h2>
        </div>
        <span className="tnum font-mono text-[12px] text-base-content/40">{habits.length}/8</span>
      </div>

      {habits.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {habits.map((h) => {
            const Icon = habitIcon(h.icon);
            return (
              <li key={h.id} className="flex items-center gap-2.5 rounded-box bg-base-300/50 px-3 py-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ backgroundColor: `${h.color}22`, color: h.color }}>
                  <Icon size={15} strokeWidth={2.4} />
                </span>
                <span className="flex-1 truncate text-[14px] font-medium">{h.name}</span>
                <button onClick={() => remove(h.id)} aria-label={`Delete ${h.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-base-content/35 active:scale-90">
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {habits.length < 8 && (
        <div className="rounded-box border border-white/5 bg-base-300/40 p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name — e.g. No sugar, DSA practice"
            className="w-full rounded-lg bg-base-200 px-3 py-2 text-[14px] outline-none placeholder:text-base-content/30"
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {Object.keys(HABIT_ICONS).map((key) => {
              const Icon = HABIT_ICONS[key];
              const active = icon === key;
              return (
                <button key={key} onClick={() => setIcon(key)} aria-label={`icon ${key}`}
                  className={`grid h-9 w-9 place-items-center rounded-lg border transition-all active:scale-90 ${active ? 'border-primary bg-primary/15 text-primary' : 'border-white/5 bg-base-200 text-base-content/45'}`}>
                  <Icon size={16} strokeWidth={2.3} />
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {HABIT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} aria-label={`colour ${c}`}
                className={`h-7 w-7 rounded-full transition-all active:scale-90 ${color === c ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-base-300' : ''}`}
                style={{ backgroundColor: c }} />
            ))}
            <button onClick={add} disabled={!name.trim()}
              className="ml-auto rounded-btn bg-primary px-4 py-2 text-[13.5px] font-bold text-primary-content transition-opacity active:scale-95 disabled:opacity-30">
              Add habit
            </button>
          </div>
        </div>
      )}
      <p className="mt-2 text-[12px] leading-snug text-base-content/35">
        Habits appear on the Today tab with per-habit streaks. Deleting a definition keeps past check-ins in your data.
      </p>
    </section>
  );
}
