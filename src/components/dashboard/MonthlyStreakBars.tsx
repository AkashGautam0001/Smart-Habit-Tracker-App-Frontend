import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { cn } from '@/lib/utils';

interface CalDay {
  date: string;
  habitsPct: number;
  focusMinutes: number;
  tasksCompleted: number;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function MonthlyStreakBars() {
  const now = new Date();
  const mk = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const { data } = useQuery({
    queryKey: ['calendar-mini', mk],
    queryFn: () => analyticsApi.getCalendar(mk).then((r) => r.data.data.days as CalDay[]),
    staleTime: 60_000,
  });

  const days = data ?? [];
  if (days.length === 0) return null;

  const monthShort = now.toLocaleDateString('en-US', { month: 'short' });
  const today = now.toISOString().slice(0, 10);

  return (
    <div className="mt-3">
      <div className="flex h-8 items-end gap-[3px]">
        {days.map((d) => {
          const isFuture = d.date > today;
          const isActive = !isFuture && (d.habitsPct > 0 || d.focusMinutes > 0 || d.tasksCompleted > 0);
          return (
            <div
              key={d.date}
              title={d.date}
              className={cn(
                'flex-1 rounded-[1.5px]',
                isFuture ? 'h-1.5 bg-muted' : isActive ? 'h-full bg-primary' : 'h-1.5 bg-muted',
              )}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[0.65rem] text-muted-foreground">
        <span>1 {monthShort}</span>
        <span>{days.length} {monthShort}</span>
      </div>
    </div>
  );
}
