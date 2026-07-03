import { motion } from 'framer-motion';
import type { PomodoroPhase } from '../../config/pomodoro.config';
import { PHASE_COLORS } from '../../config/pomodoro.config';
import { cn } from '@/lib/utils';

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
    <div
      className="relative shrink-0 w-(--ring-size) h-(--ring-size)"
      style={{ '--ring-size': `${size}px` } as React.CSSProperties}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className="stroke-muted"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
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

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono font-bold tabular-nums tracking-tight text-foreground',
            size >= 200 ? 'text-[2.8rem]' : 'text-[2rem]',
          )}
        >
          {timeDisplay}
        </span>
      </div>
    </div>
  );
}
