import { useEffect, useRef, useState } from 'react';
import { X, Play, Check } from 'lucide-react';
import Ring from '../ui/Ring.jsx';

const ACCENT = '#FB7185';
const DURATIONS = [2, 5, 10]; // minutes

/**
 * Minimal meditation timer. Pick a duration → countdown ring → completing the
 * session marks mindfulness done for the day. Closing early does not.
 */
export default function MeditationTimer({ open, onClose, onComplete }) {
  const [phase, setPhase] = useState('pick'); // pick | run | done
  const [total, setTotal] = useState(0); // seconds
  const [left, setLeft] = useState(0);
  const timer = useRef(null);

  // Reset whenever the modal opens.
  useEffect(() => {
    if (open) {
      setPhase('pick');
      setLeft(0);
      setTotal(0);
    }
    return () => clearInterval(timer.current);
  }, [open]);

  const start = (mins) => {
    const secs = mins * 60;
    setTotal(secs);
    setLeft(secs);
    setPhase('run');
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(timer.current);
          setPhase('done');
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stop = () => {
    clearInterval(timer.current);
    onClose();
  };

  if (!open) return null;

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const progress = total > 0 ? 1 - left / total : 0;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-6 backdrop-blur-sm" role="dialog" aria-label="Meditation timer">
      <div className="w-full max-w-xs rounded-box border border-white/10 bg-base-200 p-5 animate-fade-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[16px] font-bold">Mindfulness</h2>
          <button onClick={stop} className="grid h-8 w-8 place-items-center rounded-lg bg-base-300 text-base-content/60 active:scale-90" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {phase === 'pick' && (
          <>
            <p className="mb-3 text-[13.5px] text-base-content/55">
              Sit comfortably. Breathe through the nose. When the mind wanders, return to the breath.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => start(m)}
                  className="rounded-btn border border-white/5 bg-base-300/60 py-3 text-center transition-all active:scale-95"
                >
                  <span className="tnum block font-mono text-xl font-bold" style={{ color: ACCENT }}>{m}</span>
                  <span className="text-[11.5px] text-base-content/45">min</span>
                </button>
              ))}
            </div>
          </>
        )}

        {phase !== 'pick' && (
          <div className="flex flex-col items-center py-2">
            <Ring progress={phase === 'done' ? 1 : progress} size={180} stroke={10} color={ACCENT} gradientTo="#F472B6">
              <div className="text-center">
                {phase === 'done' ? (
                  <>
                    <Check size={34} className="mx-auto" style={{ color: ACCENT }} strokeWidth={2.6} />
                    <p className="mt-1 text-[13px] font-semibold" style={{ color: ACCENT }}>Session complete</p>
                  </>
                ) : (
                  <p className="tnum font-mono text-4xl font-bold tracking-tight">{mm}:{ss}</p>
                )}
              </div>
            </Ring>
            {phase === 'run' && (
              <button onClick={stop} className="mt-4 rounded-btn bg-base-300 px-4 py-2 text-[13px] font-medium text-base-content/60 active:scale-95">
                End early
              </button>
            )}
            {phase === 'done' && (
              <button onClick={onClose} className="mt-4 flex items-center gap-1.5 rounded-btn px-4 py-2 text-[13.5px] font-bold active:scale-95" style={{ backgroundColor: `${ACCENT}22`, color: ACCENT }}>
                <Play size={14} /> Marked done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
