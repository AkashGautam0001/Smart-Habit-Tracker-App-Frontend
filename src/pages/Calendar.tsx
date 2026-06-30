import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import CalendarGrid from '../components/calendar/CalendarGrid';
import DayPanel from '../components/calendar/DayPanel';
import { analyticsApi } from '../api/analytics';
import { APP_CONFIG } from '../config/app.config';

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function Calendar() {
  const [current, setCurrent]       = useState(() => new Date());
  const [selectedDate, setSelected] = useState<string | null>(null);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const mk = monthKey(current);
  const { data, isLoading } = useQuery({
    queryKey: ['calendar', mk],
    queryFn: () => analyticsApi.getCalendar(mk).then((r) => r.data.data),
    staleTime: 2 * 60_000,
  });

  const prevMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
    setSelected(null);
  };

  const nextMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
    setSelected(null);
  };

  const isThisMonth = monthKey(current) === monthKey(new Date());

  // Quick month stats
  const days = data?.days ?? [];
  const activeDays = days.filter((d: { habitsPct: number; focusMinutes: number }) => d.habitsPct > 0 || d.focusMinutes > 0).length;
  const totalFocus = days.reduce((s: number, d: { focusMinutes: number }) => s + d.focusMinutes, 0);
  const perfectDays = days.filter((d: { habitsPct: number }) => d.habitsPct === 100).length;

  return (
    <>
      <Helmet>
        <title>Calendar | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: selectedDate && !isMobile ? '1fr 300px' : '1fr', maxWidth: 900 }}>

        {/* ── Left: calendar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Month navigation */}
          <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth}
                style={{ alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', minHeight: 'auto', minWidth: 'auto', padding: 7 }}>
                <CaretLeftIcon size={15} weight="bold" />
              </motion.button>

              <h1 style={{ color: 'var(--color-text)', fontSize: '1.15rem', fontWeight: 700, minWidth: 160, textAlign: 'center' }}>
                {monthLabel(current)}
              </h1>

              <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth}
                style={{ alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', minHeight: 'auto', minWidth: 'auto', padding: 7 }}>
                <CaretRightIcon size={15} weight="bold" />
              </motion.button>
            </div>

            {!isThisMonth && (
              <button
                onClick={() => { setCurrent(new Date()); setSelected(null); }}
                style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 7, color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, minHeight: 'auto', minWidth: 'auto', padding: '5px 12px' }}
              >
                Today
              </button>
            )}
          </div>

          {/* Stats row */}
          {!isLoading && days.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[
                { label: 'Active days',  value: activeDays },
                { label: 'Perfect days', value: perfectDays },
                { label: 'Focus time',   value: totalFocus >= 60 ? `${Math.floor(totalFocus / 60)}h` : `${totalFocus}m` },
              ].map((s) => (
                <div key={s.label} className="card" style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-text)', fontSize: '1.1rem', fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Calendar grid */}
          <div className="card" style={{ padding: 16 }}>
            {isLoading ? (
              <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '1', background: 'var(--color-surface-hover)', borderRadius: 6, opacity: 0.4 }} />
                ))}
              </div>
            ) : (
              <CalendarGrid
                days={days}
                selectedDate={selectedDate}
                onSelect={(d) => setSelected((prev) => prev === d ? null : d)}
              />
            )}
          </div>
        </div>

        {/* ── Right: Day panel (desktop inline, mobile bottom sheet) ── */}
        <DayPanel
          date={selectedDate}
          onClose={() => setSelected(null)}
          isMobile={isMobile}
        />
      </div>
    </>
  );
}
