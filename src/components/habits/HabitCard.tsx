import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  CheckCircleIcon, CircleIcon, PencilSimpleIcon, TrashIcon, DotsThree,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Habit } from '../../types';
import StreakBadge from './StreakBadge';

interface Props {
  habit: Habit;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (id: string) => void;
  isLogging?: boolean;
}

export default function HabitCard({ habit, onToggle, onEdit, onArchive, isLogging }: Props) {
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isDone = habit.todayLog?.completed ?? false;

  const handleToggle = () => {
    navigator.vibrate?.(10);
    onToggle(habit._id, !isDone);
  };

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === 'Right' && !isDone) setSwipeOffset(Math.min(e.deltaX, 80));
      if (e.dir === 'Left' && isDone) setSwipeOffset(Math.max(e.deltaX, -80));
    },
    onSwipedRight: (e) => {
      if (e.deltaX > 60 && !isDone) {
        handleToggle();
      }
      setSwipeOffset(0);
    },
    onSwipedLeft: (e) => {
      if (e.deltaX < -60 && isDone) {
        handleToggle();
      }
      setSwipeOffset(0);
    },
    onTouchEndOrOnMouseUp: () => setSwipeOffset(0),
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative select-none"
    >
      {swipeOffset > 0 && (
        <div className="absolute inset-0 flex items-center rounded-xl bg-green-500/20 pl-5">
          <CheckCircleIcon size={22} weight="fill" className="text-green-500" />
        </div>
      )}

      <motion.div
        animate={{ x: swipeOffset }}
        transition={swipeOffset === 0 ? { duration: 0.25, ease: 'easeOut' } : { duration: 0 }}
        className="relative"
      >
      <Card
        {...swipeHandlers}
        className={cn(
          'flex-row items-center gap-3.5 py-0 shadow-none [--card-spacing:0]',
          isLogging && 'opacity-60',
        )}
      >
        <div
          className="h-9 w-1 shrink-0 rounded-sm bg-[var(--habit-color)]"
          style={{ '--habit-color': habit.color } as React.CSSProperties}
        />

        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          disabled={isLogging}
          className={cn(
            'shrink-0',
            isDone ? 'text-green-500 hover:text-green-500' : 'text-muted-foreground/40 hover:text-muted-foreground/60',
          )}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={handleToggle}
            aria-label={isDone ? 'Unmark habit' : 'Complete habit'}
          >
            {isDone
              ? <CheckCircleIcon size={26} weight="fill" />
              : <CircleIcon size={26} weight="regular" />
            }
          </motion.button>
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'truncate text-[0.9rem] font-medium',
                isDone
                  ? 'text-muted-foreground line-through decoration-muted-foreground/60'
                  : 'text-foreground',
              )}
            >
              {habit.title}
            </span>
            {(habit.currentStreak ?? 0) > 0 && (
              <StreakBadge streak={habit.currentStreak!} size="sm" />
            )}
          </div>
          {habit.description && (
            <p className="mt-0.5 truncate text-[0.78rem] text-muted-foreground">
              {habit.description}
            </p>
          )}
        </div>

        {(habit.longestStreak ?? 0) > 0 && (
          <div className="shrink-0 text-right text-[0.72rem] text-muted-foreground">
            Best {habit.longestStreak}d
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground"
              aria-label="Habit options"
            >
              <DotsThree size={20} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem onClick={() => onEdit(habit)}>
              <PencilSimpleIcon size={15} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onArchive(habit._id)}>
              <TrashIcon size={15} />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
      </motion.div>
    </motion.div>
  );
}
