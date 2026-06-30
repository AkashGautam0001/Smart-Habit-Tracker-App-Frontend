import { create } from 'zustand';

export interface Toast {
  id:      string;
  message: string;
  type:    'success' | 'error' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `${Date.now()}-${Math.random()}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers — usable outside React components too
export const toast = {
  success: (message: string) => useToastStore.getState().push({ message, type: 'success' }),
  error:   (message: string) => useToastStore.getState().push({ message, type: 'error' }),
  info:    (message: string) => useToastStore.getState().push({ message, type: 'info' }),
};
