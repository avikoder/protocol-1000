import { HeartPulse, Activity } from 'lucide-react';
import Card from '../ui/Card.jsx';

/** Compact numeric biomarker card (half width). Empty = not measured today. */
function BioNumberCard({ icon, title, accent, unit, value, hint, onChange }) {
  const Icon = icon;
  return (
    <Card icon={Icon} title={title} accent={accent} edge padding="p-3.5">
      <div className="flex items-baseline gap-1">
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
          className="tnum w-20 bg-transparent font-mono text-2xl font-bold leading-none outline-none placeholder:text-base-content/25"
          style={{ color: value != null ? accent : undefined }}
        />
        <span className="font-mono text-[13px] text-base-content/40">{unit}</span>
      </div>
      <p className="mt-2.5 text-[12px] leading-snug text-base-content/35">{hint}</p>
    </Card>
  );
}

export function RhrCard({ day, save }) {
  return (
    <BioNumberCard
      icon={HeartPulse}
      title="Resting HR"
      accent="#FB7185"
      unit="bpm"
      value={day?.rhr ?? null}
      hint="On waking, before standing. Falling = fitter."
      onChange={(v) => save({ rhr: v })}
    />
  );
}

export function HrvCard({ day, save }) {
  return (
    <BioNumberCard
      icon={Activity}
      title="HRV"
      accent="#60A5FA"
      unit="ms"
      value={day?.hrv ?? null}
      hint="From your watch/band. Trend beats any single day."
      onChange={(v) => save({ hrv: v })}
    />
  );
}
