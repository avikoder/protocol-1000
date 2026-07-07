import { useId } from 'react';

/**
 * Circular progress ring. Progress is 0..1. Renders a faint track plus a
 * gradient arc; the arc is the app's signature visual (phase completion).
 */
export default function Ring({
  progress = 0,
  size = 220,
  stroke = 14,
  color = '#2DD4BF',
  gradientTo = '#34D399',
  track = 'rgba(255,255,255,0.06)',
  children,
}) {
  const gid = useId();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)',
            filter: `drop-shadow(0 0 10px ${color}66)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
