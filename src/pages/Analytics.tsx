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
import WeeklyReviewCard from '../components/ai/WeeklyReviewCard';

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
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span style={{ color: 'var(--color-accent)', opacity: 0.75 }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  );
}

interface ChartTooltipProps { active?: boolean; payload?: { value: number; name: string }[]; label?: string }
function RangeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: '0.78rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: 'var(--color-text-secondary)' }}>
          {p.name === 'Habits %' ? `✅ ${p.value}% habits` : `⏱ ${p.value} min focus`}
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
    <div className="card" style={{
      padding: '28px 24px',
      textAlign: 'center',
      borderColor: 'rgba(99,102,241,0.3)',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(99,102,241,0.02) 100%)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 10 }}>✨</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Advanced Analytics</h3>
      <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', maxWidth: 380, margin: '0 auto 16px' }}>
        Go beyond the weekly chart. Unlock deep productivity insights with a Pro plan.
      </p>
      <ul style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7, marginBottom: 20, textAlign: 'left' }}>
        {FEATURES.map((f) => (
          <li key={f} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>✓</span> {f}
          </li>
        ))}
      </ul>
      <br />
      <button className="btn btn-primary" onClick={onUpgrade} style={{ marginTop: 8 }}>
        Upgrade to Pro — ₹149/month
      </button>
    </div>
  );
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

  // XAxis interval for range chart
  const xInterval = rangeDays <= 7 ? 0 : rangeDays <= 30 ? 4 : rangeDays <= 90 ? 12 : 30;
  const xKey = rangeDays <= 7 ? 'label' : 'shortLabel';

  const canDoAdvanced = canDo('advancedAnalytics');

  return (
    <>
      <Helmet>
        <title>Analytics — HabitFlow</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ChartBarIcon size={22} weight="duotone" style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Analytics</h1>
          </div>

          {/* Range tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 4 }}>
            {RANGE_OPTIONS.map(({ label, days, proOnly }) => {
              const locked = proOnly && !isPro;
              const active = rangeDays === days;
              return (
                <button
                  key={days}
                  onClick={() => {
                    if (locked) { navigate('/upgrade'); return; }
                    setRangeDays(days as 7 | 30 | 90 | 365);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 400,
                    background: active ? 'var(--color-accent)' : 'transparent',
                    color: active ? '#fff' : locked ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {label}
                  {locked && <LockIcon size={11} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="analytics-stats-grid">
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

        {/* ── Daily activity chart ── */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Daily Activity</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Habits completion % and focus minutes</p>
          </div>

          {rangeQ.isLoading ? (
            <div className="skeleton" style={{ height: 130 }} />
          ) : daily.length === 0 ? (
            <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={daily} barGap={3} barCategoryGap="22%">
                <XAxis
                  dataKey={xKey}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
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
                      fill={d.date === today ? 'var(--color-accent)' : d.habitsPct > 0 ? 'rgba(99,102,241,0.5)' : 'var(--color-surface-hover)'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="focusMinutes" name="Focus min" radius={[3, 3, 0, 0]} maxBarSize={20}>
                  {daily.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.date === today ? '#22c55e' : d.focusMinutes > 0 ? '#22c55e50' : 'var(--color-surface-hover)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Pro analytics section ── */}
        {!canDoAdvanced ? (
          <ProTeaser onUpgrade={() => navigate('/upgrade')} />
        ) : (
          <>
            {/* Heatmap */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Activity Heatmap</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Habits + focus sessions, daily</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setHeatmapYear((y) => y - 1)}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowLeftIcon size={14} />
                  </button>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{heatmapYear}</span>
                  <button
                    onClick={() => setHeatmapYear((y) => Math.min(y + 1, new Date().getFullYear()))}
                    disabled={heatmapYear >= new Date().getFullYear()}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', color: heatmapYear >= new Date().getFullYear() ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', cursor: heatmapYear >= new Date().getFullYear() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              </div>

              {heatmapQ.isLoading ? (
                <div className="skeleton" style={{ height: 120 }} />
              ) : (
                <HeatmapGrid days={heatmapQ.data?.days ?? []} year={heatmapYear} />
              )}
            </div>

            {/* Subject donut + Best hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="analytics-two-col">
              <div className="card" style={{ padding: '18px 20px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Subject Breakdown</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>Time per subject in range</p>
                {subjectsQ.isLoading ? (
                  <div className="skeleton" style={{ height: 200 }} />
                ) : (
                  <SubjectDonut
                    subjects={subjectsQ.data?.subjects ?? []}
                    totalMinutes={subjectsQ.data?.totalMinutes ?? 0}
                  />
                )}
              </div>

              <div className="card" style={{ padding: '18px 20px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Best Focus Hours</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>When you focus most (all-time)</p>
                {hoursQ.isLoading ? (
                  <div className="skeleton" style={{ height: 180 }} />
                ) : (
                  <BestHoursChart hours={hoursQ.data?.hours ?? []} />
                )}
              </div>
            </div>

            {/* Per-habit completion rates */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Habit Completion Rates</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                Days completed in the selected range
              </p>

              {habitStatsQ.isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 40 }} />)}
                </div>
              ) : (habitStatsQ.data?.habits ?? []).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                  No habits tracked yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(habitStatsQ.data?.habits ?? []).map((h) => (
                    <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 28, borderRadius: 4, background: h.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.title}
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-hover)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: 3,
                              width: `${h.rate}%`,
                              background: h.rate >= 80
                                ? 'var(--color-success)'
                                : h.rate >= 50
                                  ? 'var(--color-accent)'
                                  : 'var(--color-warning)',
                              transition: 'width 600ms ease',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>{h.rate}%</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{h.completedDays}/{h.totalDays}d</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Weekly Review */}
            <WeeklyReviewCard date={today} />
          </>
        )}
      </motion.div>
    </>
  );
}
