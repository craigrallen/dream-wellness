export function MoonPhase({ size = 40 }: { size?: number }) {
  // Simple moon phase calculation
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simplified moon phase (0-29.5 day cycle)
  const c = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5;
  const phase = ((c - 2451549.5) / 29.53059) % 1;
  const normalizedPhase = phase < 0 ? phase + 1 : phase;
  
  // Map phase to emoji
  const moons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const idx = Math.round(normalizedPhase * 8) % 8;
  
  return (
    <span style={{ fontSize: size }} className="select-none" title={`Moon phase: ${Math.round(normalizedPhase * 100)}%`}>
      {moons[idx]}
    </span>
  );
}
