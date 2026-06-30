import { apiClient } from './client';

export interface CreateTaskPayload {
  title: string;
  subject: string;
  estimatedPomodoros: number;
  date?: string;
  projectId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  subject?: string;
  estimatedPomodoros?: number;
  date?: string;
  order?: number;
  projectId?: string | null;
}

export const tasksApi = {
  getAll: (params?: { date?: string; projectId?: string }) =>
    apiClient.get('/tasks', { params }),

  create: (data: CreateTaskPayload) =>
    apiClient.post('/tasks', data),

  update: (id: string, data: UpdateTaskPayload) =>
    apiClient.put(`/tasks/${id}`, data),

  toggle: (id: string) =>
    apiClient.patch(`/tasks/${id}/toggle`),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),

  reorder: (ids: string[]) =>
    apiClient.patch('/tasks/reorder', { ids }),
};
