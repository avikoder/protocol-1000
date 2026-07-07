import { useEffect, useState } from 'react';
import { Activity, LayoutGrid, LineChart, Map, CalendarCheck, Settings as SettingsIcon } from 'lucide-react';
import { ensureStartDate, ensureTargets, ensureProfile } from './db/db.js';
import { useProtocolDay } from './hooks/useProtocolDay.js';
import { prettyDate } from './lib/date.js';
import Dashboard from './components/dashboard/Dashboard.jsx';
import Analytics from './components/analytics/Analytics.jsx';
import Roadmap from './components/roadmap/Roadmap.jsx';
import MonthlyReview from './components/review/MonthlyReview.jsx';
import Settings from './components/settings/Settings.jsx';
import BottomNav from './components/BottomNav.jsx';

const TABS = [
  { id: 'today', label: 'Today', icon: LayoutGrid },
  { id: 'insights', label: 'Insights', icon: LineChart },
  { id: 'months', label: 'Months', icon: CalendarCheck },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const protocol = useProtocolDay();

  // First-launch seeding: start date, profile + default targets. Idempotent.
  useEffect(() => {
    ensureStartDate();
    ensureProfile();
    ensureTargets();
  }, []);

  if (!protocol.ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-base-100">
        <div className="flex items-center gap-2 text-base-content/50">
          <Activity className="animate-pulse text-primary" size={22} />
          <span className="font-mono text-base">Loading protocol…</span>
        </div>
      </div>
    );
  }

  const settingsOpen = tab === 'settings';

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-base-100">
      {/* Header */}
      <header className="pt-safe sticky top-0 z-20 border-b border-white/5 bg-base-100/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/15 text-primary">
              <Activity size={19} strokeWidth={2.6} />
            </span>
            <div className="leading-tight">
              <p className="bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text font-display text-[15px] font-bold tracking-wide text-transparent">
                PROTOCOL 1000
              </p>
              <p className="font-mono text-[12px] text-base-content/40">
                {prettyDate(protocol.todayKey)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-mono text-[12px] font-semibold tracking-wider text-primary">
                {protocol.phase.codename}
              </p>
              <p className="font-mono text-[12px] text-base-content/40">Phase {protocol.phase.id}/4</p>
            </div>
            <button
              onClick={() => setTab(settingsOpen ? 'today' : 'settings')}
              aria-label="Profile and settings"
              className={`grid h-9 w-9 place-items-center rounded-xl transition-colors active:scale-90 ${
                settingsOpen ? 'bg-primary/20 text-primary' : 'bg-base-300 text-base-content/60'
              }`}
            >
              <SettingsIcon size={18} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </header>

      {/* Active view */}
      <main className="pb-nav px-4 pt-4">
        {tab === 'today' && <Dashboard protocol={protocol} onOpenSettings={() => setTab('settings')} />}
        {tab === 'insights' && <Analytics protocol={protocol} />}
        {tab === 'months' && <MonthlyReview protocol={protocol} />}
        {tab === 'roadmap' && <Roadmap protocol={protocol} />}
        {tab === 'settings' && <Settings onClose={() => setTab('today')} />}
      </main>

      {!settingsOpen && <BottomNav tabs={TABS} active={tab} onChange={setTab} />}
    </div>
  );
}
