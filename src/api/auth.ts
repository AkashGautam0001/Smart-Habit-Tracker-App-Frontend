import axios from 'axios';
import apiClient from './client';
import { ApiResponse, User } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Raw axios for auth endpoints so the 401 interceptor never wraps them
const authAxios = axios.create({ baseURL: BASE_URL, withCredentials: true });

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', data),

  // Uses raw axios — must never go through the 401 interceptor or it recurses infinitely
  refresh: () =>
    authAxios.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  logout: () =>
    authAxios.post<ApiResponse<null>>('/auth/logout'),

  me: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),
};
