import { CIRCUIT_LAYOUTS } from '@/lib/circuitLayouts';

interface Props {
  name: string;
  state?: 'idle' | 'correct' | 'wrong' | 'faded';
  showLabel?: boolean;
  className?: string;
}

export function CircuitSilhouette({ name, state = 'idle', showLabel = false, className = '' }: Props) {
  const layout = CIRCUIT_LAYOUTS[name];

  const strokeColor =
    state === 'correct' ? '#22c55e' :
    state === 'wrong'   ? '#ef4444' :
    '#ffffff';

  const opacity = state === 'faded' ? 0.3 : 1;

  if (!layout) {
    // Fallback for unmapped circuits — show a placeholder oval
    return (
      <div className={`flex flex-col items-center justify-center gap-1 ${className}`} style={{ opacity }}>
        <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
          <ellipse cx="100" cy="75" rx="80" ry="50" stroke={strokeColor} strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showLabel && <span className="text-[10px] font-bold" style={{ color: strokeColor }}>{name}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`} style={{ opacity }}>
      <svg
        viewBox={layout.viewBox}
        className="w-full h-full"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        <path
          d={layout.d}
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: state === 'correct'
              ? 'drop-shadow(0 0 6px rgba(34,197,94,0.6))'
              : state === 'wrong'
              ? 'drop-shadow(0 0 4px rgba(239,68,68,0.4))'
              : undefined,
            transition: 'stroke 0.2s, filter 0.2s',
          }}
        />
      </svg>
      {showLabel && (
        <span className="text-[10px] font-bold leading-tight text-center" style={{ color: strokeColor }}>
          {name}
        </span>
      )}
    </div>
  );
}
