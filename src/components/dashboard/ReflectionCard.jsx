import { useEffect, useRef, useState } from 'react';
import { PenLine } from 'lucide-react';
import Card from '../ui/Card.jsx';

/** Optional daily reflection. Autosaves ~500 ms after the user stops typing. */
export default function ReflectionCard({ day, save }) {
  const stored = day?.reflection ?? '';
  const [text, setText] = useState(stored);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);

  // Resync when the day rolls over.
  useEffect(() => {
    setText(stored);
  }, [day?.date]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (value) => {
    setText(value);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save({ reflection: value });
      setSaved(true);
    }, 500);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Card
      icon={PenLine}
      title="Daily reflection"
      accent="#94A3B8"
      right={
        saved ? (
          <span className="text-[11.5px] font-medium text-success/80">Saved</span>
        ) : (
          <span className="text-[11.5px] text-base-content/30">Optional</span>
        )
      }
    >
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="One honest line about today — a win, a friction point, a note to future you."
        className="w-full resize-none rounded-box bg-base-300/60 p-3 text-sm leading-relaxed outline-none ring-primary/40 placeholder:text-base-content/30 focus:ring-1"
      />
    </Card>
  );
}
