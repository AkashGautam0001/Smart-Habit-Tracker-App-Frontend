import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PomodoroPhase } from '../config/pomodoro.config';

interface TimerState {
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  currentSessionId: string | null;
  taskId: string | null;
  subject: string | null;
  setPhase: (phase: PomodoroPhase) => void;
  setSecondsLeft: (seconds: number) => void;
  setIsRunning: (running: boolean) => void;
  incrementSession: () => void;
  setCurrentSessionId: (id: string | null) => void;
  setTask: (taskId: string | null, subject: string | null) => void;
  reset: (seconds: number) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      phase: 'focus',
      secondsLeft: 25 * 60,
      isRunning: false,
      sessionCount: 0,
      currentSessionId: null,
      taskId: null,
      subject: null,
      setPhase: (phase) => set({ phase }),
      setSecondsLeft: (secondsLeft) => set({ secondsLeft }),
      setIsRunning: (isRunning) => set({ isRunning }),
      incrementSession: () => set((s) => ({ sessionCount: s.sessionCount + 1 })),
      setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
      setTask: (taskId, subject) => set({ taskId, subject }),
      reset: (seconds) => set({ secondsLeft: seconds, isRunning: false, currentSessionId: null }),
    }),
    {
      name: 'habitflow-timer',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        phase: s.phase,
        secondsLeft: s.secondsLeft,
        sessionCount: s.sessionCount,
        taskId: s.taskId,
        subject: s.subject,
      }),
    }
  )
);
