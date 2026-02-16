import { useState } from 'react';
import { Capture } from './pages/Capture';
import { Journal } from './pages/Journal';
import { Dashboard } from './pages/Dashboard';

type Page = 'capture' | 'journal' | 'dashboard';

const navItems: { page: Page; icon: string; label: string }[] = [
  { page: 'capture', icon: '🎙️', label: 'Record' },
  { page: 'journal', icon: '📖', label: 'Journal' },
  { page: 'dashboard', icon: '✨', label: 'Patterns' },
];

export default function App() {
  const [page, setPage] = useState<Page>('capture');

  return (
    <div className="relative min-h-screen pb-20">
      <div className="stars-bg" />

      <div className="relative z-10">
        {page === 'capture' && <Capture onSaved={() => setPage('journal')} />}
        {page === 'journal' && <Journal />}
        {page === 'dashboard' && <Dashboard />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 glass-card rounded-none border-x-0 border-b-0">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map(({ page: p, icon, label }) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                page === p ? 'text-purple-glow' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
