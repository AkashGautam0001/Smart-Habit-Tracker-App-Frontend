import { PlayIcon, PauseIcon, SkipForwardIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import type { PomodoroPhase } from '../../config/pomodoro.config';
import { PHASE_COLORS } from '../../config/pomodoro.config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="size-12 rounded-full"
        onClick={onReset}
        aria-label="Reset timer"
      >
        <ArrowCounterClockwiseIcon size={20} weight="bold" />
      </Button>

      <Button
        variant="default"
        size="icon"
        className={cn(
          'size-18 rounded-full border-none text-white shadow-lg',
          'bg-(--phase-c) shadow-[0_0_24px_color-mix(in_srgb,var(--phase-c)_31%,transparent)]',
          'transition-[background,box-shadow] duration-300',
        )}
        style={{ '--phase-c': accentColor } as React.CSSProperties}
        onClick={isRunning ? onPause : onStart}
        aria-label={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning
          ? <PauseIcon size={28} weight="fill" />
          : <PlayIcon size={28} weight="fill" />
        }
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="size-12 rounded-full"
        onClick={onSkip}
        aria-label="Skip phase"
      >
        <SkipForwardIcon size={20} weight="bold" />
      </Button>
    </div>
  );
}
