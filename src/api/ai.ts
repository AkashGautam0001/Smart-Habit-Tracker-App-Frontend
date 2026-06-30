import { apiClient } from './client';
import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export interface StudyWeek {
  week:            number;
  theme:           string;
  goals:           string[];
  dailySuggestion: string;
}

// Helper for SSE fetch — returns an async generator of text chunks
export async function* streamAI(
  path: string,
  body: Record<string, unknown> = {},
): AsyncGenerator<string> {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload) as { text?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text)  yield parsed.text;
      } catch {
        // ignore malformed SSE lines
      }
    }
  }
}

export const aiApi = {
  studyPlan: (goalTitle: string, durationWeeks: number, subjects: string[]) =>
    apiClient.post('/ai/study-plan', { goalTitle, durationWeeks, subjects }),

  smartReminder: () =>
    apiClient.get('/ai/smart-reminder'),
};
