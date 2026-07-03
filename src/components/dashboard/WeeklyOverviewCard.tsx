import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { ChartBarIcon, CaretDownIcon } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DayData {
  date: string;
  label: string;
  isToday: boolean;
  habitsPct: number;
}

interface Props {
  data: DayData[];
}

function PctLabel(props: { x?: number; y?: number; width?: number; value?: number }) {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      className="fill-muted-foreground text-[10px] font-medium"
    >
      {value}%
    </text>
  );
}

const PLACEHOLDER_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({
  date: label, label, isToday: false, habitsPct: 0,
}));

export default function WeeklyOverviewCard({ data }: Props) {
  const isEmpty = data.length === 0 || data.every((d) => d.habitsPct === 0);
  const chartData = data.length ? data : PLACEHOLDER_DAYS;

  const avg = data.length
    ? Math.round(data.reduce((s, d) => s + d.habitsPct, 0) / data.length)
    : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pb-0 pt-4">
        <CardTitle className="text-sm font-semibold">Weekly Overview</CardTitle>
        <span className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[0.7rem] text-muted-foreground">
          This Week
          <CaretDownIcon size={10} weight="bold" />
        </span>
      </CardHeader>
      <CardContent className="relative px-4 pb-2 pt-4">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={chartData} margin={{ top: 16, right: 4, bottom: 0, left: 0 }} barCategoryGap="32%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Bar dataKey="habitsPct" radius={[5, 5, 5, 5]} maxBarSize={26}>
              {!isEmpty && <LabelList content={<PctLabel />} />}
              {chartData.map((d) => (
                <Cell
                  key={d.date}
                  fill={
                    d.isToday
                      ? 'var(--primary)'
                      : d.habitsPct > 0
                        ? 'color-mix(in srgb, var(--primary) 45%, transparent)'
                        : 'var(--secondary)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted/60">
              <ChartBarIcon size={20} weight="duotone" className="text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-foreground">No data yet</p>
            <p className="text-[0.72rem] text-muted-foreground">Your weekly progress will appear here.</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border px-1 pt-3 pb-1">
          <span className="text-[0.78rem] text-muted-foreground">Average Completion Rate</span>
          <span className="text-sm font-bold text-foreground">{avg}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
