import { ActiveTab, AppViewMode } from '../types';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  viewMode: AppViewMode;
  onSelectViewMode: (mode: AppViewMode) => void;
}

export function TopNav({
  activeTab,
  onSelectTab,
  viewMode,
  onSelectViewMode,
}: TopNavProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('transit');
        }}
        className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-indigo-400 transition"
      >
        T-PAY
      </a>

      {/* Zone 2: 4-5 single-line clean text links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('transit')}
          className={`hover:text-white transition whitespace-nowrap shrink-0 ${
            activeTab === 'transit' ? 'text-white font-semibold underline underline-offset-4 decoration-indigo-500' : ''
          }`}
        >
          Transit
        </button>
        <button
          onClick={() => onSelectTab('carrier')}
          className={`hover:text-white transition whitespace-nowrap shrink-0 ${
            activeTab === 'carrier' ? 'text-white font-semibold underline underline-offset-4 decoration-amber-500' : ''
          }`}
        >
          Carrier Billing
        </button>
        <button
          onClick={() => onSelectTab('routes')}
          className={`hover:text-white transition whitespace-nowrap shrink-0 ${
            activeTab === 'routes' ? 'text-white font-semibold underline underline-offset-4 decoration-indigo-500' : ''
          }`}
        >
          Routes
        </button>
        <button
          onClick={() => onSelectTab('conductor')}
          className={`hover:text-white transition whitespace-nowrap shrink-0 ${
            activeTab === 'conductor' ? 'text-white font-semibold underline underline-offset-4 decoration-emerald-500' : ''
          }`}
        >
          Conductor POS
        </button>
        <button
          onClick={() => onSelectTab('pitch')}
          className={`hover:text-white transition whitespace-nowrap shrink-0 ${
            activeTab === 'pitch' ? 'text-white font-semibold underline underline-offset-4 decoration-amber-400' : ''
          }`}
        >
          Hackathon Deck
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            if (activeTab === 'pitch') {
              onSelectTab('transit');
            } else {
              onSelectTab('pitch');
            }
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-md shadow-amber-400/20 whitespace-nowrap shrink-0"
        >
          {activeTab === 'pitch' ? 'Exit Pitch Deck' : 'Judge Demo Deck'}
        </button>
      </div>
    </header>
  );
}
