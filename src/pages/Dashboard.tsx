import { useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircleIcon, CircleIcon, FireIcon, ClockIcon, TargetIcon,
  StarIcon, PlayIcon, TrophyIcon, HourglassIcon, PlusIcon, CaretDownIcon,
} from '@phosphor-icons/react';
import MiniMonthCalendar from '@/components/dashboard/MiniMonthCalendar';
import StreakSideCard from '@/components/dashboard/StreakSideCard';
import MonthlyStreakBars from '@/components/dashboard/MonthlyStreakBars';
import StatTile from '@/components/dashboard/StatTile';
import WeeklyOverviewCard from '@/components/dashboard/WeeklyOverviewCard';
import GoProCard from '@/components/dashboard/GoProCard';
import PageShell from '@/components/shared/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useHabits, useLogHabit } from '../hooks/useHabits';
import { analyticsApi } from '../api/analytics';
import type { Habit } from '../types';
import { useAuthStore } from '../store/authStore';
import { getLevelProgress } from '../config/xp.config';
import { APP_CONFIG } from '../config/app.config';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatMinutes(m: number) {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`.trim();
  return `${m}m`;
}

function habitSubtitle(habit: Habit) {
  if (habit.description) return habit.description;
  if (habit.targetType === 'timer') return `${habit.targetValue} minutes`;
  if (habit.targetType === 'number') return `${habit.targetValue}x today`;
  return habit.category.charAt(0).toUpperCase() + habit.category.slice(1);
}

function pluralDays(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`;
}

function StreakPill({ icon, iconBg, value, label }: { icon: ReactNode; iconBg: string; value: string; label: string }) {
  return (
    <Link
      to="/habits"
      className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 no-underline hover:border-border/80 transition-colors"
    >
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[0.9rem] font-bold leading-tight text-foreground">{value}</div>
        <div className="truncate text-[0.68rem] text-muted-foreground">{label}</div>
      </div>
      <CaretDownIcon size={11} weight="bold" className="ml-1 shrink-0 text-muted-foreground/50" />
    </Link>
  );
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.04 + i * 0.05, duration: 0.3 },
});

export default function Dashboard() {
  const navigate = useNavigate();
  const { habits, isLoading: habitsLoading } = useHabits();
  const logHabit = useLogHabit();
  const { user } = useAuthStore();
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [focusDuration, setFocusDuration] = useState('25');

  const today = new Date().toISOString().slice(0, 10);
  const firstName = user?.name?.split(' ')[0] ?? '';

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then((r) => r.data.data),
    staleTime: 60_000,
  });

  const doneCount = habits.filter((h: Habit) => h.todayLog?.completed).length;
  const total = habits.length;
  const pct = overview?.habits.completionPct ?? (total > 0 ? Math.round((doneCount / total) * 100) : 0);
  const bestStreak = habits.reduce((mx: number, h: Habit) => Math.max(mx, h.currentStreak ?? 0), 0);
  const longestStreakEver = habits.reduce((mx: number, h: Habit) => Math.max(mx, h.longestStreak ?? 0), 0);
  const focusMin = overview?.focus.todayMinutes ?? 0;
  const tomatoCount = overview?.focus.tomatoCount ?? 0;
  const weeklyData = overview?.weekly ?? [];

  const last = weeklyData[weeklyData.length - 1];
  const prev = weeklyData[weeklyData.length - 2];
  const habitsTrend = last && prev ? last.habitsPct - prev.habitsPct : undefined;
  const focusTrend = last && prev && prev.focusMinutes > 0
    ? Math.round(((last.focusMinutes - prev.focusMinutes) / prev.focusMinutes) * 100)
    : undefined;

  const xpProgress = user ? getLevelProgress(user.xp, user.level) : 0;

  const handleToggle = async (id: string, completed: boolean) => {
    setLoggingId(id);
    try { await logHabit.mutateAsync({ id, data: { date: today, completed } }); }
    finally { setLoggingId(null); }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[272px_1fr]">
          {/* Left widget column */}
          <motion.div {...stagger(0)} className="flex flex-col gap-4">
            <Card>
              <CardContent className="px-4 py-4">
                <MiniMonthCalendar selected={selectedDate} onSelect={setSelectedDate} />
              </CardContent>
            </Card>

            <StreakSideCard
              icon={<FireIcon size={17} weight="duotone" className="text-orange-500" />}
              iconBg="bg-orange-500/12"
              title="Monthly Streak"
              value={bestStreak > 0 ? pluralDays(bestStreak) : '0 days'}
              subtitle={`Best: ${pluralDays(longestStreakEver)}`}
            >
              <MonthlyStreakBars />
            </StreakSideCard>

            <GoProCard />
          </motion.div>

          {/* Main content */}
          <div className="flex flex-col gap-5">
            {/* Greeting + streak pills + add habit */}
            <motion.div {...stagger(0)} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {greeting()}{firstName ? `, ${firstName}` : ''} 👋
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">Let&apos;s make today amazing!</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <StreakPill
                  icon={<FireIcon size={16} weight="fill" className="text-orange-500" />}
                  iconBg="bg-orange-500/12"
                  value={pluralDays(bestStreak)}
                  label="Current Streak"
                />
                <StreakPill
                  icon={<TrophyIcon size={16} weight="fill" className="text-amber-400" />}
                  iconBg="bg-amber-400/12"
                  value={pluralDays(longestStreakEver)}
                  label="Longest Streak"
                />

                <div className="flex items-stretch overflow-hidden rounded-xl bg-linear-to-r from-primary to-[#8b5cf6] shadow-md shadow-primary/25">
                  <Link
                    to="/habits"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-primary-foreground no-underline hover:opacity-90"
                  >
                    <PlusIcon size={15} weight="bold" />
                    Add Habit
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="More add options"
                        className="flex items-center justify-center border-l border-white/20 px-2 text-primary-foreground hover:bg-white/10"
                      >
                        <CaretDownIcon size={12} weight="bold" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/habits">
                          <TargetIcon size={15} />
                          New Habit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/tasks">
                          <CheckCircleIcon size={15} />
                          New Task
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>

            {/* Stat tiles */}
            <motion.div {...stagger(1)} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                tone="violet"
                icon={<TargetIcon size={18} weight="duotone" className="text-primary" />}
                label="Habits Completed"
                value={`${doneCount}`}
                sub={`${total} total habits`}
                trendPct={habitsTrend}
                sparkline={weeklyData.map((d: { habitsPct: number }) => d.habitsPct)}
              />
              <StatTile
                tone="green"
                icon={<FireIcon size={18} weight="duotone" className="text-green-500" />}
                label="Current Streak"
                value={pluralDays(bestStreak)}
                sub={bestStreak > 0 ? 'Keep it going!' : 'Start a streak'}
                sparkline={weeklyData.map((d: { habitsPct: number }) => d.habitsPct)}
              />
              <StatTile
                tone="orange"
                icon={<ClockIcon size={18} weight="duotone" className="text-orange-500" />}
                label="Focus Time"
                value={formatMinutes(focusMin)}
                sub={tomatoCount > 0 ? `${tomatoCount} sessions` : 'No sessions yet'}
                trendPct={focusTrend}
                sparkline={weeklyData.map((d: { focusMinutes: number }) => d.focusMinutes)}
              />
              <StatTile
                tone="blue"
                icon={<StarIcon size={18} weight="duotone" className="text-blue-500" />}
                label="Total XP"
                value={(user?.xp ?? 0).toLocaleString()}
                sub={`Level ${user?.level ?? 1}`}
                progressPct={xpProgress}
              />
            </motion.div>

            {/* Today's Habits + Weekly Overview */}
            <motion.div {...stagger(2)} className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardContent className="px-4 py-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Today&apos;s Habits</h2>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                      {doneCount}/{total} completed
                    </span>
                  </div>
                  <p className="mb-3 text-[0.72rem] text-muted-foreground">{total} habits</p>
                  <Progress value={pct} className="mb-4 h-2" />

                  {habitsLoading ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-md opacity-50" />)}
                    </div>
                  ) : habits.length === 0 ? (
                    <div className="flex flex-col items-center gap-2.5 py-8 text-center">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted/60">
                        <TargetIcon size={20} weight="duotone" className="text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No habits yet</p>
                      <p className="text-[0.72rem] text-muted-foreground">Add your first habit and start your journey!</p>
                      <Button className="mt-1 gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] hover:opacity-90" asChild>
                        <Link to="/habits">
                          <PlusIcon size={15} weight="bold" />
                          Add New Habit
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-0.5">
                        {habits.map((habit: Habit) => {
                          const isDone = habit.todayLog?.completed ?? false;
                          return (
                            <div
                              key={habit._id}
                              className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-muted/40 transition-colors"
                            >
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleToggle(habit._id, !isDone)}
                                disabled={loggingId === habit._id}
                                aria-label={isDone ? 'Unmark habit' : 'Complete habit'}
                                className={cn(
                                  'flex size-7 shrink-0 items-center justify-center rounded-md',
                                  isDone ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground/50',
                                )}
                              >
                                {isDone
                                  ? <CheckCircleIcon size={17} weight="fill" />
                                  : <CircleIcon size={16} />
                                }
                              </motion.button>

                              <div className="min-w-0 flex-1">
                                <div className={cn(
                                  'truncate text-[0.85rem] font-medium',
                                  isDone ? 'text-muted-foreground line-through decoration-muted-foreground/60' : 'text-foreground',
                                )}>
                                  {habit.title}
                                </div>
                                <div className="truncate text-[0.7rem] text-muted-foreground">
                                  {habitSubtitle(habit)}
                                </div>
                              </div>

                              {(habit.currentStreak ?? 0) > 0 && (
                                <span className="flex shrink-0 items-center gap-1 text-[0.75rem] font-medium text-muted-foreground">
                                  <FireIcon size={13} weight="fill" className="text-orange-500" />
                                  {habit.currentStreak}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <Button className="mt-3 w-full gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] hover:opacity-90" asChild>
                        <Link to="/habits">
                          <PlusIcon size={15} weight="bold" />
                          Add New Habit
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <WeeklyOverviewCard data={weeklyData} />
            </motion.div>

            {/* Pomodoro banner */}
            <motion.div {...stagger(3)}>
              <Card>
                <CardContent className="flex flex-col items-start gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-[#8b5cf6] text-primary-foreground">
                      <HourglassIcon size={19} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Focus better with Pomodoro</p>
                      <p className="text-[0.75rem] text-muted-foreground">
                        Stay focused for {focusDuration} minutes, then take a 5 minute break.
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                    <Button
                      className="flex-1 gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] hover:opacity-90 sm:flex-none"
                      onClick={() => navigate('/focus')}
                    >
                      <PlayIcon size={15} weight="fill" />
                      Start Focus Session
                    </Button>
                    <Select value={focusDuration} onValueChange={setFocusDuration}>
                      <SelectTrigger className="w-24" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="25">25 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageShell>
    </>
  );
}
