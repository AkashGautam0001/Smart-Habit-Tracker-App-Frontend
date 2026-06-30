import { apiClient } from './client';

export const analyticsApi = {
  getOverview:   ()                           => apiClient.get('/analytics/overview'),
  getCalendar:   (month: string)              => apiClient.get('/analytics/calendar', { params: { month } }),
  getDay:        (date: string)               => apiClient.get('/analytics/day',      { params: { date } }),
  getRange:      (from: string, to: string)   => apiClient.get('/analytics/range',    { params: { from, to } }),
  getHeatmap:    (year?: number)              => apiClient.get('/analytics/heatmap',  { params: { year } }),
  getSubjects:   (from: string, to: string)   => apiClient.get('/analytics/subjects', { params: { from, to } }),
  getBestHours:  ()                           => apiClient.get('/analytics/best-hours'),
  getHabitStats: (from: string, to: string)   => apiClient.get('/analytics/habits-stats', { params: { from, to } }),
};
