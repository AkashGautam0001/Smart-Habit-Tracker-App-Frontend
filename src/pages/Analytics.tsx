import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartBarIcon, LockIcon, TrendUpIcon, TimerIcon, CheckCircleIcon, FlameIcon, ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { analyticsApi } from '../api/analytics';
import { usePlan } from '../hooks/usePlan';
import HeatmapGrid from '../components/analytics/HeatmapGrid';
import SubjectDonut from '../components/analytics/SubjectDonut';
import BestHoursChart from '../components/analytics/BestHoursChart';
import HabitScoreCard from '../components/analytics/HabitScoreCard';
import WeeklyReviewDialog from '../components/ai/WeeklyReviewDialog';
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function fromStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  return d.toISOString().slice(0, 10);
}

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0)          return `${h}h`;
  return `${m}m`;
}

// ── sub-components ────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { label: '7D',   days: 7,   proOnly: false },
  { label: '30D',  days: 30,  proOnly: false },
  { label: '90D',  days: 90,  proOnly: true  },
  { label: '1 Year', days: 365, proOnly: true },
] as const;

interface StatCardProps { label: string; value: string | number; icon: React.ReactNode; sub?: string }
function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="pt-0">
        <div className="mb-1.5 flex items-start justify-between">
          <span className="text-[0.72rem] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-primary opacity-75">{icon}</span>
        </div>
        <div className="text-2xl font-bold leading-none tabular-nums text-foreground">
          {value}
        </div>
        {sub && <p className="mt-1 text-[0.72rem] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

interface ChartTooltipProps { active?: boolean; payload?: { value: number; name: string }[]; label?: string }
function RangeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-muted-foreground">
          {p.name === 'Habits %' ? `${p.value}% habits` : `${p.value} min focus`}
        </div>
      ))}
    </div>
  );
}

interface ProTeaserProps { onUpgrade: () => void }
function ProTeaser({ onUpgrade }: ProTeaserProps) {
  const FEATURES = [
    '365-day GitHub-style heatmap',
    'Subject-wise time breakdown',
    'Best focus hours of the day',
    'Per-habit completion rates',
    'Custom date ranges (90 days, 1 year)',
  ];
  return (
    <Card className="border-primary/30 bg-linear-to-br from-primary/5 to-primary/2 text-center">
      <CardContent className="py-7">
        <div className="mb-2.5 text-3xl">✨</div>
        <h3 className="mb-2 text-base font-bold">Advanced Analytics</h3>
        <p className="mx-auto mb-4 max-w-sm text-sm text-muted-foreground">
          Go beyond the weekly chart. Unlock deep productivity insights with a Pro plan.
        </p>
        <ul className="mb-5 inline-flex flex-col items-start gap-1.5 text-left">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-bold text-primary">✓</span> {f}
            </li>
          ))}
        </ul>
        <Button onClick={onUpgrade} className="mt-2">
          Upgrade to Pro — ₹149/month
        </Button>
      </CardContent>
    </Card>
  );
}

function habitRateProgressClass(rate: number) {
  if (rate >= 80) return '[&_[data-slot=progress-indicator]]:bg-green-500';
  if (rate >= 50) return '[&_[data-slot=progress-indicator]]:bg-primary';
  return '[&_[data-slot=progress-indicator]]:bg-amber-500';
}

const HABIT_COLOR_BG: Record<string, string> = {
  '#6366f1': 'bg-indigo-500',
  '#8b5cf6': 'bg-violet-500',
  '#ec4899': 'bg-pink-500',
  '#ef4444': 'bg-red-500',
  '#f97316': 'bg-orange-500',
  '#f59e0b': 'bg-amber-500',
  '#22c55e': 'bg-green-500',
  '#10b981': 'bg-emerald-500',
  '#06b6d4': 'bg-cyan-500',
  '#3b82f6': 'bg-blue-500',
  '#a855f7': 'bg-purple-500',
  '#71717a': 'bg-zinc-500',
};

function habitColorClass(color: string) {
  return HABIT_COLOR_BG[color.toLowerCase()] ?? 'bg-primary';
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { isPro, canDo } = usePlan();
  const navigate = useNavigate();
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90 | 365>(7);
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());

  const today = todayStr();
  const from  = fromStr(rangeDays);

  // Free + Pro queries
  const rangeQ = useQuery({
    queryKey: ['analytics-range', from, today],
    queryFn: () => analyticsApi.getRange(from, today).then((r) => r.data.data as {
      daily: { date: string; label: string; shortLabel: string; habitsCompleted: number; habitsTotal: number; habitsPct: number; focusMinutes: number; sessions: number }[];
      summary: { totalMinutes: number; totalSessions: number; avgHabitsPct: number; days: number };
    }),
    staleTime: 60_000,
  });

  // Pro-only queries
  const heatmapQ = useQuery({
    queryKey: ['analytics-heatmap', heatmapYear],
    queryFn: () => analyticsApi.getHeatmap(heatmapYear).then((r) => r.data.data as {
      days: { date: string; habitsCompleted: number; habitsTotal: number; habitsPct: number; focusMinutes: number }[];
      year: number;
    }),
    enabled: isPro,
    staleTime: 5 * 60_000,
  });

  const subjectsQ = useQuery({
    queryKey: ['analytics-subjects', from, today],
    queryFn: () => analyticsApi.getSubjects(from, today).then((r) => r.data.data as {
      subjects: { subject: string; minutes: number; sessions: number; pct: number }[];
      totalMinutes: number;
    }),
    enabled: isPro,
    staleTime: 60_000,
  });

  const hoursQ = useQuery({
    queryKey: ['analytics-best-hours'],
    queryFn: () => analyticsApi.getBestHours().then((r) => r.data.data as {
      hours: { hour: number; sessions: number; minutes: number }[];
    }),
    enabled: isPro,
    staleTime: 5 * 60_000,
  });

  const habitStatsQ = useQuery({
    queryKey: ['analytics-habit-stats', from, today],
    queryFn: () => analyticsApi.getHabitStats(from, today).then((r) => r.data.data as {
      habits: { _id: string; title: string; color: string; icon: string; completedDays: number; totalDays: number; rate: number }[];
      totalDays: number;
    }),
    enabled: isPro,
    staleTime: 60_000,
  });

  const summary = rangeQ.data?.summary;
  const daily   = rangeQ.data?.daily ?? [];

  const habitRates = habitStatsQ.data?.habits ?? [];
  const avgRate = habitRates.length
    ? Math.round(habitRates.reduce((s, h) => s + h.rate, 0) / habitRates.length)
    : 0;
  const habitScore = Math.round((summary?.avgHabitsPct ?? 0) * 0.6 + avgRate * 0.4);

  // XAxis interval for range chart
  const xInterval = rangeDays <= 7 ? 0 : rangeDays <= 30 ? 4 : rangeDays <= 90 ? 12 : 30;
  const xKey = rangeDays <= 7 ? 'label' : 'shortLabel';

  const canDoAdvanced = canDo('advancedAnalytics');

  const handleRangeChange = (value: string) => {
    const days = Number(value) as 7 | 30 | 90 | 365;
    const option = RANGE_OPTIONS.find((o) => o.days === days);
    if (option?.proOnly && !isPro) {
      navigate('/upgrade');
      return;
    }
    setRangeDays(days);
  };

  return (
    <>
      <Helmet>
        <title>Analytics — HabitFlow</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-5"
        >
          <PageHeader
            title={
              <span className="inline-flex items-center gap-2.5">
                <ChartBarIcon size={22} weight="duotone" className="text-primary" />
                Analytics
              </span>
            }
            action={
              <Tabs value={String(rangeDays)} onValueChange={handleRangeChange}>
                <TabsList>
                  {RANGE_OPTIONS.map(({ label, days, proOnly }) => {
                    const locked = proOnly && !isPro;
                    return (
                      <TabsTrigger
                        key={days}
                        value={String(days)}
                        className={cn(locked && 'text-muted-foreground')}
                      >
                        {label}
                        {locked && <LockIcon size={11} />}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            }
          />

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
            {/* ── Left column ── */}
            <div className="space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <StatCard
                  label="Pomodoros"
                  value={summary?.totalSessions ?? '—'}
                  icon={<TimerIcon size={18} weight="duotone" />}
                  sub={`in ${rangeDays} days`}
                />
                <StatCard
                  label="Focus Time"
                  value={summary ? fmtTime(summary.totalMinutes) : '—'}
                  icon={<TrendUpIcon size={18} weight="duotone" />}
                  sub={summary && summary.totalSessions > 0 ? `avg ${fmtTime(Math.round(summary.totalMinutes / summary.totalSessions))}/session` : undefined}
                />
                <StatCard
                  label="Avg Habits"
                  value={summary ? `${summary.avgHabitsPct}%` : '—'}
                  icon={<CheckCircleIcon size={18} weight="duotone" />}
                  sub="daily completion"
                />
                <StatCard
                  label="Streak"
                  value={rangeQ.isLoading ? '—' : `${rangeDays}d`}
                  icon={<FlameIcon size={18} weight="duotone" />}
                  sub="current range"
                />
              </div>

              {/* Daily activity chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                  <CardDescription>Habits completion % and focus minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  {rangeQ.isLoading ? (
                    <Skeleton className="h-[130px] w-full" />
                  ) : daily.length === 0 ? (
                    <div className="flex h-[130px] items-center justify-center text-sm text-muted-foreground">
                      No data for this period
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={daily} barGap={3} barCategoryGap="22%">
                        <XAxis
                          dataKey={xKey}
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          interval={xInterval}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip content={<RangeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                        <Bar dataKey="habitsPct" name="Habits %" radius={[3, 3, 0, 0]} maxBarSize={20}>
                          {daily.map((d, i) => (
                            <Cell
                              key={i}
                              fill={d.date === today ? 'var(--primary)' : d.habitsPct > 0 ? 'color-mix(in oklch, var(--primary) 50%, transparent)' : 'var(--muted)'}
                            />
                          ))}
                        </Bar>
                        <Bar dataKey="focusMinutes" name="Focus min" radius={[3, 3, 0, 0]} maxBarSize={20}>
                          {daily.map((d, i) => (
                            <Cell
                              key={i}
                              fill={d.date === today ? '#22c55e' : d.focusMinutes > 0 ? '#22c55e50' : 'var(--muted)'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {!canDoAdvanced ? (
                <ProTeaser onUpgrade={() => navigate('/upgrade')} />
              ) : (
                <>
                  {/* Heatmap */}
                  <Card>
                    <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle>Activity Heatmap</CardTitle>
                        <CardDescription>Habits + focus sessions, daily</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setHeatmapYear((y) => y - 1)}
                        >
                          <ArrowLeftIcon size={14} />
                        </Button>
                        <span className="min-w-10 text-center text-sm font-semibold">{heatmapYear}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setHeatmapYear((y) => Math.min(y + 1, new Date().getFullYear()))}
                          disabled={heatmapYear >= new Date().getFullYear()}
                        >
                          <ArrowRightIcon size={14} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {heatmapQ.isLoading ? (
                        <Skeleton className="h-[120px] w-full" />
                      ) : (
                        <HeatmapGrid days={heatmapQ.data?.days ?? []} year={heatmapYear} />
                      )}
                    </CardContent>
                  </Card>

                  {/* Subject donut + Best hours */}
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subject Breakdown</CardTitle>
                        <CardDescription>Time per subject in range</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {subjectsQ.isLoading ? (
                          <Skeleton className="h-[200px] w-full" />
                        ) : (
                          <SubjectDonut
                            subjects={subjectsQ.data?.subjects ?? []}
                            totalMinutes={subjectsQ.data?.totalMinutes ?? 0}
                          />
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Best Focus Hours</CardTitle>
                        <CardDescription>When you focus most (all-time)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {hoursQ.isLoading ? (
                          <Skeleton className="h-[180px] w-full" />
                        ) : (
                          <BestHoursChart hours={hoursQ.data?.hours ?? []} />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>

            {/* ── Right column ── */}
            {canDoAdvanced && (
              <div className="flex flex-col gap-4">
                <WeeklyReviewDialog date={today} />

                <HabitScoreCard score={habitScore} />

                {/* Per-habit completion rates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Habit Completion Rates</CardTitle>
                    <CardDescription>Days completed in the selected range</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {habitStatsQ.isLoading ? (
                      <div className="flex flex-col gap-2.5">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : habitRates.length === 0 ? (
                      <div className="py-5 text-center text-sm text-muted-foreground">
                        No habits tracked yet
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {habitRates.map((h) => (
                          <div key={h._id} className="flex items-center gap-3">
                            <div className={cn('h-7 w-2 shrink-0 rounded', habitColorClass(h.color))} />
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 truncate text-sm font-medium text-foreground">
                                {h.title}
                              </div>
                              <Progress
                                value={h.rate}
                                className={cn('h-1.5', habitRateProgressClass(h.rate))}
                              />
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-sm font-bold text-foreground">{h.rate}%</div>
                              <div className="text-[0.72rem] text-muted-foreground">{h.completedDays}/{h.totalDays}d</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}
