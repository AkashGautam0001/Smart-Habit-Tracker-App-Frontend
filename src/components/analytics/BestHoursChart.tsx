import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export interface HourData {
  hour: number;
  sessions: number;
  minutes: number;
}

interface Props {
  hours: HourData[];
}

const SHOW = new Set([0, 3, 6, 9, 12, 15, 18, 21]);

function fmtHour(h: number): string {
  if (h === 0) return '12A';
  if (h < 12) return `${h}A`;
  if (h === 12) return '12P';
  return `${h - 12}P`;
}

interface TT {
  active?: boolean;
  payload?: { payload: HourData }[];
}

function ChartTooltip({ active, payload }: TT) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const h = d.hour;
  const label =
    h === 0
      ? '12:00 AM'
      : h < 12
        ? `${h}:00 AM`
        : h === 12
          ? '12:00 PM'
          : `${h - 12}:00 PM`;

  return (
    <Card size="sm" className="py-2 shadow-md">
      <CardContent className="px-3 py-0 text-[0.78rem]">
        <div className="mb-0.5 font-semibold text-foreground">{label}</div>
        <div className="text-muted-foreground">
          {d.sessions} session{d.sessions !== 1 ? 's' : ''}
        </div>
        {d.minutes > 0 && (
          <div className="text-muted-foreground/80">{d.minutes} min total</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BestHoursChart({ hours }: Props) {
  const maxSessions = Math.max(...hours.map((h) => h.sessions), 1);

  if (hours.every((h) => h.sessions === 0)) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <div className="text-[1.6rem] opacity-30">🕐</div>
        <div className="text-[0.83rem] text-muted-foreground">No sessions yet</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={hours}
        barCategoryGap="10%"
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="hour"
          tickFormatter={(h) => (SHOW.has(h) ? fmtHour(h) : '')}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis hide />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: 'color-mix(in srgb, var(--foreground) 3%, transparent)', radius: 4 }}
        />
        <Bar dataKey="sessions" radius={[3, 3, 0, 0]}>
          {hours.map((h, i) => (
            <Cell
              key={i}
              fill={
                h.sessions === maxSessions && h.sessions > 0
                  ? 'var(--chart-1)'
                  : h.sessions > 0
                    ? 'color-mix(in srgb, var(--chart-1) 40%, transparent)'
                    : 'var(--muted)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
