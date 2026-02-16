import type { DreamEntry } from './types';
import { DREAM_THEMES } from './types';

const STORAGE_KEY = 'dream-wellness-entries';
const DB_NAME = 'dream-wellness-audio';
const DB_VERSION = 1;
const STORE_NAME = 'audio';

// localStorage for entries
export function loadEntries(): DreamEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveEntries(entries: DreamEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(entry: DreamEntry) {
  const entries = loadEntries();
  entries.unshift(entry);
  saveEntries(entries);
  return entries;
}

export function deleteEntry(id: string) {
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
  deleteAudio(id);
  return entries;
}

export function updateEntry(id: string, updates: Partial<DreamEntry>) {
  const entries = loadEntries();
  const idx = entries.findIndex(e => e.id === id);
  if (idx >= 0) entries[idx] = { ...entries[idx], ...updates };
  saveEntries(entries);
  return entries;
}

// IndexedDB for audio
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE_NAME); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAudio(id: string, blob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAudio(id: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudio(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
}

// Theme extraction
export function extractThemes(text: string): string[] {
  const lower = text.toLowerCase();
  return DREAM_THEMES.filter(theme => {
    const words = theme.split(' ');
    return words.every(w => lower.includes(w));
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
