import type { ReactNode } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRightIcon, ArrowDownRightIcon } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type StatTone = 'violet' | 'green' | 'orange' | 'blue';

const TONE = {
  violet: {
    iconBg: 'bg-primary/15 text-primary',
    cardBg: 'bg-linear-to-br from-primary/10 via-card to-card',
    accent: 'var(--primary)',
    progressClass: '**:data-[slot=progress-indicator]:bg-primary',
  },
  green: {
    iconBg: 'bg-green-500/15 text-green-500',
    cardBg: 'bg-linear-to-br from-green-500/10 via-card to-card',
    accent: '#22c55e',
    progressClass: '**:data-[slot=progress-indicator]:bg-green-500',
  },
  orange: {
    iconBg: 'bg-orange-500/15 text-orange-500',
    cardBg: 'bg-linear-to-br from-orange-500/10 via-card to-card',
    accent: '#f97316',
    progressClass: '**:data-[slot=progress-indicator]:bg-orange-500',
  },
  blue: {
    iconBg: 'bg-blue-500/15 text-blue-500',
    cardBg: 'bg-linear-to-br from-blue-500/10 via-card to-card',
    accent: '#3b82f6',
    progressClass: '**:data-[slot=progress-indicator]:bg-blue-500',
  },
} satisfies Record<StatTone, { iconBg: string; cardBg: string; accent: string; progressClass: string }>;

interface Props {
  tone: StatTone;
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  sparkline?: number[];
  trendPct?: number;
  progressPct?: number;
}

export default function StatTile({
  tone, icon, label, value, sub, sparkline, trendPct, progressPct,
}: Props) {
  const t = TONE[tone];
  const chartData = sparkline?.map((v, i) => ({ i, v }));

  return (
    <Card className={cn('relative overflow-hidden', t.cardBg)}>
      <CardContent className="relative z-10 px-4 py-3.5">
        <div className="mb-3 flex items-center gap-2.5">
          <div className={cn('flex size-9 items-center justify-center rounded-lg', t.iconBg)}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-[0.78rem] leading-tight font-medium text-muted-foreground">{label}</div>
          </div>
        </div>

        <div className="text-2xl font-bold tabular-nums leading-none text-foreground">{value}</div>
        {trendPct !== undefined ? (
          <div className={cn(
            'mt-1.5 flex items-center gap-1 text-[0.72rem] font-medium',
            trendPct >= 0 ? 'text-green-500' : 'text-destructive',
          )}>
            {trendPct >= 0
              ? <ArrowUpRightIcon size={12} weight="bold" />
              : <ArrowDownRightIcon size={12} weight="bold" />
            }
            {Math.abs(trendPct)}% from yesterday
          </div>
        ) : (
          <div className="mt-1.5 text-[0.72rem] text-muted-foreground">{sub}</div>
        )}

        {progressPct !== undefined && (
          <div className="mt-3">
            <Progress value={progressPct} className={cn('h-1.5', t.progressClass)} />
          </div>
        )}
      </CardContent>

      {chartData && chartData.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.accent} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={t.accent}
                strokeWidth={1.5}
                fill={`url(#spark-${label})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
