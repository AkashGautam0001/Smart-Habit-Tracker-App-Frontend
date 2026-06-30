import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CornersOutIcon, CornersInIcon, BookOpenIcon, ListChecksIcon } from '@phosphor-icons/react';
import TimerRing from '../components/pomodoro/TimerRing';
import TimerControls from '../components/pomodoro/TimerControls';
import BreakModal from '../components/pomodoro/BreakModal';
import SessionCard from '../components/pomodoro/SessionCard';
import SoundPlayer from '../components/shared/SoundPlayer';
import { useTimer } from '../hooks/useTimer';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';
import { pomodoroApi } from '../api/pomodoro';
import { APP_CONFIG } from '../config/app.config';
import { PHASE_LABELS, PHASE_COLORS } from '../config/pomodoro.config';
import type { PomodoroSession, Task } from '../types';

const SESSION_DOTS = 4;

export default function Focus() {
  const timer = useTimer();
  const settings = useSettings();
  const [focusMode, setFocusMode] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [prevPhase, setPrevPhase] = useState(timer.phase);

  // Detect phase change → show break modal
  useEffect(() => {
    if (prevPhase === 'focus' && (timer.phase === 'short_break' || timer.phase === 'long_break')) {
      setShowBreakModal(true);
    }
    if (timer.phase === 'focus') {
      setShowBreakModal(false);
    }
    setPrevPhase(timer.phase);
  }, [timer.phase, prevPhase]);

  // Request notification permission once
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Keyboard: Space = play/pause, F = focus mode, Esc = exit focus mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.isRunning) { timer.pause(); } else { timer.start(); }
      }
      if (e.key === 'f' || e.key === 'F') setFocusMode((f) => !f);
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [timer]);

  // Today's session history
  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: todayTasks = [] } = useTasks(todayDate);
  const incompleteTasks = (todayTasks as Task[]).filter((t) => !t.isCompleted);

  const { data: sessionsData } = useQuery({
    queryKey: ['pomodoro-sessions'],
    queryFn: () => pomodoroApi.getSessions().then((r) => r.data.data.sessions),
    staleTime: 30_000,
  });

  const { data: todayStats } = useQuery({
    queryKey: ['pomodoro-today'],
    queryFn: () => pomodoroApi.getToday().then((r) => r.data.data),
    staleTime: 30_000,
  });

  const focusSessions = (sessionsData ?? []).filter((s: PomodoroSession) => s.type === 'focus');
  const phaseColor = PHASE_COLORS[timer.phase];

  // Session dot markers (completed vs upcoming vs current)
  const dotsInCycle = settings.sessionsUntilLongBreak;
  const completedInCycle = timer.sessionCount % dotsInCycle;

  return (
    <>
      <Helmet>
        <title>
          {timer.isRunning ? `${timer.timeDisplay} – ${PHASE_LABELS[timer.phase]} | ` : ''}
          Focus | {APP_CONFIG.name}
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Break modal overlay */}
      <BreakModal
        open={showBreakModal && !settings.autoStartBreaks}
        phase={timer.phase}
        timeDisplay={timer.timeDisplay}
        sessionCount={timer.sessionCount}
        onSkip={() => { setShowBreakModal(false); timer.skip(); }}
      />

      {/* Focus mode: fullscreen dark overlay hiding all chrome */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              alignItems: 'center',
              background: 'var(--color-bg)',
              bottom: 0, display: 'flex', flexDirection: 'column',
              gap: 32, justifyContent: 'center',
              left: 0, position: 'fixed', right: 0, top: 0,
              zIndex: 150,
            }}
          >
            {/* Phase label */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ color: phaseColor, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {PHASE_LABELS[timer.phase]}
            </motion.div>

            {/* Timer ring */}
            <TimerRing progress={timer.progress} phase={timer.phase} size={280} timeDisplay={timer.timeDisplay} />

            {/* Subject */}
            {timer.subject && (
              <div style={{ alignItems: 'center', color: 'var(--color-text-secondary)', display: 'flex', fontSize: '0.9rem', gap: 6 }}>
                <BookOpenIcon size={16} /> {timer.subject}
              </div>
            )}

            {/* Controls */}
            <TimerControls
              isRunning={timer.isRunning} phase={timer.phase}
              onStart={timer.start} onPause={timer.pause}
              onSkip={timer.skip} onReset={timer.reset}
            />

            {/* Exit focus mode */}
            <button
              onClick={() => setFocusMode(false)}
              style={{
                alignItems: 'center', background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)', borderRadius: 10,
                color: 'var(--color-text-muted)', cursor: 'pointer',
                display: 'flex', fontSize: '0.8rem', gap: 6,
                marginTop: 8, minHeight: 'auto', minWidth: 'auto', padding: '8px 16px',
              }}
            >
              <CornersInIcon size={16} /> Exit Focus Mode <span style={{ color: 'var(--color-border)', fontSize: '0.72rem' }}>Esc</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal page layout */}
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', maxWidth: 860, alignItems: 'start' }}
        className="focus-grid">
        {/* ── Left column: TimerIcon ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Phase tabs */}
          <div style={{
            alignItems: 'center', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10, display: 'flex', overflow: 'hidden', padding: 4, gap: 4,
          }}>
            {(['focus', 'short_break', 'long_break'] as const).map((p) => (
              <button key={p}
                onClick={() => {
                  if (!timer.isRunning) {
                    timer.reset();
                  }
                }}
                style={{
                  background: timer.phase === p ? PHASE_COLORS[p] + '22' : 'transparent',
                  border: `1px solid ${timer.phase === p ? PHASE_COLORS[p] + '60' : 'transparent'}`,
                  borderRadius: 7, color: timer.phase === p ? PHASE_COLORS[p] : 'var(--color-text-muted)',
                  cursor: 'pointer', flex: 1, fontSize: '0.78rem', fontWeight: 600,
                  minHeight: 'auto', minWidth: 'auto', padding: '6px 4px',
                  transition: 'all 0.15s',
                }}
              >
                {PHASE_LABELS[p]}
              </button>
            ))}
          </div>

          {/* Timer card */}
          <div className="card" style={{ padding: '36px 24px', textAlign: 'center' }}>
            {/* Session dots */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
              {Array.from({ length: dotsInCycle }).map((_, i) => (
                <div key={i} style={{
                  background: i < completedInCycle ? phaseColor : 'var(--color-surface-hover)',
                  border: `2px solid ${i < completedInCycle ? phaseColor : 'var(--color-border)'}`,
                  borderRadius: '50%', height: 10, width: 10,
                  transition: 'all 0.3s',
                  boxShadow: i < completedInCycle ? `0 0 6px ${phaseColor}80` : 'none',
                }} />
              ))}
            </div>

            {/* Phase label */}
            <div style={{ color: phaseColor, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
              {PHASE_LABELS[timer.phase]}
            </div>

            {/* Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <TimerRing
                progress={timer.progress}
                phase={timer.phase}
                size={window.innerWidth < 480 ? 200 : 240}
                timeDisplay={timer.timeDisplay}
              />
            </div>

            {/* Controls */}
            <TimerControls
              isRunning={timer.isRunning} phase={timer.phase}
              onStart={timer.start} onPause={timer.pause}
              onSkip={timer.skip} onReset={timer.reset}
            />

            {/* Keyboard hint */}
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 16 }}>
              Space to play/pause · F for focus mode
            </p>
          </div>

          {/* Task selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Subject selector */}
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                value={timer.subject ?? ''}
                onChange={(e) => timer.setTask(null, e.target.value || null)}
                className="input"
                style={{ flex: 1 }}
                aria-label="Select subject"
              >
                <option value="">No subject</option>
                {settings.subjects.map((s) => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))}
              </select>

              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFocusMode(true)}
                style={{
                  alignItems: 'center', background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                  display: 'flex', flexShrink: 0, gap: 6,
                  minHeight: 'auto', minWidth: 'auto', padding: '0 16px',
                  fontSize: '0.85rem',
                }}
              >
                <CornersOutIcon size={16} /> Focus Mode
              </motion.button>
            </div>

            {/* Task picker — shows today's incomplete tasks */}
            {incompleteTasks.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ListChecksIcon size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                <select
                  value={timer.taskId ?? ''}
                  onChange={(e) => {
                    const task = incompleteTasks.find((t) => t._id === e.target.value);
                    timer.setTask(e.target.value || null, task?.subject ?? null);
                  }}
                  className="input"
                  aria-label="Link to task"
                >
                  <option value="">No task linked</option>
                  {incompleteTasks.map((t: Task) => (
                    <option key={t._id} value={t._id}>
                      {t.subject ? `[${t.subject}] ` : ''}{t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: Stats + History ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Focus music */}
          <SoundPlayer />

          {/* Today's stats */}
          <div className="card" style={{ padding: '16px' }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 14 }}>
              Today's Sessions
            </h2>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
              {[
                { label: 'Tomatoes', value: `🍅 ${todayStats?.tomatoCount ?? 0}` },
                { label: 'Focus Time', value: `${todayStats?.totalMinutes ?? 0} min` },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--color-surface-hover)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Subject breakdown */}
            {(todayStats?.subjectBreakdown?.length ?? 0) > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {todayStats!.subjectBreakdown.map(({ subject, minutes }) => (
                  <div key={subject} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', flex: 1 }}>{subject}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{minutes}m</span>
                    <div style={{ background: 'var(--color-surface-hover)', borderRadius: 99, height: 4, width: 60, overflow: 'hidden' }}>
                      <div style={{
                        background: phaseColor, borderRadius: 99, height: '100%',
                        width: `${Math.min(100, (minutes / (todayStats!.totalMinutes || 1)) * 100)}%`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session history */}
          {focusSessions.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 14px' }}>
                <h2 style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600 }}>Session History</h2>
              </div>
              <div>
                <AnimatePresence>
                  {focusSessions.slice(0, 8).map((s: PomodoroSession, i) => (
                    <motion.div key={s._id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}>
                      <SessionCard session={s} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {focusSessions.length === 0 && !timer.isRunning && (
            <div className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>🍅</div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Start your first focus session today!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
