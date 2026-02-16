import { useState, useEffect, useMemo } from 'react';
import type { DreamEntry, Mood } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../types';
import { loadEntries } from '../store';

export function Dashboard() {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  useEffect(() => { setEntries(loadEntries()); }, []);

  const themeFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    entries.forEach(e => e.themes.forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const moodDistribution = useMemo(() => {
    const dist: Record<Mood, number> = { peaceful: 0, neutral: 0, unsettling: 0, nightmare: 0 };
    entries.forEach(e => dist[e.mood]++);
    return dist;
  }, [entries]);

  const totalMoods = Object.values(moodDistribution).reduce((a, b) => a + b, 0);

  // Calendar data - last 30 days
  const calendarData = useMemo(() => {
    const days: { date: string; mood: Mood | null }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date.split('T')[0] === dateStr);
      days.push({
        date: dateStr,
        mood: dayEntries.length ? dayEntries[0].mood : null,
      });
    }
    return days;
  }, [entries]);

  // Insights
  const insights = useMemo(() => {
    if (entries.length < 3) return [];
    const result: string[] = [];

    // Theme-day correlations
    const themeDays: Record<string, Record<string, number>> = {};
    entries.forEach(e => {
      const day = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' });
      e.themes.forEach(t => {
        if (!themeDays[t]) themeDays[t] = {};
        themeDays[t][day] = (themeDays[t][day] || 0) + 1;
      });
    });

    Object.entries(themeDays).forEach(([theme, days]) => {
      const maxDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0];
      if (maxDay[1] >= 2) {
        result.push(`You dream about "${theme}" most on ${maxDay[0]}s`);
      }
    });

    // Most common mood
    const topMood = (Object.entries(moodDistribution) as [Mood, number][])
      .sort((a, b) => b[1] - a[1])[0];
    if (topMood[1] > 0) {
      result.push(`Your most common dream mood is ${topMood[0]} ${MOOD_EMOJIS[topMood[0]]}`);
    }

    // Average dreams per week
    if (entries.length >= 7) {
      const firstDate = new Date(entries[entries.length - 1].date);
      const weeks = Math.max(1, (Date.now() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const perWeek = (entries.length / weeks).toFixed(1);
      result.push(`You record about ${perWeek} dreams per week`);
    }

    return result;
  }, [entries, moodDistribution]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <span className="text-6xl">📊</span>
        <p>Record some dreams to see patterns</p>
      </div>
    );
  }

  const maxThemeCount = themeFrequency.length > 0 ? themeFrequency[0][1] : 1;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-light text-purple-glow">Dream Patterns</h2>

      {/* Theme Frequency */}
      {themeFrequency.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider">Recurring Themes</h3>
          <div className="space-y-2">
            {themeFrequency.slice(0, 8).map(([theme, count]) => (
              <div key={theme} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-24 text-right">{theme}</span>
                <div className="flex-1 h-5 bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxThemeCount) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm text-slate-400 uppercase tracking-wider">Mood Distribution</h3>
        <div className="flex items-center justify-center gap-1 h-8">
          {(Object.entries(moodDistribution) as [Mood, number][]).map(([mood, count]) => {
            if (count === 0) return null;
            const pct = (count / totalMoods) * 100;
            return (
              <div
                key={mood}
                className="h-full rounded-full transition-all duration-700 relative group"
                style={{
                  width: `${pct}%`,
                  background: MOOD_COLORS[mood],
                  minWidth: count > 0 ? '20px' : '0',
                }}
                title={`${mood}: ${count}`}
              />
            );
          })}
        </div>
        <div className="flex justify-center gap-4 text-xs">
          {(Object.entries(moodDistribution) as [Mood, number][]).map(([mood, count]) => (
            count > 0 && (
              <span key={mood} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: MOOD_COLORS[mood] }} />
                {mood} ({count})
              </span>
            )
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm text-slate-400 uppercase tracking-wider">Last 30 Days</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-slate-500">{d}</div>
          ))}
          {/* Offset for starting day */}
          {Array.from({ length: new Date(calendarData[0]?.date).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {calendarData.map(({ date, mood }) => (
            <div
              key={date}
              className="aspect-square rounded-md flex items-center justify-center text-xs transition-all"
              style={{
                background: mood ? `${MOOD_COLORS[mood]}30` : 'rgba(30,42,74,0.3)',
                border: mood ? `1px solid ${MOOD_COLORS[mood]}50` : '1px solid transparent',
              }}
              title={`${date}${mood ? ` - ${mood}` : ''}`}
            >
              {new Date(date).getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider">✨ Insights</h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <p key={i} className="text-sm text-slate-200 flex items-start gap-2">
                <span className="text-indigo-glow">•</span>
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
