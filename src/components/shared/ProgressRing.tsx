import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  pct: number;
  size?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  strokeWidth?: number;
}

export default function ProgressRing({
  pct,
  size = 160,
  color = 'var(--primary)',
  trackColor = 'var(--secondary)',
  label,
  sublabel,
  strokeWidth = 7,
}: Props) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(pct, 100) / 100);

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const display = useTransform(rounded, (v: number) => `${v}%`);

  useEffect(() => {
    const controls = animate(count, pct, { duration: 1.1, ease: 'easeOut', delay: 0.1 });
    return controls.stop;
  }, [pct, count]);

  const glowColor =
    color === 'var(--primary)'
      ? 'color-mix(in srgb, var(--primary) 50%, transparent)'
      : `${color}60`;

  return (
    <div
      className="relative shrink-0 w-(--ring-sz) h-(--ring-sz)"
      style={{ '--ring-sz': `${size}px` } as React.CSSProperties}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={cn(
            'font-bold tabular-nums text-foreground',
            size > 140 ? 'text-3xl' : 'text-xl',
          )}
        >
          <motion.span>{display}</motion.span>
        </div>
        {label && (
          <div className="mt-0.5 text-center text-[0.7rem] font-medium text-muted-foreground">
            {label}
          </div>
        )}
        {sublabel && (
          <div className="mt-px text-center text-[0.65rem] text-muted-foreground">{sublabel}</div>
        )}
      </div>
    </div>
  );
}
