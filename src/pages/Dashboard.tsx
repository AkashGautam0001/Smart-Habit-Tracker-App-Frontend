import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, CircleIcon, FireIcon, TimerIcon, ListChecksIcon, ArrowRightIcon, PlayIcon } from '@phosphor-icons/react';
import ProgressRing from '../components/shared/ProgressRing';
import WeeklyChart from '../components/shared/WeeklyChart';
import DailyReviewCard from '../components/ai/DailyReviewCard';
import { useHabits, useLogHabit } from '../hooks/useHabits';
import { useTasks, useToggleTask } from '../hooks/useTasks';
import { analyticsApi } from '../api/analytics';
import type { Habit, Task } from '../types';
import { useAuthStore } from '../store/authStore';
import { getLevelProgress, getXPForNextLevel } from '../config/xp.config';
import { APP_CONFIG } from '../config/app.config';
import { usePlan } from '../hooks/usePlan';

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatMinutes(m: number) {
  if (!m) return '—';
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`.trim();
  return `${m}m`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { habits, isLoading: habitsLoading } = useHabits();
  const logHabit = useLogHabit();
  const { user } = useAuthStore();
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const firstName = user?.name?.split(' ')[0] ?? '';

  // Analytics overview (single endpoint — weekly chart, habits pct, focus)
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then((r) => r.data.data),
    staleTime: 60_000,
  });

  // Tasks for today
  const { data: todayTasks = [] } = useTasks(today);
  const toggleTask = useToggleTask(today);
  const incompleteTasks = (todayTasks as Task[]).filter((t) => !t.isCompleted).slice(0, 5);
  const completedTaskCount = (todayTasks as Task[]).filter((t) => t.isCompleted).length;

  const xpProgress = user ? getLevelProgress(user.xp, user.level) : 0;
  const xpForNext  = user ? getXPForNextLevel(user.level) : 0;
  const { isPro } = usePlan();

  // Derive local stats as fallback while overview loads
  const doneCount  = habits.filter((h: Habit) => h.todayLog?.completed).length;
  const total      = habits.length;
  const pct        = overview?.habits.completionPct ?? (total > 0 ? Math.round((doneCount / total) * 100) : 0);
  const bestStreak = habits.reduce((mx: number, h: Habit) => Math.max(mx, h.currentStreak ?? 0), 0);

  const focusMin     = overview?.focus.todayMinutes ?? 0;
  const tomatoCount  = overview?.focus.tomatoCount  ?? 0;
  const weeklyData   = overview?.weekly ?? [];

  const handleToggle = async (id: string, completed: boolean) => {
    setLoggingId(id);
    try { await logHabit.mutateAsync({ id, data: { date: today, completed } }); }
    finally { setLoggingId(null); }
  };

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 + i * 0.05 } });

  return (
    <>
      <Helmet>
        <title>Dashboard | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 840 }}>

        {/* ── Greeting row ── */}
        <motion.div {...stagger(0)}>
          <h1 style={{ color: 'var(--color-text)', fontSize: 'clamp(1.05rem, 3vw, 1.35rem)', fontWeight: 700 }}>
            {greeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* ── Hero: Progress ring + stat chips ── */}
        <motion.div {...stagger(1)} className="card" style={{ padding: '24px 20px' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 24, flexWrap: 'wrap' }}>

            {/* Circular progress */}
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', flexShrink: 0, gap: 6 }}>
              <ProgressRing
                pct={pct}
                size={148}
                color={pct === 100 ? 'var(--color-success)' : 'var(--color-accent)'}
                label="Habits today"
                sublabel={`${overview?.habits.todayDone ?? doneCount}/${total}`}
              />
            </div>

            {/* Stat chips grid */}
            <div style={{ display: 'grid', flex: 1, gap: 10, gridTemplateColumns: 'repeat(2, 1fr)', minWidth: 0 }}>
              {[
                {
                  icon: <FireIcon size={18} weight="duotone" color="#f97316" />,
                  label: 'Best Streak',
                  value: bestStreak > 0 ? `${bestStreak}d` : '—',
                  sub: 'days active',
                },
                {
                  icon: <TimerIcon size={18} weight="duotone" color="var(--color-accent)" />,
                  label: 'Focus Today',
                  value: formatMinutes(focusMin),
                  sub: tomatoCount > 0 ? `🍅 ${tomatoCount} sessions` : 'no sessions yet',
                },
                {
                  icon: <ListChecksIcon size={18} weight="duotone" color="var(--color-success)" />,
                  label: 'Tasks',
                  value: completedTaskCount > 0 || (todayTasks as Task[]).length > 0
                    ? `${completedTaskCount}/${(todayTasks as Task[]).length}`
                    : '—',
                  sub: 'done today',
                },
                {
                  icon: <span style={{ fontSize: '1rem' }}>⭐</span>,
                  label: 'Level',
                  value: user?.level ?? 1,
                  sub: `${(user?.xp ?? 0).toLocaleString()} XP`,
                },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'var(--color-surface-hover)', borderRadius: 10, padding: '12px 12px',
                }}>
                  <div style={{ alignItems: 'center', display: 'flex', gap: 6, marginBottom: 6 }}>
                    {s.icon}
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', fontWeight: 500 }}>{s.label}</span>
                  </div>
                  <div style={{ color: 'var(--color-text)', fontSize: '1.1rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', marginTop: 3 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Weekly overview chart ── */}
        {weeklyData.length > 0 && (
          <motion.div {...stagger(2)} className="card" style={{ padding: '16px 16px 8px' }}>
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600 }}>
                Last 7 Days
              </h2>
              <div style={{ alignItems: 'center', display: 'flex', gap: 14 }}>
                <span style={{ alignItems: 'center', color: 'var(--color-text-muted)', display: 'flex', fontSize: '0.72rem', gap: 4 }}>
                  <span style={{ background: 'var(--color-accent)', borderRadius: 2, display: 'inline-block', height: 8, width: 8 }} /> Habits %
                </span>
                <span style={{ alignItems: 'center', color: 'var(--color-text-muted)', display: 'flex', fontSize: '0.72rem', gap: 4 }}>
                  <span style={{ background: '#22c55e', borderRadius: 2, display: 'inline-block', height: 8, width: 8 }} /> Focus min
                </span>
              </div>
            </div>
            <WeeklyChart data={weeklyData} />
          </motion.div>
        )}

        {/* ── 2-col: Habits quick-complete + Tasks ── */}
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)' }} className="dashboard-cols">

          {/* Habits quick-complete */}
          <motion.div {...stagger(3)}>
            {(habitsLoading || habits.length > 0) && (
              <div className="card" style={{ padding: '16px 14px', height: '100%' }}>
                <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600 }}>Today's Habits</h2>
                  <Link to="/habits" style={{ alignItems: 'center', color: 'var(--color-accent)', display: 'flex', fontSize: '0.75rem', gap: 3, textDecoration: 'none' }}>
                    All <ArrowRightIcon size={12} />
                  </Link>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: 'var(--color-surface-hover)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                      style={{ background: pct === 100 ? 'var(--color-success)' : 'var(--color-accent)', borderRadius: 99, height: '100%' }}
                    />
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', marginTop: 4 }}>
                    {doneCount} of {total} done · {pct}%
                  </div>
                </div>

                {habitsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2, 3].map((i) => <div key={i} style={{ background: 'var(--color-surface-hover)', borderRadius: 6, height: 28, opacity: 0.5 }} />)}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {habits.slice(0, 7).map((habit: Habit) => {
                      const isDone = habit.todayLog?.completed ?? false;
                      return (
                        <div key={habit._id} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                          <div style={{ background: habit.color, borderRadius: 2, flexShrink: 0, height: 18, width: 3 }} />
                          <motion.button whileTap={{ scale: 0.82 }}
                            onClick={() => handleToggle(habit._id, !isDone)}
                            disabled={loggingId === habit._id}
                            style={{ background: 'none', border: 'none', color: isDone ? 'var(--color-success)' : 'var(--color-border)', cursor: 'pointer', display: 'flex', flexShrink: 0, minHeight: 'auto', minWidth: 'auto', padding: 0 }}>
                            {isDone ? <CheckCircleIcon size={18} weight="fill" /> : <CircleIcon size={18} />}
                          </motion.button>
                          <span style={{
                            color: isDone ? 'var(--color-text-muted)' : 'var(--color-text)',
                            flex: 1, fontSize: '0.82rem',
                            overflow: 'hidden', textDecoration: isDone ? 'line-through' : 'none',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {habit.title}
                          </span>
                          {(habit.currentStreak ?? 0) > 1 && (
                            <span style={{ color: '#f97316', flexShrink: 0, fontSize: '0.66rem', fontWeight: 700 }}>
                              🔥{habit.currentStreak}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {habits.length > 7 && (
                      <Link to="/habits" style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 4, textDecoration: 'none' }}>
                        +{habits.length - 7} more →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty habits state */}
            {!habitsLoading && habits.length === 0 && (
              <div className="card" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 10, padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem' }}>🎯</div>
                <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem' }}>Start your first habit</p>
                <Link to="/habits" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>Add a Habit</Link>
              </div>
            )}
          </motion.div>

          {/* Tasks + Focus start panel */}
          <motion.div {...stagger(4)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Tasks */}
            {(todayTasks as Task[]).length > 0 ? (
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h2 style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600 }}>Tasks</h2>
                  <Link to="/tasks" style={{ alignItems: 'center', color: 'var(--color-accent)', display: 'flex', fontSize: '0.75rem', gap: 3, textDecoration: 'none' }}>
                    All <ArrowRightIcon size={12} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {incompleteTasks.map((task: Task) => (
                    <div key={task._id} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                      <motion.button whileTap={{ scale: 0.82 }}
                        onClick={() => toggleTask.mutate(task._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-border)', cursor: 'pointer', display: 'flex', flexShrink: 0, minHeight: 'auto', minWidth: 'auto', padding: 0 }}>
                        <CircleIcon size={16} />
                      </motion.button>
                      <span style={{ color: 'var(--color-text)', flex: 1, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, fontSize: '0.66rem' }}>
                        {'🍅'.repeat(Math.min(task.estimatedPomodoros, 3))}{task.estimatedPomodoros > 3 ? `+` : ''}
                      </span>
                    </div>
                  ))}
                  {completedTaskCount > 0 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginTop: 4 }}>
                      ✅ {completedTaskCount} done today
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>📋</div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>No tasks for today</p>
                <Link to="/tasks" className="btn btn-ghost" style={{ fontSize: '0.78rem', minHeight: 'auto', padding: '6px 14px' }}>
                  Plan your day
                </Link>
              </div>
            )}

            {/* Start focus CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/focus')}
              style={{
                alignItems: 'center',
                background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))',
                border: '1px solid color-mix(in srgb, var(--color-accent) 35%, transparent)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                gap: 6, minHeight: 'auto', minWidth: 'auto',
                padding: '16px', width: '100%',
              }}
            >
              <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                <PlayIcon size={18} weight="fill" color="var(--color-accent)" />
                <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Start Pomodoro
                </span>
              </div>
              {focusMin > 0 && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                  {formatMinutes(overview?.focus.weeklyMinutes ?? 0)} this week
                </span>
              )}
              {focusMin === 0 && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                  25 min focus · 5 min break
                </span>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* ── AI Daily Review (Pro) ── */}
        {isPro && (
          <motion.div {...stagger(5)}>
            <DailyReviewCard date={today} />
          </motion.div>
        )}

        {/* ── XP progress bar ── */}
        {user && (
          <motion.div {...stagger(6)} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 500 }}>
                Level {user.level}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                {user.xp.toLocaleString()} / {xpForNext.toLocaleString()} XP
              </span>
            </div>
            <div style={{ background: 'var(--color-surface-hover)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                style={{
                  background: 'linear-gradient(90deg, var(--color-accent), #8b5cf6)',
                  borderRadius: 99, height: '100%',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
