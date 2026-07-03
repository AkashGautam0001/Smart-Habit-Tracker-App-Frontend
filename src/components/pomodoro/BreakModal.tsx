import { CoffeeIcon, SkipForwardIcon } from '@phosphor-icons/react';
import type { PomodoroPhase } from '../../config/pomodoro.config';
import { PHASE_LABELS, PHASE_COLORS } from '../../config/pomodoro.config';
import { APP_CONFIG } from '../../config/app.config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md text-center sm:max-w-md">
        <AlertDialogHeader className="place-items-center gap-3 text-center sm:place-items-center sm:text-center">
          <div className="mb-1 flex justify-center">
            <CoffeeIcon size={56} weight="duotone" color={color} />
          </div>

          <AlertDialogTitle
            className="text-xs font-bold uppercase tracking-widest text-(--phase-c)"
            style={{ '--phase-c': color } as React.CSSProperties}
          >
            {PHASE_LABELS[phase]}
          </AlertDialogTitle>

          <div className="font-mono text-5xl font-bold tabular-nums tracking-tight text-foreground">
            {timeDisplay}
          </div>

          <AlertDialogDescription className="text-base italic">
            &ldquo;{quote}&rdquo;
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 justify-center border-t-0 bg-transparent sm:justify-center">
          <AlertDialogAction variant="outline" onClick={onSkip}>
            <SkipForwardIcon size={16} weight="bold" />
            Skip Break
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
