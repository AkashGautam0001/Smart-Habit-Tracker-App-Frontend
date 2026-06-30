import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, SkipForwardIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import type { PomodoroPhase } from '../../config/pomodoro.config';
import { PHASE_COLORS } from '../../config/pomodoro.config';

interface Props {
  isRunning: boolean;
  phase: PomodoroPhase;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export default function TimerControls({ isRunning, phase, onStart, onPause, onSkip, onReset }: Props) {
  const accentColor = PHASE_COLORS[phase];

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 16, justifyContent: 'center' }}>
      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onReset}
        aria-label="Reset timer"
        style={{
          alignItems: 'center', background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)', borderRadius: '50%',
          color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex',
          height: 48, justifyContent: 'center', minHeight: 'auto', minWidth: 'auto',
          width: 48, transition: 'all 0.15s',
        }}
      >
        <ArrowCounterClockwiseIcon size={20} weight="bold" />
      </motion.button>

      {/* Play / Pause — large button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        onClick={isRunning ? onPause : onStart}
        aria-label={isRunning ? 'Pause' : 'Start'}
        style={{
          alignItems: 'center',
          background: accentColor,
          border: 'none', borderRadius: '50%',
          boxShadow: `0 0 24px ${accentColor}50`,
          color: '#fff', cursor: 'pointer', display: 'flex',
          height: 72, justifyContent: 'center',
          minHeight: 'auto', minWidth: 'auto', width: 72,
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        {isRunning
          ? <PauseIcon size={28} weight="fill" />
          : <PlayIcon  size={28} weight="fill" />
        }
      </motion.button>

      {/* Skip */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onSkip}
        aria-label="Skip phase"
        style={{
          alignItems: 'center', background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)', borderRadius: '50%',
          color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex',
          height: 48, justifyContent: 'center', minHeight: 'auto', minWidth: 'auto',
          width: 48, transition: 'all 0.15s',
        }}
      >
        <SkipForwardIcon size={20} weight="bold" />
      </motion.button>
    </div>
  );
}
