import type { PomodoroSession } from '../../types';
import { TimerIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  session: PomodoroSession;
}

export default function SessionCard({ session }: Props) {
  const start = new Date(session.startTime);
  const time = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Card
      size="sm"
      className="flex-row items-center gap-3 rounded-none border-0 border-b border-border bg-transparent py-2.5 shadow-none ring-0 last:border-b-0"
    >
      <TimerIcon size={18} weight="duotone" className="shrink-0 text-primary" />

      <CardContent className="flex min-w-0 flex-1 flex-col gap-0 p-0">
        <div className="truncate text-sm font-medium text-foreground">
          {session.subject || 'General Focus'}
        </div>
        <div className="text-xs text-muted-foreground">
          {time} · {session.duration ?? 0} min
        </div>
      </CardContent>

      <Badge
        variant={session.wasCompleted ? 'default' : 'secondary'}
        className={cn(
          session.wasCompleted &&
            'border-transparent bg-green-500/10 text-green-600 dark:text-green-400',
        )}
      >
        {session.wasCompleted ? 'Done' : 'Stopped'}
      </Badge>
    </Card>
  );
}
