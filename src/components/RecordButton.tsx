interface Props {
  isRecording: boolean;
  onClick: () => void;
}

export function RecordButton({ isRecording, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`record-btn ${isRecording ? 'recording' : ''} w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95`}
      style={{
        background: isRecording
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      }}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <div className="w-10 h-10 bg-white rounded-sm" />
      ) : (
        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      )}
    </button>
  );
}
