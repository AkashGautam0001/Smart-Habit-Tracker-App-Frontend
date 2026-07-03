import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { analyticsApi } from '@/api/analytics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalDay {
  date: string;
  habitsPct: number;
  habitsTotal: number;
}

type DayState = 'completed' | 'partial' | 'missed' | 'noData' | 'future';

const STATE_DOT: Record<DayState, string> = {
  completed: 'bg-green-500',
  partial: 'bg-orange-500',
  missed: 'bg-destructive',
  noData: 'bg-muted-foreground/30',
  future: 'bg-transparent',
};

const LEGEND: { state: Exclude<DayState, 'future'>; label: string }[] = [
  { state: 'completed', label: 'Completed' },
  { state: 'partial', label: 'Partial' },
  { state: 'missed', label: 'Missed' },
  { state: 'noData', label: 'No Data' },
];

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface Props {
  selected: string;
  onSelect: (date: string) => void;
}

export default function MiniMonthCalendar({ selected, onSelect }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const mk = monthKey(cursor);
  const today = dateKey(new Date());

  const { data } = useQuery({
    queryKey: ['calendar-mini', mk],
    queryFn: () => analyticsApi.getCalendar(mk).then((r) => r.data.data.days as CalDay[]),
    staleTime: 60_000,
  });

  const dayByDate = new Map((data ?? []).map((d) => [d.date, d]));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(year, month, i - startOffset + 1);
    return { date: dateKey(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });

  function stateFor(date: string): DayState {
    if (date > today) return 'future';
    const day = dayByDate.get(date);
    if (!day || day.habitsTotal === 0) return 'noData';
    if (day.habitsPct === 100) return 'completed';
    if (day.habitsPct > 0) return 'partial';
    return 'missed';
  }

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isThisMonth = mk === monthKey(new Date());

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <CaretLeftIcon size={12} weight="bold" />
          </Button>
          <Button
            variant={isThisMonth ? 'secondary' : 'outline'}
            size="sm"
            className="h-6 px-2 text-[0.68rem]"
            onClick={() => { setCursor(new Date()); onSelect(today); }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <CaretRightIcon size={12} weight="bold" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {DAY_HEADERS.map((h) => (
          <div key={h} className="text-center text-[0.64rem] font-medium text-muted-foreground/60">
            {h}
          </div>
        ))}
        {cells.map((c) => {
          const isToday = c.date === today;
          const isSelected = c.date === selected;
          const state = stateFor(c.date);

          return (
            <button
              key={c.date}
              type="button"
              onClick={() => onSelect(c.date)}
              className="flex flex-col items-center justify-center gap-1 py-0.5"
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[0.72rem] transition-colors',
                  !c.inMonth && 'text-muted-foreground/25',
                  c.inMonth && !isSelected && 'text-foreground',
                  isSelected && 'bg-primary font-semibold text-primary-foreground',
                  isToday && !isSelected && 'font-semibold text-primary',
                )}
              >
                {c.day}
              </span>
              <span className={cn('size-1 rounded-full', STATE_DOT[state])} />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border pt-2.5">
        {LEGEND.map((l) => (
          <span key={l.state} className="flex items-center gap-1 text-[0.62rem] text-muted-foreground">
            <span className={cn('size-1.5 rounded-full', STATE_DOT[l.state])} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
