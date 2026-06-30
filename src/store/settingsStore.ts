import { create } from 'zustand';
import { UserSettings } from '../types';

interface SettingsState {
  settings: UserSettings | null;
  setSettings: (settings: UserSettings) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSettings: (patch) =>
    set((s) => ({
      settings: s.settings ? { ...s.settings, ...patch } : null,
    })),
}));
