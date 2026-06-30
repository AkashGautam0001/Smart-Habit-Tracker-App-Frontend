import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

type ExportType = 'habits' | 'sessions' | 'tasks';

export async function downloadExport(type: ExportType, from?: string, to?: string): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to',   to);

  const resp = await fetch(`${BASE}/export/${type}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) throw new Error(`Export failed: ${resp.statusText}`);

  const blob = await resp.blob();
  const url  = URL.createObjectURL(blob);

  const disposition = resp.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `${type}-export.csv`;

  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
