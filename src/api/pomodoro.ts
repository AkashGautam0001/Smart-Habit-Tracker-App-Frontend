import { apiClient } from './client';
import type { ApiResponse, PomodoroSession } from '../types';

export interface StartSessionPayload {
  type: 'focus' | 'short_break' | 'long_break';
  taskId?: string | null;
  subject?: string;
}

export interface EndSessionPayload {
  wasCompleted: boolean;
}

export interface TodayStats {
  totalMinutes: number;
  sessionCount: number;
  tomatoCount: number;
  subjectBreakdown: { subject: string; minutes: number }[];
}

export const pomodoroApi = {
  start: (data: StartSessionPayload) =>
    apiClient.post<ApiResponse<{ session: PomodoroSession }>>('/pomodoro/sessions', data),

  end: (id: string, data: EndSessionPayload) =>
    apiClient.patch<ApiResponse<{ session: PomodoroSession; xp: number; level: number; leveledUp: boolean; newAchievements: string[] }>>(
      `/pomodoro/sessions/${id}`,
      data,
    ),

  getSessions: (date?: string) =>
    apiClient.get<ApiResponse<{ sessions: PomodoroSession[] }>>('/pomodoro/sessions', {
      params: date ? { date } : undefined,
    }),

  getToday: () =>
    apiClient.get<ApiResponse<TodayStats>>('/pomodoro/today'),
};
