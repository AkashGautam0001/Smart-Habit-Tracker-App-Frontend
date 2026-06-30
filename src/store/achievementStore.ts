import { create } from 'zustand';
import { ACHIEVEMENT_MAP, AchievementDef } from '../config/achievements.config';

interface AchievementStore {
  queue: AchievementDef[];
  enqueue: (ids: string[]) => void;
  dequeue: () => void;
}

export const useAchievementStore = create<AchievementStore>((set) => ({
  queue: [],
  enqueue: (ids) => {
    const defs = ids
      .map((id) => ACHIEVEMENT_MAP[id])
      .filter((d): d is AchievementDef => !!d);
    if (defs.length) set((s) => ({ queue: [...s.queue, ...defs] }));
  },
  dequeue: () => set((s) => ({ queue: s.queue.slice(1) })),
}));
