import { useAuthStore } from '../store/authStore';
import { POMODORO_DEFAULTS } from '../config/pomodoro.config';
import { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  pomodoroFocusMin: POMODORO_DEFAULTS.focusMinutes,
  shortBreakMin: POMODORO_DEFAULTS.shortBreakMinutes,
  longBreakMin: POMODORO_DEFAULTS.longBreakMinutes,
  sessionsUntilLongBreak: POMODORO_DEFAULTS.sessionsUntilLongBreak,
  autoStartBreaks: false,
  autoStartNextFocus: false,
  tickSound: false,
  alarmSound: 'bell',
  accentColor: '#6366f1',
  fontSize: 'md',
  sidebarCollapsed: false,
  clockFormat: '12h',
  notificationsEnabled: true,
  dailyReminderTime: '20:00',
  weeklyReportEnabled: true,
  dailyGoalHours: 4,
  dailyHabitGoal: 5,
  theme: 'default',
  subjects: [
    { id: 'dsa', label: 'DSA', color: '#6366f1' },
    { id: 'react', label: 'React', color: '#3b82f6' },
    { id: 'backend', label: 'Backend', color: '#22c55e' },
    { id: 'english', label: 'English', color: '#f59e0b' },
  ],
};

export const useSettings = (): UserSettings => {
  const user = useAuthStore((s) => s.user);
  return user?.settings ?? DEFAULT_SETTINGS;
};
