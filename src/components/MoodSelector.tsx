import type { Mood } from '../types';
import { MOOD_EMOJIS, MOOD_COLORS } from '../types';

interface Props {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

const moods: Mood[] = ['peaceful', 'neutral', 'unsettling', 'nightmare'];

export function MoodSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 justify-center">
      {moods.map(mood => (
        <button
          key={mood}
          onClick={() => onSelect(mood)}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all cursor-pointer ${
            selected === mood
              ? 'ring-2 scale-105'
              : 'opacity-60 hover:opacity-90'
          }`}
          style={{
            background: selected === mood ? `${MOOD_COLORS[mood]}20` : 'rgba(30,42,74,0.5)',
            border: selected === mood ? `2px solid ${MOOD_COLORS[mood]}` : '2px solid transparent',
          }}
        >
          <span className="text-2xl">{MOOD_EMOJIS[mood]}</span>
          <span className="text-xs capitalize">{mood}</span>
        </button>
      ))}
    </div>
  );
}
