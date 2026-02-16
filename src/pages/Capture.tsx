import { useState, useCallback } from 'react';
import { RecordButton } from '../components/RecordButton';
import { Waveform } from '../components/Waveform';
import { MoodSelector } from '../components/MoodSelector';
import { MoonPhase } from '../components/MoonPhase';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { Mood, DreamEntry } from '../types';
import { extractThemes, generateId, addEntry, saveAudio } from '../store';

interface Props {
  onSaved: () => void;
}

export function Capture({ onSaved }: Props) {
  const { isRecording, audioBlob, analyser, start: startRecording, stop: stopRecording } = useAudioRecorder();
  const { transcript, supported, start: startSpeech, stop: stopSpeech, setTranscript } = useSpeechRecognition();
  const [mood, setMood] = useState<Mood | null>(null);
  const [saved, setSaved] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
      stopSpeech();
    } else {
      setSaved(false);
      startRecording();
      if (supported) startSpeech();
    }
  }, [isRecording, startRecording, stopRecording, startSpeech, stopSpeech, supported]);

  const handleSave = useCallback(async () => {
    if (!transcript.trim() || !mood) return;
    const id = generateId();
    const entry: DreamEntry = {
      id,
      date: new Date().toISOString(),
      transcript: transcript.trim(),
      themes: extractThemes(transcript),
      mood,
      hasAudio: !!audioBlob,
    };
    addEntry(entry);
    if (audioBlob) await saveAudio(id, audioBlob);
    setSaved(true);
    setTimeout(() => onSaved(), 800);
  }, [transcript, mood, audioBlob, onSaved]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <MoonPhase size={48} />
        <h1 className="text-2xl font-light text-purple-glow">{greeting}</h1>
        <p className="text-sm text-slate-400">
          {isRecording ? 'Listening to your dream...' : 'Tap to record your dream'}
        </p>
      </div>

      {/* Record Button */}
      <RecordButton isRecording={isRecording} onClick={toggleRecording} />

      {/* Waveform */}
      <Waveform analyser={analyser} />

      {/* Transcript */}
      {transcript && (
        <div className="glass-card p-4 w-full max-w-md space-y-3 animate-[fadeIn_0.5s_ease]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Transcript</span>
            <button
              onClick={() => setEditingTranscript(!editingTranscript)}
              className="text-xs text-indigo-glow hover:underline cursor-pointer"
            >
              {editingTranscript ? 'Done' : 'Edit'}
            </button>
          </div>
          {editingTranscript ? (
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-navy-800 rounded-lg p-3 text-sm text-slate-200 resize-none min-h-[80px] border border-indigo-glow/20 focus:outline-none focus:border-indigo-glow/50"
            />
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">{transcript}</p>
          )}

          {/* Detected themes */}
          {extractThemes(transcript).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {extractThemes(transcript).map(theme => (
                <span key={theme} className="px-2 py-1 rounded-full text-xs bg-indigo-glow/20 text-purple-glow border border-indigo-glow/30">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mood + Save */}
      {transcript && !isRecording && (
        <div className="w-full max-w-md space-y-4 animate-[fadeIn_0.5s_ease]">
          <p className="text-center text-sm text-slate-400">How did this dream feel?</p>
          <MoodSelector selected={mood} onSelect={setMood} />
          <button
            onClick={handleSave}
            disabled={!mood || saved}
            className={`w-full py-3 rounded-xl font-medium transition-all cursor-pointer ${
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : mood
                ? 'bg-indigo-glow/80 hover:bg-indigo-glow text-white'
                : 'bg-navy-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {saved ? '✓ Dream Saved' : 'Save Dream'}
          </button>
        </div>
      )}

      {!supported && (
        <p className="text-xs text-amber-400/60">Speech recognition not supported — type your dream instead</p>
      )}
    </div>
  );
}
