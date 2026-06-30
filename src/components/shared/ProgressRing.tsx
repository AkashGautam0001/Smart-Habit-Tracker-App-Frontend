import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface Props {
  pct: number;         // 0-100
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
  color = 'var(--color-accent)',
  trackColor = 'var(--color-surface-hover)',
  label,
  sublabel,
  strokeWidth = 7,
}: Props) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(pct, 100) / 100);

  // Animated counter using Framer Motion (avoids react-countup CJS interop issue)
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const display = useTransform(rounded, (v: number) => `${v}%`);

  useEffect(() => {
    const controls = animate(count, pct, { duration: 1.1, ease: 'easeOut', delay: 0.1 });
    return controls.stop;
  }, [pct, count]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 5px ${color === 'var(--color-accent)' ? '#6366f180' : color + '60'})` }}
        />
      </svg>

      <div style={{
        alignItems: 'center', display: 'flex', flexDirection: 'column',
        inset: 0, justifyContent: 'center', position: 'absolute',
      }}>
        <div style={{
          color: 'var(--color-text)',
          fontSize: size > 140 ? '1.8rem' : '1.25rem',
          fontWeight: 700,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <motion.span>{display}</motion.span>
        </div>
        {label && (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: 500, marginTop: 3, textAlign: 'center' }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', marginTop: 1, textAlign: 'center' }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
