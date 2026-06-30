import { apiClient } from './client';

export interface CreateProjectData {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const projectsApi = {
  getAll:      ()                                       => apiClient.get('/projects'),
  create:      (data: CreateProjectData)                => apiClient.post('/projects', data),
  update:      (id: string, data: Partial<CreateProjectData>) => apiClient.put(`/projects/${id}`, data),
  delete:      (id: string)                             => apiClient.delete(`/projects/${id}`),
  getTasks:    (id: string)                             => apiClient.get(`/projects/${id}/tasks`),
};
