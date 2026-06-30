export interface UserSettings {
  pomodoroFocusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartNextFocus: boolean;
  tickSound: boolean;
  alarmSound: string;
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  sidebarCollapsed: boolean;
  clockFormat: '12h' | '24h';
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  weeklyReportEnabled: boolean;
  dailyGoalHours: number;
  dailyHabitGoal: number;
  theme: string;
  subjects: Array<{ id: string; label: string; color: string }>;
}

export interface UserAchievement {
  id: string;
  unlockedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  plan: 'free' | 'pro';
  planExpiresAt?: string;
  xp: number;
  level: number;
  achievements?: UserAchievement[];
  settings: UserSettings;
  createdAt: string;
}

export interface Habit {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  targetType: 'yes_no' | 'number' | 'timer';
  targetValue: number;
  frequency: { type: string; days: number[] };
  startDate: string;
  isArchived: boolean;
  order: number;
  todayLog?: HabitLog;
  currentStreak?: number;
  longestStreak?: number;
  createdAt: string;
}

export interface HabitLog {
  _id: string;
  habitId: string;
  userId: string;
  date: string;
  value: number;
  completed: boolean;
  note?: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  projectId?: string;
  title: string;
  subject: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  completedAt?: string;
  date: string;
  order: number;
  createdAt: string;
}

export interface PomodoroSession {
  _id: string;
  userId: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  type: 'focus' | 'short_break' | 'long_break';
  subject?: string;
  wasCompleted: boolean;
  createdAt: string;
}

export interface Milestone {
  _id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  targetDate?: string;
  progress: number;
  milestones: Milestone[];
  subjects: string[];
  isCompleted: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  isArchived: boolean;
  order: number;
  taskCount?: number;
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page?: number; total?: number; limit?: number };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}
