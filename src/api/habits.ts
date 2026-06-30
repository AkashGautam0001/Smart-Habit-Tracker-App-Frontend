import { apiClient } from './client';
import type { ApiResponse, Habit, HabitLog } from '../types';

export interface CreateHabitPayload {
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  targetType: 'yes_no' | 'number' | 'timer';
  targetValue: number;
  frequency: { type: string; days: number[] };
}

export interface LogHabitPayload {
  date: string;
  completed: boolean;
  value?: number;
  note?: string;
}

export const habitsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<{ habits: Habit[] }>>('/habits'),

  create: (data: CreateHabitPayload) =>
    apiClient.post<ApiResponse<{ habit: Habit }>>('/habits', data),

  update: (id: string, data: Partial<CreateHabitPayload>) =>
    apiClient.put<ApiResponse<{ habit: Habit }>>(`/habits/${id}`, data),

  archive: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/habits/${id}`),

  log: (id: string, data: LogHabitPayload) =>
    apiClient.post<ApiResponse<{ log: HabitLog; xp: number; level: number; leveledUp: boolean; newAchievements: string[] }>>(`/habits/${id}/log`, data),

  getLogs: (id: string, params?: { from?: string; to?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ logs: HabitLog[] }>>(`/habits/${id}/logs`, { params }),

  reorder: (ids: string[]) =>
    apiClient.patch<ApiResponse<null>>('/habits/reorder', { ids }),
};
