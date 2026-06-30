import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, CreateTaskPayload, UpdateTaskPayload } from '../api/tasks';
import { useAuthStore } from '../store/authStore';
import { useAchievementStore } from '../store/achievementStore';
import { toast } from '../store/toastStore';
import type { Task } from '../types';

function qKey(date: string) {
  return ['tasks', date];
}

export function useTasks(date: string, projectId?: string) {
  return useQuery<Task[]>({
    queryKey: projectId ? ['tasks', 'project', projectId] : qKey(date),
    queryFn: (): Promise<Task[]> =>
      tasksApi.getAll(projectId ? { projectId } : { date }).then((r) => r.data.data.tasks),
    staleTime: 30_000,
  });
}

export function useCreateTask(date: string, projectId?: string) {
  const qc = useQueryClient();
  const key = projectId ? ['tasks', 'project', projectId] : qKey(date);
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => tasksApi.create({ ...data, date }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success('Task created'); },
    onError:   () => toast.error('Failed to create task'),
  });
}

export function useUpdateTask(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey(date) }),
  });
}

export function useToggleTask(date: string) {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const enqueue = useAchievementStore((s) => s.enqueue);
  return useMutation({
    mutationFn: (id: string) => tasksApi.toggle(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: qKey(date) });
      const d = res.data?.data;
      if (d?.xp !== undefined) {
        const user = useAuthStore.getState().user;
        if (user) setUser({ ...user, xp: d.xp, level: d.level }, accessToken ?? '');
      }
      if (d?.newAchievements?.length) enqueue(d.newAchievements);
    },
  });
}

export function useDeleteTask(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey(date) }); toast.success('Task deleted'); },
    onError:   () => toast.error('Failed to delete task'),
  });
}
