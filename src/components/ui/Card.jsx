/** Elevated surface used across pillars and charts. `accent` is a hex used
 *  for the title glyph so each pillar keeps its identity. Pass `edge` to draw
 *  a subtle accent bar down the left, tying the card to its pillar colour. */
export default function Card({ icon: Icon, title, accent = '#2DD4BF', edge = false, right, children, className = '', padding = 'p-4' }) {
  return (
    <section
      className={`relative overflow-hidden rounded-box bg-base-200 border border-white/5 ${padding} shadow-sm animate-fade-up ${className}`}
    >
      {edge && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}22)` }}
        />
      )}
      {(title || right) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                <Icon size={17} strokeWidth={2.4} />
              </span>
            )}
            {title && (
              <h2 className="font-display text-[15px] font-semibold tracking-wide text-base-content/90">
                {title}
              </h2>
            )}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
