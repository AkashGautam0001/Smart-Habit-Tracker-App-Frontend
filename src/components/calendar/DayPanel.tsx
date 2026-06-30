import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, CircleIcon, XIcon, TimerIcon } from '@phosphor-icons/react';
import { analyticsApi } from '../../api/analytics';

interface Props {
  date: string | null;
  onClose: () => void;
  isMobile: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatMinutes(m: number) {
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`.trim();
  return `${m}m`;
}

export default function DayPanel({ date, onClose, isMobile }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['day-detail', date],
    queryFn: () => date ? analyticsApi.getDay(date).then((r) => r.data.data) : null,
    enabled: !!date,
    staleTime: 60_000,
  });

  const displayDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const completedHabits  = (data?.habits ?? []).filter((h: { completed: boolean }) => h.completed);
  const pendingHabits    = (data?.habits ?? []).filter((h: { completed: boolean }) => !h.completed);
  const doneSessions     = (data?.sessions ?? []).filter((s: { wasCompleted: boolean }) => s.wasCompleted);

  const panelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        alignItems: 'center', borderBottom: '1px solid var(--color-border)',
        display: 'flex', justifyContent: 'space-between',
        padding: '14px 16px', position: 'sticky', top: 0,
        background: 'var(--color-surface)', zIndex: 1,
      }}>
        <div>
          <div style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 600 }}>{displayDate}</div>
          {data && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
              {completedHabits.length}/{data.habits.length} habits · {formatMinutes(data.totalFocusMinutes || 0)} focus
            </div>
          )}
        </div>
        <button onClick={onClose} style={{
          alignItems: 'center', background: 'var(--color-surface-hover)', border: 'none',
          borderRadius: '50%', color: 'var(--color-text-muted)', cursor: 'pointer',
          display: 'flex', height: 28, justifyContent: 'center',
          minHeight: 'auto', minWidth: 'auto', width: 28,
        }}>
          <XIcon size={14} weight="bold" />
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: 'var(--color-surface-hover)', borderRadius: 6, height: 32, opacity: 0.5 }} />
          ))}
        </div>
      )}

      {!isLoading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Focus sessions */}
          {doneSessions.length > 0 && (
            <section style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 16px' }}>
              <div style={{ alignItems: 'center', display: 'flex', gap: 6, marginBottom: 8 }}>
                <TimerIcon size={14} color="var(--color-accent)" />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
                  Focus — {formatMinutes(data.totalFocusMinutes)}
                </span>
              </div>
              {doneSessions.map((s: { startTime: string; subject: string; duration: number }, i: number) => (
                <div key={i} style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: '0.8rem' }}>🍅</span>
                  <span style={{ color: 'var(--color-text)', flex: 1, fontSize: '0.82rem' }}>
                    {s.subject || 'General Focus'}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                    {s.duration}m · {formatTime(s.startTime)}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Habits */}
          {data.habits.length > 0 && (
            <section style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 16px' }}>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>
                Habits ({completedHabits.length}/{data.habits.length})
              </div>
              {[...completedHabits, ...pendingHabits].map((h: { _id: string; color: string; title: string; completed: boolean }) => (
                <div key={h._id} style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 5 }}>
                  <div style={{ background: h.color, borderRadius: 2, flexShrink: 0, height: 16, width: 3 }} />
                  {h.completed
                    ? <CheckCircleIcon size={16} weight="fill" color="var(--color-success)" />
                    : <CircleIcon size={16} color="var(--color-border)" />
                  }
                  <span style={{
                    color: h.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                    flex: 1, fontSize: '0.82rem',
                    textDecoration: h.completed ? 'line-through' : 'none',
                  }}>
                    {h.title}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Tasks */}
          {data.tasks.length > 0 && (
            <section style={{ padding: '12px 16px' }}>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>
                Tasks ({data.tasks.filter((t: { isCompleted: boolean }) => t.isCompleted).length}/{data.tasks.length})
              </div>
              {data.tasks.map((t: { _id: string; title: string; isCompleted: boolean; subject: string }) => (
                <div key={t._id} style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 5 }}>
                  {t.isCompleted
                    ? <CheckCircleIcon size={15} weight="fill" color="var(--color-success)" />
                    : <CircleIcon size={15} color="var(--color-border)" />
                  }
                  <span style={{
                    color: t.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                    flex: 1, fontSize: '0.82rem',
                    textDecoration: t.isCompleted ? 'line-through' : 'none',
                  }}>
                    {t.title}
                  </span>
                  {t.subject && (
                    <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, fontSize: '0.68rem' }}>{t.subject}</span>
                  )}
                </div>
              ))}
            </section>
          )}

          {data.habits.length === 0 && doneSessions.length === 0 && data.tasks.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '24px 16px', textAlign: 'center' }}>
              No activity recorded for this day.
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {date && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ background: 'rgba(0,0,0,0.5)', bottom: 0, left: 0, position: 'fixed', right: 0, top: 0, zIndex: 100 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px 20px 0 0',
                bottom: 0, left: 0, maxHeight: '75dvh',
                overflow: 'hidden', position: 'fixed', right: 0, zIndex: 101,
              }}
            >
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop — inline panel
  return (
    <AnimatePresence>
      {date && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18 }}
          className="card"
          style={{ maxHeight: 600, overflow: 'hidden', position: 'sticky', top: 80 }}
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
