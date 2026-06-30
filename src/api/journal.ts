import apiClient from './client';
import type { ApiResponse } from '../types';

export interface JournalEntry {
  _id: string;
  date: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  wordCount: number;
  updatedAt: string;
}

export const journalApi = {
  get: (date: string) =>
    apiClient.get<ApiResponse<{ entry: JournalEntry | null }>>('/journal', { params: { date } }),

  save: (data: { date: string; content: string; mood: number | null }) =>
    apiClient.put<ApiResponse<{ entry: JournalEntry }>>('/journal', data),

  history: (from?: string, to?: string) =>
    apiClient.get<ApiResponse<{ entries: JournalEntry[] }>>('/journal/history', {
      params: { from, to },
    }),
};
