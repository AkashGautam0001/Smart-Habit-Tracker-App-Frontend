import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapTrifoldIcon, CaretDownIcon, CaretUpIcon, SparkleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { aiApi, type StudyWeek } from '../../api/ai';
import { useSettings } from '../../hooks/useSettings';

export default function StudyPlannerCard() {
  const settings = useSettings();
  const subjects  = settings.subjects.map((s) => s.label);

  const [goalTitle,     setGoalTitle]     = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [selectedSubs,  setSelectedSubs]  = useState<string[]>(subjects.slice(0, 2));
  const [expandedWeek,  setExpandedWeek]  = useState<number | null>(1);
  const [submitted,     setSubmitted]     = useState(false);

  const { data, isLoading, error, refetch } = useQuery<StudyWeek[]>({
    queryKey: ['study-plan', goalTitle, durationWeeks, selectedSubs],
    queryFn:  () =>
      aiApi.studyPlan(goalTitle, durationWeeks, selectedSubs).then((r) => r.data.data.plan),
    enabled: submitted,
    staleTime: Infinity,
  });

  const toggleSub = (sub: string) =>
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub],
    );

  const handleGenerate = () => {
    if (!goalTitle.trim() || selectedSubs.length === 0) return;
    setSubmitted(true);
    setExpandedWeek(1);
    if (submitted) refetch();
  };

  const handleReset = () => {
    setSubmitted(false);
    setGoalTitle('');
    setSelectedSubs(subjects.slice(0, 2));
    setDurationWeeks(4);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(99,102,241,0.06) 100%)',
      border: '1px solid rgba(34,197,94,0.2)',
      borderRadius: 'var(--radius-xl)',
      padding: '18px 20px',
    }}>
      {/* Header */}
      <div style={{ alignItems: 'center', display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{
          alignItems: 'center', background: 'rgba(34,197,94,0.15)', borderRadius: 8,
          color: '#22c55e', display: 'flex', height: 32, justifyContent: 'center', width: 32,
        }}>
          <MapTrifoldIcon size={18} weight="duotone" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--color-text)', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
            AI Study Planner
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', margin: 0 }}>
            Turn your goal into a week-by-week roadmap
          </p>
        </div>
        {submitted && (
          <button
            onClick={handleReset}
            style={{
              background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)',
              borderRadius: 6, color: 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '0.72rem', padding: '4px 10px',
            }}
          >
            New Plan
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Input form */}
        {!submitted && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {/* Goal title */}
            <div>
              <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6 }}>
                Goal
              </label>
              <input
                className="input"
                placeholder="e.g. Master DSA in 3 months"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>

            {/* Duration */}
            <div>
              <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6 }}>
                Duration — {durationWeeks} weeks
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[2, 4, 6, 8, 12].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setDurationWeeks(w)}
                    style={{
                      background: durationWeeks === w ? 'rgba(34,197,94,0.15)' : 'var(--color-surface-hover)',
                      border: `1px solid ${durationWeeks === w ? 'rgba(34,197,94,0.4)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)', color: durationWeeks === w ? '#22c55e' : 'var(--color-text-secondary)',
                      cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                      padding: '5px 10px',
                    }}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects */}
            {subjects.length > 0 && (
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6 }}>
                  Subjects to include
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSub(s)}
                      style={{
                        background: selectedSubs.includes(s) ? 'rgba(99,102,241,0.15)' : 'var(--color-surface-hover)',
                        border: `1px solid ${selectedSubs.includes(s) ? 'rgba(99,102,241,0.4)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)', color: selectedSubs.includes(s) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, padding: '5px 10px',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!goalTitle.trim() || selectedSubs.length === 0}
              style={{
                alignItems: 'center', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 'var(--radius-md)', color: '#22c55e', cursor: 'pointer',
                display: 'flex', fontSize: '0.82rem', fontWeight: 600, gap: 6,
                justifyContent: 'center', opacity: !goalTitle.trim() || selectedSubs.length === 0 ? 0.5 : 1,
                padding: '10px 16px',
              }}
            >
              <SparkleIcon size={15} weight="duotone" />
              Generate Study Plan
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {submitted && isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: 'var(--color-surface-hover)', borderRadius: 8, height: 48, opacity: 0.6 - i * 0.15 }} />
              ))}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.76rem', marginTop: 8, textAlign: 'center' }}>
              Building your {durationWeeks}-week plan…
            </p>
          </motion.div>
        )}

        {/* Error */}
        {submitted && error && !isLoading && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem', margin: '0 0 10px' }}>
              {(error as Error).message}
            </p>
            <button onClick={handleReset} style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.78rem', padding: '6px 12px' }}>
              Try again
            </button>
          </motion.div>
        )}

        {/* Plan accordion */}
        {submitted && data && !isLoading && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>
              {durationWeeks}-week plan for "{goalTitle}"
            </p>
            {data.map((week) => (
              <div
                key={week.week}
                style={{
                  background: 'var(--color-surface-hover)',
                  border: `1px solid ${expandedWeek === week.week ? 'rgba(34,197,94,0.3)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}
              >
                <button
                  onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                  style={{
                    alignItems: 'center', background: 'none', border: 'none',
                    color: 'var(--color-text)', cursor: 'pointer', display: 'flex',
                    gap: 10, justifyContent: 'space-between',
                    padding: '10px 14px', width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      alignItems: 'center', background: 'rgba(34,197,94,0.15)', borderRadius: 6,
                      color: '#22c55e', display: 'flex', flexShrink: 0,
                      fontSize: '0.68rem', fontWeight: 700, height: 22,
                      justifyContent: 'center', padding: '0 6px',
                    }}>
                      W{week.week}
                    </span>
                    <span style={{ color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {week.theme}
                    </span>
                  </div>
                  {expandedWeek === week.week
                    ? <CaretUpIcon size={13} weight="bold" color="var(--color-text-muted)" />
                    : <CaretDownIcon size={13} weight="bold" color="var(--color-text-muted)" />
                  }
                </button>

                <AnimatePresence>
                  {expandedWeek === week.week && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: '1px solid var(--color-border)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase' }}>
                            Goals
                          </p>
                          <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {week.goals.map((g, i) => (
                              <li key={i} style={{ alignItems: 'flex-start', display: 'flex', gap: 6 }}>
                                <span style={{ color: '#22c55e', flexShrink: 0, fontSize: '0.7rem', marginTop: 2 }}>✓</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 6, padding: '7px 10px' }}>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 2px', textTransform: 'uppercase' }}>
                            Daily
                          </p>
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.79rem', margin: 0 }}>
                            {week.dailySuggestion}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
