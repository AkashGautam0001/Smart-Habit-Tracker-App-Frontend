import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

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

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <Card className="px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-muted-foreground">
          {p.name === 'Habits' ? `${p.value}% habits done` : `${p.value} min focus`}
        </div>
      ))}
    </Card>
  );
}

export default function WeeklyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} barGap={3} barCategoryGap="28%">
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: 'var(--secondary)', radius: 4 }}
        />
        <Bar dataKey="habitsPct" name="Habits" radius={[3, 3, 0, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={
                d.isToday
                  ? 'var(--primary)'
                  : d.habitsPct > 0
                    ? 'color-mix(in srgb, var(--primary) 30%, transparent)'
                    : 'var(--secondary)'
              }
            />
          ))}
        </Bar>
        <Bar dataKey="focusMinutes" name="Focus" radius={[3, 3, 0, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={
                d.isToday
                  ? 'var(--chart-2)'
                  : d.focusMinutes > 0
                    ? 'color-mix(in srgb, var(--chart-2) 30%, transparent)'
                    : 'var(--secondary)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
