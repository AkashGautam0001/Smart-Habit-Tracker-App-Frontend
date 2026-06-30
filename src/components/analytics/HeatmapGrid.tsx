import { useState, useRef } from 'react';

export interface HeatmapDay {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  habitsPct: number;
  focusMinutes: number;
}

interface Props {
  days: HeatmapDay[];
  year: number;
}

const CS = 11;
const CG = 2;
const CP = CS + CG;
const LP = 22;
const TP = 20;

const FILLS = [
  'var(--color-surface-hover)',
  'rgba(99,102,241,0.18)',
  'rgba(99,102,241,0.40)',
  'rgba(99,102,241,0.68)',
  '#6366f1',
];

function activityLevel(d: HeatmapDay): 0 | 1 | 2 | 3 | 4 {
  const h = d.habitsTotal > 0 ? d.habitsCompleted / d.habitsTotal : 0;
  const f = Math.min(d.focusMinutes / 120, 1);
  const score = 0.6 * h + 0.4 * f;
  if (score === 0) return 0;
  if (score < 0.25) return 1;
  if (score < 0.5)  return 2;
  if (score < 0.75) return 3;
  return 4;
}

interface TooltipState { x: number; y: number; day: HeatmapDay; label: string }

export default function HeatmapGrid({ days, year }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const jan1    = new Date(year, 0, 1);
  const startDOW = (jan1.getDay() + 6) % 7; // 0 = Mon

  const dayMap: Record<string, HeatmapDay> = {};
  days.forEach((d) => { dayMap[d.date] = d; });

  // Month label positions
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let col = 0; col < 53; col++) {
    const firstIdx = col * 7 - startDOW;
    if (firstIdx >= 0 && firstIdx < days.length) {
      const d = new Date(year, 0, firstIdx + 1);
      if (d.getMonth() !== lastMonth) {
        monthLabels.push({ col, label: d.toLocaleString('en-US', { month: 'short' }) });
        lastMonth = d.getMonth();
      }
    }
  }

  // Build cells
  type Cell = { x: number; y: number; date: string; day: HeatmapDay | null; dateObj: Date };
  const cells: Cell[] = days.map((_, i) => {
    const adjusted = i + startDOW;
    const col = Math.floor(adjusted / 7);
    const row = adjusted % 7;
    const dateObj = new Date(year, 0, i + 1);
    const dateStr  = dateObj.toISOString().slice(0, 10);
    return { x: LP + col * CP, y: TP + row * CP, date: dateStr, day: dayMap[dateStr] ?? null, dateObj };
  });

  const svgW = LP + 53 * CP;
  const svgH = TP + 7 * CP;

  const DAY_LABELS = [{ row: 0, label: 'M' }, { row: 2, label: 'W' }, { row: 4, label: 'F' }];

  return (
    <div ref={containerRef} style={{ position: 'relative', overflowX: 'auto' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block' }}>
        {monthLabels.map(({ col, label }) => (
          <text
            key={`${label}-${col}`}
            x={LP + col * CP}
            y={13}
            fill="var(--color-text-muted)"
            fontSize={10}
            fontFamily="var(--font-sans)"
          >
            {label}
          </text>
        ))}

        {DAY_LABELS.map(({ row, label }) => (
          <text
            key={label}
            x={LP - 5}
            y={TP + row * CP + CS - 1}
            fill="var(--color-text-muted)"
            fontSize={9}
            textAnchor="end"
            fontFamily="var(--font-sans)"
          >
            {label}
          </text>
        ))}

        {cells.map((cell) => {
          const lvl = cell.day ? activityLevel(cell.day) : 0;
          return (
            <rect
              key={cell.date}
              x={cell.x}
              y={cell.y}
              width={CS}
              height={CS}
              rx={2}
              fill={FILLS[lvl]}
              style={{ cursor: 'default' }}
              onMouseEnter={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const empty: HeatmapDay = { date: cell.date, habitsCompleted: 0, habitsTotal: 0, habitsPct: 0, focusMinutes: 0 };
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  day: cell.day ?? empty,
                  label: cell.dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: Math.max(tooltip.y - 72, 4),
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '0.76rem',
            pointerEvents: 'none',
            zIndex: 50,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{tooltip.label}</div>
          {tooltip.day.habitsTotal > 0 ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>
              ✅ {tooltip.day.habitsCompleted}/{tooltip.day.habitsTotal} habits
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)' }}>No habits tracked</div>
          )}
          <div style={{ color: 'var(--color-text-secondary)' }}>
            ⏱ {tooltip.day.focusMinutes > 0 ? `${tooltip.day.focusMinutes} min focus` : 'No focus sessions'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, paddingLeft: LP }}>
        <span style={{ fontSize: '0.71rem', color: 'var(--color-text-muted)' }}>Less</span>
        {FILLS.map((fill, i) => (
          <div key={i} style={{ width: CS, height: CS, borderRadius: 2, background: fill, border: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
        <span style={{ fontSize: '0.71rem', color: 'var(--color-text-muted)' }}>More</span>
      </div>
    </div>
  );
}
