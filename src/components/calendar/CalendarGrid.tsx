import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface CalendarDay {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  habitsPct: number;
  focusMinutes: number;
  tasksCompleted: number;
  tasksTotal: number;
}

interface Props {
  days: CalendarDay[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const INTENSITY_COLORS = [
  'var(--muted)',
  '#1e1b4b',
  '#312e81',
  '#4338ca',
  '#6366f1',
];

function intensityLevel(pct: number, focusMin: number): number {
  if (pct === 0 && focusMin === 0) return 0;
  const focusScore = Math.min(focusMin / 90, 1) * 30;
  const combined = pct * 0.7 + focusScore;
  if (combined < 15) return 1;
  if (combined < 40) return 2;
  if (combined < 70) return 3;
  return 4;
}

export default function CalendarGrid({ days, selectedDate, onSelect }: Props) {
  if (!days.length) return null;

  const firstDay = new Date(days[0].date + 'T00:00:00');
  const leadingBlanks = firstDay.getDay();

  const today = new Date().toISOString().slice(0, 10);
  const cells: (CalendarDay | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[0.7rem] font-semibold text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />;

          const isToday = day.date === today;
          const isSelected = day.date === selectedDate;
          const isFuture = day.date > today;
          const level = isFuture ? 0 : intensityLevel(day.habitsPct, day.focusMinutes);
          const bg = isFuture ? 'transparent' : INTENSITY_COLORS[level];
          const dayNum = parseInt(day.date.slice(8), 10);

          return (
            <motion.button
              key={day.date}
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={() => onSelect(day.date)}
              title={
                isFuture
                  ? day.date
                  : `${day.habitsPct}% habits · ${day.focusMinutes}m focus`
              }
              style={{ '--day-bg': bg } as React.CSSProperties}
              className={cn(
                'bg-(--day-bg)',
                'relative flex aspect-square min-h-0 min-w-0 flex-col items-center justify-between gap-0.5 rounded-md border-2 p-1 pb-0.5 transition-colors',
                isSelected && 'border-primary',
                isToday && !isSelected && 'border-primary/60',
                !isSelected && !isToday && 'border-transparent',
                isFuture ? 'cursor-default opacity-30' : 'cursor-pointer',
              )}
            >
              <span
                className={cn(
                  'text-[clamp(0.6rem,1.2vw,0.75rem)] leading-none',
                  isToday && 'font-bold text-primary',
                  !isToday && level >= 3 && 'text-indigo-100',
                  !isToday && level < 3 && 'text-muted-foreground',
                )}
              >
                {dayNum}
              </span>

              {day.focusMinutes > 0 && !isFuture && (
                <div
                  className="size-1 shrink-0 self-end rounded-full bg-[#22c55e]"
                  aria-hidden
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[0.65rem] text-muted-foreground">Less</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div
            key={i}
            className="size-2.5 rounded-sm border border-border bg-(--leg-c)"
            style={{ '--leg-c': c } as React.CSSProperties}
          />
        ))}
        <span className="text-[0.65rem] text-muted-foreground">More</span>
        <span className="ml-2 text-[0.65rem] text-muted-foreground">·</span>
        <div className="size-1.5 rounded-full bg-[#22c55e]" aria-hidden />
        <Badge variant="secondary" className="h-auto px-1.5 py-0 text-[0.65rem] font-normal">
          Focus
        </Badge>
      </div>
    </div>
  );
}
