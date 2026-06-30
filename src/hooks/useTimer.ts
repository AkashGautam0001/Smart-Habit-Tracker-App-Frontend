import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTimerStore } from '../store/timerStore';
import { useSettings } from './useSettings';
import { pomodoroApi } from '../api/pomodoro';
import { useAuthStore } from '../store/authStore';
import { useAchievementStore } from '../store/achievementStore';
import type { PomodoroPhase } from '../config/pomodoro.config';
import { PHASE_LABELS } from '../config/pomodoro.config';

function notify(title: string, body: string) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192x192.png' });
  }
}

export function useTimer() {
  const store = useTimerStore();
  const settings = useSettings();
  const { setUser, user } = useAuthStore();
  const enqueue = useAchievementStore((s) => s.enqueue);
  const qc = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseDuration = useCallback((phase: PomodoroPhase): number => {
    if (phase === 'focus')       return settings.pomodoroFocusMin * 60;
    if (phase === 'long_break')  return settings.longBreakMin * 60;
    return settings.shortBreakMin * 60;
  }, [settings]);

  const nextPhase = useCallback((currentPhase: PomodoroPhase, sessionCount: number): PomodoroPhase => {
    if (currentPhase !== 'focus') return 'focus';
    const nextCount = sessionCount + 1;
    return nextCount % settings.sessionsUntilLongBreak === 0 ? 'long_break' : 'short_break';
  }, [settings.sessionsUntilLongBreak]);

  // Phase complete handler — reads state via getState() to avoid stale closures
  const handlePhaseComplete = useCallback(async () => {
    const { phase, currentSessionId, taskId, subject, sessionCount } = useTimerStore.getState();

    if (phase === 'focus') {
      // End the DB session
      if (currentSessionId) {
        try {
          const res = await pomodoroApi.end(currentSessionId, { wasCompleted: true });
          const d = res.data.data;
          if (user) setUser({ ...user, xp: d.xp, level: d.level });
          if (d.newAchievements?.length) enqueue(d.newAchievements);
          qc.invalidateQueries({ queryKey: ['pomodoro-today'] });
          qc.invalidateQueries({ queryKey: ['pomodoro-sessions'] });
        } catch (_) { /* session ended despite error */ }
      }

      useTimerStore.getState().incrementSession();
      const next = nextPhase(phase, sessionCount);
      const secs = phaseDuration(next);
      useTimerStore.getState().setPhase(next);
      useTimerStore.getState().setCurrentSessionId(null);

      notify(`${PHASE_LABELS[next]} Time!`, next === 'long_break' ? 'Great work! Take a long break.' : 'Take a short 5-minute break.');
      navigator.vibrate?.([100, 50, 100]);

      if (settings.autoStartBreaks) {
        // Start break session in DB
        try {
          const res = await pomodoroApi.start({ type: next, taskId, subject: subject ?? '' });
          useTimerStore.getState().setCurrentSessionId(res.data.data.session._id);
        } catch (_) { /* swallow — best-effort API call */ }
        useTimerStore.getState().setSecondsLeft(secs);
        useTimerStore.getState().setIsRunning(true);
      } else {
        useTimerStore.getState().reset(secs);
      }
    } else {
      // Break complete — switch back to focus
      if (currentSessionId) {
        pomodoroApi.end(currentSessionId, { wasCompleted: true }).catch(() => {});
      }
      const secs = phaseDuration('focus');
      useTimerStore.getState().setPhase('focus');
      useTimerStore.getState().setCurrentSessionId(null);

      notify('Focus Time!', 'Break is over. Ready to get back to work?');
      navigator.vibrate?.([100]);

      if (settings.autoStartNextFocus) {
        try {
          const res = await pomodoroApi.start({ type: 'focus', taskId, subject: subject ?? '' });
          useTimerStore.getState().setCurrentSessionId(res.data.data.session._id);
        } catch (_) { /* swallow — best-effort API call */ }
        useTimerStore.getState().setSecondsLeft(secs);
        useTimerStore.getState().setIsRunning(true);
      } else {
        useTimerStore.getState().reset(secs);
      }
    }
  }, [phaseDuration, nextPhase, settings.autoStartBreaks, settings.autoStartNextFocus, qc, user, setUser]);

  // Interval tick
  useEffect(() => {
    if (!store.isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const secs = useTimerStore.getState().secondsLeft;
      if (secs <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        useTimerStore.getState().setSecondsLeft(0);
        useTimerStore.getState().setIsRunning(false);
        handlePhaseComplete();
      } else {
        useTimerStore.getState().setSecondsLeft(secs - 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [store.isRunning, handlePhaseComplete]);

  // ── Public actions ──────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    const { phase, taskId, subject, currentSessionId } = useTimerStore.getState();
    if (currentSessionId) {
      // Already has a session (resumed) — just resume ticking
      useTimerStore.getState().setIsRunning(true);
      return;
    }
    try {
      const res = await pomodoroApi.start({ type: phase, taskId, subject: subject ?? '' });
      useTimerStore.getState().setCurrentSessionId(res.data.data.session._id);
    } catch (_) {
      // Allow offline/server-down operation — timer still works
    }
    useTimerStore.getState().setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    useTimerStore.getState().setIsRunning(false);
  }, []);

  const skip = useCallback(async () => {
    const { phase, currentSessionId, taskId, subject, sessionCount } = useTimerStore.getState();
    useTimerStore.getState().setIsRunning(false);

    if (currentSessionId) {
      pomodoroApi.end(currentSessionId, { wasCompleted: false }).catch(() => {});
    }

    const next = phase === 'focus' ? nextPhase(phase, sessionCount) : 'focus';
    if (phase === 'focus') useTimerStore.getState().incrementSession();

    const secs = phaseDuration(next);
    useTimerStore.getState().setPhase(next);
    useTimerStore.getState().setCurrentSessionId(null);
    useTimerStore.getState().reset(secs);

    // Auto-start next if configured
    if ((next !== 'focus' && settings.autoStartBreaks) || (next === 'focus' && settings.autoStartNextFocus)) {
      try {
        const res = await pomodoroApi.start({ type: next, taskId, subject: subject ?? '' });
        useTimerStore.getState().setCurrentSessionId(res.data.data.session._id);
        useTimerStore.getState().setIsRunning(true);
      } catch (_) { /* swallow — best-effort API call */ }
    }
  }, [nextPhase, phaseDuration, settings]);

  const reset = useCallback(async () => {
    const { currentSessionId, phase } = useTimerStore.getState();
    useTimerStore.getState().setIsRunning(false);
    if (currentSessionId) {
      pomodoroApi.end(currentSessionId, { wasCompleted: false }).catch(() => {});
    }
    const secs = phaseDuration(phase);
    useTimerStore.getState().reset(secs);
  }, [phaseDuration]);

  const setTask = useCallback((taskId: string | null, subject: string | null) => {
    store.setTask(taskId, subject);
  }, [store]);

  const totalSeconds = phaseDuration(store.phase);
  const progress = totalSeconds > 0 ? 1 - store.secondsLeft / totalSeconds : 0;

  const mm = String(Math.floor(store.secondsLeft / 60)).padStart(2, '0');
  const ss = String(store.secondsLeft % 60).padStart(2, '0');
  const timeDisplay = `${mm}:${ss}`;

  return {
    phase: store.phase,
    secondsLeft: store.secondsLeft,
    isRunning: store.isRunning,
    sessionCount: store.sessionCount,
    currentSessionId: store.currentSessionId,
    taskId: store.taskId,
    subject: store.subject,
    totalSeconds,
    progress,
    timeDisplay,
    start,
    pause,
    skip,
    reset,
    setTask,
  };
}
