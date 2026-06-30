import { apiClient } from './client';

export interface CreateGoalData {
  title: string;
  description?: string;
  color?: string;
  targetDate?: string;
  subjects?: string[];
  milestones?: { title: string; dueDate?: string }[];
}

export const goalsApi = {
  getAll:          ()                                   => apiClient.get('/goals'),
  create:          (data: CreateGoalData)               => apiClient.post('/goals', data),
  update:          (id: string, data: Partial<CreateGoalData>) => apiClient.put(`/goals/${id}`, data),
  delete:          (id: string)                         => apiClient.delete(`/goals/${id}`),
  toggleMilestone: (id: string, milestoneId: string)   => apiClient.patch(`/goals/${id}/milestones/${milestoneId}`),
  addMilestone:    (id: string, title: string)          => apiClient.post(`/goals/${id}/milestones`, { title }),
};
