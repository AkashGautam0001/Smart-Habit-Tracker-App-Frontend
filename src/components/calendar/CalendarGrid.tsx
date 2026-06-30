import { motion } from 'framer-motion';

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
  'var(--color-surface-hover)',  // 0 %   — no activity
  '#1e1b4b',                     // 1-25 % — indigo-950
  '#312e81',                     // 26-50% — indigo-900
  '#4338ca',                     // 51-75% — indigo-700
  '#6366f1',                     // 76-100%— indigo-500
];

function intensityLevel(pct: number, focusMin: number): number {
  if (pct === 0 && focusMin === 0) return 0;
  // weight 70% habits + 30% focus (capped at 90 min = full)
  const focusScore = Math.min(focusMin / 90, 1) * 30;
  const combined = pct * 0.7 + focusScore;
  if (combined < 15)  return 1;
  if (combined < 40)  return 2;
  if (combined < 70)  return 3;
  return 4;
}

export default function CalendarGrid({ days, selectedDate, onSelect }: Props) {
  if (!days.length) return null;

  const firstDay = new Date(days[0].date + 'T00:00:00');
  const leadingBlanks = firstDay.getDay(); // 0=SunIcon

  const today = new Date().toISOString().slice(0, 10);
  const cells: (CalendarDay | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...days,
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAY_HEADERS.map((d) => (
          <div key={d} style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 600, padding: '4px 0', textAlign: 'center' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />;

          const isToday     = day.date === today;
          const isSelected  = day.date === selectedDate;
          const isFuture    = day.date > today;
          const level       = isFuture ? 0 : intensityLevel(day.habitsPct, day.focusMinutes);
          const bg          = isFuture ? 'transparent' : INTENSITY_COLORS[level];
          const dayNum      = parseInt(day.date.slice(8), 10);

          return (
            <motion.button
              key={day.date}
              whileTap={{ scale: 0.88 }}
              onClick={() => onSelect(day.date)}
              title={isFuture ? day.date : `${day.habitsPct}% habits · ${day.focusMinutes}m focus`}
              style={{
                alignItems: 'center',
                aspectRatio: '1',
                background: bg,
                border: isSelected
                  ? '2px solid var(--color-accent)'
                  : isToday
                  ? '2px solid color-mix(in srgb, var(--color-accent) 60%, transparent)'
                  : '2px solid transparent',
                borderRadius: 6,
                cursor: isFuture ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                justifyContent: 'space-between',
                minHeight: 'auto', minWidth: 'auto',
                opacity: isFuture ? 0.3 : 1,
                padding: '4px 4px 3px',
                position: 'relative',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Day number */}
              <span style={{
                color: isToday ? 'var(--color-accent)' : level >= 3 ? '#e0e7ff' : 'var(--color-text-secondary)',
                fontSize: 'clamp(0.6rem, 1.2vw, 0.75rem)',
                fontWeight: isToday ? 700 : 400,
                lineHeight: 1,
              }}>
                {dayNum}
              </span>

              {/* Focus dot */}
              {day.focusMinutes > 0 && !isFuture && (
                <div style={{
                  alignSelf: 'flex-end',
                  background: '#22c55e',
                  borderRadius: '50%',
                  flexShrink: 0,
                  height: 4,
                  width: 4,
                }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ alignItems: 'center', display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 12 }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>Less</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div key={i} style={{ background: c, border: '1px solid var(--color-border)', borderRadius: 3, height: 10, width: 10 }} />
        ))}
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>More</span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', marginLeft: 8 }}>·</span>
        <div style={{ background: '#22c55e', borderRadius: '50%', height: 6, width: 6 }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>Focus</span>
      </div>
    </div>
  );
}
