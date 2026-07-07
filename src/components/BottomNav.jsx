/** Fixed bottom navigation, iOS home-indicator aware. */
export default function BottomNav({ tabs, active, onChange }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/5 bg-base-200/90 backdrop-blur-lg">
      <ul className="flex items-stretch justify-around px-2 pt-1.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className="group relative flex w-full flex-col items-center gap-1 py-2 outline-none"
              >
                <span
                  className={`absolute -top-[7px] h-1 w-8 rounded-full transition-all ${
                    isActive ? 'bg-primary opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.6 : 2}
                  className={`transition-colors ${
                    isActive ? 'text-primary' : 'text-base-content/45 group-active:text-base-content/70'
                  }`}
                />
                <span
                  className={`text-[11.5px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-primary' : 'text-base-content/45'
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
