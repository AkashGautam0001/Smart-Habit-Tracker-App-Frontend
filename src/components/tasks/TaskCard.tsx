import { motion } from 'framer-motion';
import { CheckCircleIcon, CircleIcon, DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon, TimerIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Task } from '../../types';

interface Props {
  task: Task;
  subjectColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, subjectColor, onToggle, onEdit, onDelete }: Props) {
  const tomatoFilled = Math.min(task.completedPomodoros, task.estimatedPomodoros);
  const tomatoTotal = Math.max(task.estimatedPomodoros, task.completedPomodoros);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: task.isCompleted ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="relative flex items-center gap-3 border-b border-border px-3.5 py-3"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        className={cn(
          'shrink-0',
          task.isCompleted
            ? 'text-chart-2 hover:text-chart-2'
            : 'text-muted-foreground',
        )}
        aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.isCompleted
          ? <CheckCircleIcon size={22} weight="fill" />
          : <CircleIcon size={22} weight="regular" />
        }
      </Button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'truncate text-sm font-medium text-foreground transition-[text-decoration] duration-200',
            task.isCompleted && 'line-through',
          )}
        >
          {task.title}
        </div>

        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: tomatoTotal }).map((_, i) => (
            <TimerIcon
              key={i}
              size={12}
              weight={i < tomatoFilled ? 'fill' : 'regular'}
              className={cn(i < tomatoFilled ? 'text-primary' : 'text-muted-foreground/30')}
              title={i < tomatoFilled ? 'Completed session' : 'Planned session'}
            />
          ))}
          {task.completedPomodoros > task.estimatedPomodoros && (
            <span className="text-[0.7rem] text-chart-3">
              +{task.completedPomodoros - task.estimatedPomodoros}
            </span>
          )}
        </div>
      </div>

      {task.subject && (
        <Badge
          variant="outline"
          className="shrink-0 whitespace-nowrap border-(--subject-color)/25 bg-[color-mix(in_srgb,var(--subject-color)_15%,transparent)] text-(--subject-color)"
          style={{ '--subject-color': subjectColor } as React.CSSProperties}
        >
          {task.subject}
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            aria-label="Task actions"
          >
            <DotsThreeVerticalIcon size={18} weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32.5">
          <DropdownMenuItem onClick={onEdit}>
            <PencilSimpleIcon size={14} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <TrashIcon size={14} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
