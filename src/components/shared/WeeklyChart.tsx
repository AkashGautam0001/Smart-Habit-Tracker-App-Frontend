import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DayData {
  date: string;
  label: string;
  isToday: boolean;
  habitsPct: number;
  focusMinutes: number;
}

interface Props {
  data: DayData[];
}

function FocusTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      fontSize: '0.78rem',
      padding: '8px 12px',
    }}>
      <div style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: 'var(--color-text-secondary)' }}>
          {p.name === 'Habits' ? `✅ ${p.value}% done` : `⏱ ${p.value} min focus`}
        </div>
      ))}
    </div>
  );
}

export default function WeeklyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} barGap={3} barCategoryGap="28%">
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, 100]} />
        <Tooltip content={<FocusTooltip />} cursor={{ fill: 'var(--color-surface-hover)', radius: 4 }} />
        <Bar dataKey="habitsPct" name="Habits" radius={[3, 3, 0, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isToday ? 'var(--color-accent)' : d.habitsPct > 0 ? '#6366f150' : 'var(--color-surface-hover)'}
            />
          ))}
        </Bar>
        <Bar
          dataKey="focusMinutes"
          name="Focus"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
          fill="#22c55e40"
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isToday ? '#22c55e' : d.focusMinutes > 0 ? '#22c55e50' : 'var(--color-surface-hover)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
