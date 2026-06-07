import { useState } from 'react';
import type { DreamEntry } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../types';
import { loadEntries, deleteEntry, getAudio } from '../store';

export function Journal() {
  const [entries, setEntries] = useState<DreamEntry[]>(() => loadEntries());
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Delete this dream?')) {
      setEntries(deleteEntry(id));
    }
  };

  const handlePlay = async (id: string) => {
    const blob = await getAudio(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    setPlayingId(id);
    audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); };
    audio.play();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <span className="text-6xl">🌙</span>
        <p>No dreams recorded yet</p>
        <p className="text-sm">Start capturing when you wake up</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h2 className="text-xl font-light text-purple-glow mb-6">Dream Journal</h2>
      {entries.map(entry => (
        <div key={entry.id} className="glass-card p-4 space-y-3 transition-all hover:border-indigo-glow/30">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: MOOD_COLORS[entry.mood] }}
              />
              <span className="text-xs text-slate-400">{formatDate(entry.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span title={entry.mood}>{MOOD_EMOJIS[entry.mood]}</span>
              {entry.hasAudio && (
                <button
                  onClick={() => handlePlay(entry.id)}
                  className="text-xs text-indigo-glow hover:text-purple-glow cursor-pointer"
                >
                  {playingId === entry.id ? '⏹' : '▶️'}
                </button>
              )}
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-xs text-slate-500 hover:text-red-400 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Transcript */}
          <p className="text-sm text-slate-200 leading-relaxed line-clamp-4">
            {entry.transcript}
          </p>

          {/* Themes */}
          {entry.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.themes.map(theme => (
                <span key={theme} className="px-2 py-0.5 rounded-full text-xs bg-indigo-glow/15 text-purple-glow/80">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
