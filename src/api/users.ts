import apiClient from './client';
import type { ApiResponse, User, UserSettings } from '../types';

export const usersApi = {
  updateProfile: (data: { name?: string; timezone?: string }) =>
    apiClient.put<ApiResponse<{ user: User }>>('/users/profile', data),

  updateSettings: (data: Partial<UserSettings>) =>
    apiClient.put<ApiResponse<{ user: User }>>('/users/settings', data),
};
