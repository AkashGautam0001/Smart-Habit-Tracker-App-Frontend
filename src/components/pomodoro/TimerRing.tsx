import { motion } from 'framer-motion';
import type { PomodoroPhase } from '../../config/pomodoro.config';
import { PHASE_COLORS } from '../../config/pomodoro.config';

interface Props {
  progress: number;   // 0 to 1
  phase: PomodoroPhase;
  size?: number;
  timeDisplay: string;
}

export default function TimerRing({ progress, phase, size = 220, timeDisplay }: Props) {
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  const color = PHASE_COLORS[phase];

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-surface-hover)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>

      {/* Centre text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0,
      }}>
        <span style={{
          color: 'var(--color-text)',
          fontFamily: 'var(--font-mono)',
          fontSize: size >= 200 ? '2.8rem' : '2rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {timeDisplay}
        </span>
      </div>
    </div>
  );
}
