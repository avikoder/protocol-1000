import { Beef, Droplet, Egg, Minus, Plus, GlassWater } from 'lucide-react';
import Card from '../ui/Card.jsx';

const ACCENT = '#FBBF24';
const WATER_STEP = 250; // ml per tap

// Quick protein sources tuned to the user's diet (chicken, eggs, whole foods).
const PROTEIN_CHIPS = [
  { label: 'Chicken', grams: 40, icon: Beef },
  { label: '2 Eggs', grams: 12, icon: Egg },
  { label: 'Shake', grams: 25, icon: GlassWater },
];

export default function NutritionCard({ day, targets, save }) {
  const protein = day?.protein ?? 0;
  const carbs = day?.carbs ?? null;
  const fat = day?.fat ?? null;
  const water = day?.water ?? 0;
  const kcal = !protein && carbs == null && fat == null
    ? null
    : 4 * protein + 4 * (carbs ?? 0) + 9 * (fat ?? 0);
  const kcalPct = kcal != null ? Math.min(100, Math.round((kcal / targets.calorieTarget) * 100)) : 0;
  const proteinPct = Math.min(100, Math.round((protein / targets.proteinTarget) * 100));
  const cups = Math.round(targets.waterTarget / WATER_STEP);
  const filled = Math.min(cups, Math.round(water / WATER_STEP));

  const addProtein = (g) => save({ protein: Math.max(0, protein + g) });
  const addWater = (ml) => save({ water: Math.max(0, water + ml) });

  return (
    <Card icon={Beef} title="Nutrition" accent={ACCENT} edge>
      {/* Protein */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12.5px] font-medium uppercase tracking-wider text-base-content/40">
            Protein
          </p>
          <p className="tnum font-mono text-2xl font-bold leading-tight" style={{ color: ACCENT }}>
            {protein}
            <span className="text-sm font-medium text-base-content/40"> / {targets.proteinTarget} g</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addProtein(-10)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
            aria-label="Subtract 10 g protein"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => addProtein(10)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
            aria-label="Add 10 g protein"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-base-300">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${proteinPct}%`, backgroundColor: ACCENT }}
        />
      </div>

      {/* Protein shortfall microcopy (from 1000-Day-OS) */}
      <p className="tnum mt-1 text-right font-mono text-[11.5px]" style={{ color: protein >= targets.proteinTarget ? ACCENT : 'rgba(230,233,238,0.4)' }}>
        {protein >= targets.proteinTarget ? '✓ target hit' : `${targets.proteinTarget - protein} g to go`}
      </p>

      <div className="mt-1.5 flex gap-1.5">
        {PROTEIN_CHIPS.map(({ label, grams, icon: Icon }) => (
          <button
            key={label}
            onClick={() => addProtein(grams)}
            className="flex flex-1 items-center justify-center gap-1 rounded-btn border border-white/5 bg-base-300/60 py-1.5 text-xs font-medium text-base-content/70 active:scale-95"
          >
            <Icon size={13} style={{ color: ACCENT }} /> +{grams}
          </button>
        ))}
      </div>

      {/* Full macros (optional) → auto-calories, 4P + 4C + 9F */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <MacroInput label="Carbs" value={carbs} target={targets.carbTarget} onChange={(v) => save({ carbs: v })} />
        <MacroInput label="Fat" value={fat} target={targets.fatTarget} onChange={(v) => save({ fat: v })} />
      </div>
      <div className="mt-2 rounded-box bg-base-300/50 px-3 py-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] uppercase tracking-wide text-base-content/45">
            Calories <span className="normal-case text-base-content/30">(4P+4C+9F)</span>
          </span>
          <span className="tnum font-mono text-[14px] font-bold" style={{ color: kcal != null ? '#FB923C' : 'rgba(230,233,238,0.3)' }}>
            {kcal != null ? kcal.toLocaleString() : '—'}
            <span className="text-[11.5px] font-medium text-base-content/40"> / {targets.calorieTarget.toLocaleString()}</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-base-100/60">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${kcalPct}%`, backgroundColor: '#FB923C' }}
          />
        </div>
      </div>

      {/* Water */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplet size={16} className="text-accent" />
          <div>
            <p className="tnum font-mono text-lg font-semibold leading-none text-accent">
              {(water / 1000).toFixed(2)} L
            </p>
            <p className="text-[12.5px] text-base-content/40">
              of {(targets.waterTarget / 1000).toFixed(1)} L
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addWater(-WATER_STEP)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/70 active:scale-90"
            aria-label="Remove 250 ml water"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => addWater(WATER_STEP)}
            className="flex h-8 items-center gap-1 rounded-lg bg-accent/15 px-2.5 text-sm font-semibold text-accent active:scale-90"
          >
            <Plus size={14} /> 250 ml
          </button>
        </div>
      </div>

      {/* Cup dots */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {Array.from({ length: cups }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-colors ${
              i < filled ? 'bg-accent' : 'bg-base-300'
            }`}
            style={{ minWidth: 8 }}
          />
        ))}
      </div>
    </Card>
  );
}

/** Small numeric macro input with target hint. Empty = not tracked today. */
function MacroInput({ label, value, target, onChange }) {
  return (
    <label className="rounded-box border border-white/5 bg-base-300/40 px-3 py-2">
      <span className="flex items-baseline justify-between">
        <span className="text-[11.5px] uppercase tracking-wide text-base-content/45">{label}</span>
        <span className="tnum font-mono text-[10.5px] text-base-content/30">tgt {target}g</span>
      </span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value ?? ''}
        placeholder="—"
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : Math.max(0, Math.round(Number(v))));
        }}
        className="tnum mt-0.5 w-full bg-transparent font-mono text-[16px] font-bold outline-none placeholder:text-base-content/25"
      />
    </label>
  );
}
