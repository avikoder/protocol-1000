import { useState } from 'react';
import { ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';
import Ring from '../ui/Ring.jsx';
import { shortDate } from '../../lib/date.js';

/**
 * Hero block: the day counter inside the phase-progress ring, plus date
 * navigation so any past day can be backfilled (streak insurance).
 */
export default function DayHeader({
  dayNumber,
  phase,
  phasePct,
  selectedKey,
  isToday,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onToday,
  onJump,
}) {
  const daysLeftInPhase = phase.end - dayNumber;
  const [jumping, setJumping] = useState(false);
  const [jumpVal, setJumpVal] = useState('');

  const commitJump = () => {
    const n = parseInt(jumpVal, 10);
    setJumping(false);
    setJumpVal('');
    if (n >= 1 && n <= 1000) onJump?.(n);
  };

  return (
    <div className="flex flex-col items-center pb-1 pt-1">
      {/* Date navigator */}
      <div className="mb-2 flex w-full items-center justify-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous day"
          className="grid h-9 w-9 place-items-center rounded-xl bg-base-200 text-base-content/60 transition-opacity active:scale-90 disabled:opacity-25"
        >
          <ChevronLeft size={19} />
        </button>
        {jumping ? (
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            min="1"
            max="1000"
            value={jumpVal}
            placeholder="Day #"
            onChange={(e) => setJumpVal(e.target.value)}
            onBlur={commitJump}
            onKeyDown={(e) => e.key === 'Enter' && commitJump()}
            className="tnum min-w-[10rem] rounded-xl bg-base-200 px-3 py-2.5 text-center font-mono text-[14px] font-semibold outline-none ring-1 ring-primary/50 placeholder:text-base-content/30"
            aria-label="Jump to day number"
          />
        ) : (
          <button
            onClick={() => setJumping(true)}
            className="min-w-[10rem] rounded-xl bg-base-200 px-3 py-1.5 text-center active:scale-[0.98]"
            aria-label="Tap to jump to a day"
          >
            <p className="tnum font-mono text-[13px] font-semibold">
              {isToday ? 'Today' : shortDate(selectedKey)}
            </p>
            <p className="tnum font-mono text-[11px] text-base-content/40">Day {dayNumber} · tap to jump</p>
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next day"
          className="grid h-9 w-9 place-items-center rounded-xl bg-base-200 text-base-content/60 transition-opacity active:scale-90 disabled:opacity-25"
        >
          <ChevronRight size={19} />
        </button>
      </div>

      <Ring progress={phasePct} size={216} stroke={13} color="#2DD4BF" gradientTo="#34D399">
        <div className="text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-base-content/40">Day</p>
          <p className="tnum font-display text-6xl font-bold leading-none tracking-tight">
            {dayNumber}
          </p>
          <p className="tnum mt-1 font-mono text-xs text-base-content/40">of 1000</p>
        </div>
      </Ring>

      <div className="mt-3 text-center">
        <p className="font-display text-base font-semibold">{phase.name}</p>
        <p className="tnum mt-0.5 font-mono text-[12px] text-base-content/45">
          {Math.round(phasePct * 100)}% of phase · {daysLeftInPhase} days to next
        </p>
      </div>

      {!isToday && (
        <button
          onClick={onToday}
          className="mt-2 flex items-center gap-1.5 rounded-badge bg-primary/15 px-3 py-1.5 text-[12.5px] font-semibold text-primary active:scale-95"
        >
          <Undo2 size={13} /> Back to today — you're editing a past day
        </button>
      )}
    </div>
  );
}
