import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BooksIcon } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SubjectData {
  subject: string;
  minutes: number;
  sessions: number;
  pct: number;
}

interface Props {
  subjects: SubjectData[];
  totalMinutes: number;
}

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  '#3b82f6',
  'var(--chart-5)',
  '#8b5cf6',
  '#06b6d4',
];

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  return h > 0 ? `${h}h` : `${m}m`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: SubjectData }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;

  return (
    <Card size="sm" className="py-2 shadow-md">
      <CardContent className="px-3 py-0 text-[0.78rem]">
        <div className="mb-0.5 font-semibold text-foreground">{s.subject}</div>
        <div className="text-muted-foreground">
          {fmt(s.minutes)} · {s.pct}%
        </div>
        <div className="text-muted-foreground/80">
          {s.sessions} session{s.sessions !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubjectDonut({ subjects, totalMinutes }: Props) {
  if (subjects.length === 0) {
    return (
      <div className="flex h-50 flex-col items-center justify-center gap-2">
        <BooksIcon size={32} weight="duotone" className="text-muted-foreground/30" />
        <div className="text-[0.83rem] text-muted-foreground">No session data yet</div>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={subjects}
            dataKey="minutes"
            nameKey="subject"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={subjects.length > 1 ? 2 : 0}
          >
            {subjects.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <Card size="sm" className="mt-1 gap-0 py-2 ring-0">
        <CardContent className="flex flex-col gap-1.5 px-3 py-0">
          {subjects.slice(0, 6).map((s, i) => (
            <div
              key={s.subject}
              className="flex items-center gap-2 text-[0.81rem]"
            >
              <div
                className="size-2 shrink-0 rounded-sm bg-(--dot-c)"
                style={{ '--dot-c': PALETTE[i % PALETTE.length] } as React.CSSProperties}
              />
              <span className="flex-1 truncate text-muted-foreground">
                {s.subject}
              </span>
              <span className="font-medium text-foreground">{fmt(s.minutes)}</span>
              <span className="min-w-8.5 text-right text-muted-foreground">
                {s.pct}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {totalMinutes > 0 && (
        <p className="mt-2.5 text-center text-[0.76rem] text-muted-foreground">
          Total: {fmt(totalMinutes)} across {subjects.length} subject
          {subjects.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
