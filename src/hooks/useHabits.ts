import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi, CreateHabitPayload, LogHabitPayload } from '../api/habits';
import { useAuthStore } from '../store/authStore';
import { useAchievementStore } from '../store/achievementStore';
import { toast } from '../store/toastStore';
import type { Habit } from '../types';

const QUERY_KEY = ['habits'];

export function useHabits() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: (): Promise<Habit[]> => habitsApi.getAll().then((r) => r.data.data.habits),
    staleTime: 30_000,
  });

  return { habits: data ?? [], isLoading, error };
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHabitPayload) => habitsApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Habit created'); },
    onError:   () => toast.error('Failed to create habit'),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHabitPayload> }) =>
      habitsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Habit updated'); },
    onError:   () => toast.error('Failed to update habit'),
  });
}

export function useArchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.archive(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Habit archived'); },
    onError:   () => toast.error('Failed to archive habit'),
  });
}

export function useLogHabit() {
  const qc = useQueryClient();
  const { setUser, user } = useAuthStore();
  const enqueue = useAchievementStore((s) => s.enqueue);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LogHabitPayload }) =>
      habitsApi.log(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      const d = res.data.data;
      if (user) setUser({ ...user, xp: d.xp, level: d.level });
      if (d.newAchievements?.length) enqueue(d.newAchievements);
    },
  });
}
