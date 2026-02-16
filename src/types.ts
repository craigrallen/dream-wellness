export type Mood = 'peaceful' | 'neutral' | 'unsettling' | 'nightmare';

export interface DreamEntry {
  id: string;
  date: string; // ISO string
  transcript: string;
  themes: string[];
  mood: Mood;
  hasAudio: boolean;
}

export const DREAM_THEMES = [
  'water', 'flying', 'falling', 'being chased', 'teeth',
  'house', 'school', 'work', 'family', 'animals',
  'driving', 'death', 'lost', 'naked', 'late',
  'phone', 'money', 'food', 'baby', 'wedding',
  'fire', 'darkness', 'stairs', 'door', 'mirror'
] as const;

export const MOOD_COLORS: Record<Mood, string> = {
  peaceful: '#34d399',
  neutral: '#60a5fa',
  unsettling: '#f59e0b',
  nightmare: '#ef4444',
};

export const MOOD_EMOJIS: Record<Mood, string> = {
  peaceful: '🌙',
  neutral: '😴',
  unsettling: '😰',
  nightmare: '💀',
};
