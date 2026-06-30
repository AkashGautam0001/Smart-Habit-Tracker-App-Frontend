export const POMODORO_DEFAULTS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartNextFocus: false,
  tickSoundEnabled: false,
  alarmSound: 'bell',
} as const;

export type PomodoroPhase = 'focus' | 'short_break' | 'long_break';

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

export const PHASE_COLORS: Record<PomodoroPhase, string> = {
  focus: 'var(--color-accent)',
  short_break: '#22c55e',
  long_break: '#06b6d4',
};

export const ALARM_SOUNDS = [
  { id: 'bell', label: 'Bell', emoji: '🔔' },
  { id: 'chime', label: 'Chime', emoji: '🎵' },
  { id: 'ding', label: 'Ding', emoji: '🔊' },
  { id: 'none', label: 'Silent', emoji: '🔇' },
] as const;
