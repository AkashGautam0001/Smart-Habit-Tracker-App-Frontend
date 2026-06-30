import { motion, AnimatePresence } from 'framer-motion';
import { CoffeeIcon, SkipForwardIcon } from '@phosphor-icons/react';
import type { PomodoroPhase } from '../../config/pomodoro.config';
import { PHASE_LABELS, PHASE_COLORS } from '../../config/pomodoro.config';
import { APP_CONFIG } from '../../config/app.config';

interface Props {
  open: boolean;
  phase: PomodoroPhase;
  timeDisplay: string;
  sessionCount: number;
  onSkip: () => void;
}

export default function BreakModal({ open, phase, timeDisplay, sessionCount, onSkip }: Props) {
  const color = PHASE_COLORS[phase];
  const quote = APP_CONFIG.quotes[sessionCount % APP_CONFIG.quotes.length];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            alignItems: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            bottom: 0, display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            left: 0, position: 'fixed', right: 0, top: 0,
            zIndex: 300, gap: 24, padding: 32,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
            style={{ textAlign: 'center', maxWidth: 400 }}
          >
            {/* Icon */}
            <div style={{ marginBottom: 16 }}>
              <CoffeeIcon size={56} weight="duotone" color={color} />
            </div>

            {/* Label */}
            <div style={{
              color, fontSize: '0.8rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              {PHASE_LABELS[phase]}
            </div>

            {/* Countdown */}
            <div style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '3.5rem', fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em', lineHeight: 1,
              marginBottom: 20,
            }}>
              {timeDisplay}
            </div>

            {/* Quote */}
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.95rem', fontStyle: 'italic',
              lineHeight: 1.6, marginBottom: 28,
            }}>
              "{quote}"
            </p>

            {/* Skip button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              style={{
                alignItems: 'center',
                background: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-border)',
                borderRadius: 10, color: 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'inline-flex',
                fontSize: '0.875rem', fontWeight: 500,
                gap: 8, minHeight: 'auto', minWidth: 'auto',
                padding: '10px 20px',
              }}
            >
              <SkipForwardIcon size={16} weight="bold" />
              Skip Break
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
