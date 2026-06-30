import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi, CreateGoalData } from '../api/goals';
import { toast } from '../store/toastStore';
import type { Goal } from '../types';

const KEY = ['goals'] as const;

export const useGoals = () =>
  useQuery({
    queryKey: KEY,
    queryFn: () => goalsApi.getAll().then((r) => r.data.data.goals as Goal[]),
    staleTime: 30_000,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalData) => goalsApi.create(data).then((r) => r.data.data.goal as Goal),
    onSuccess: (goal) => {
      qc.setQueryData(KEY, (prev: Goal[] | undefined) => [goal, ...(prev ?? [])]);
      toast.success('Goal created');
    },
    onError: () => toast.error('Failed to create goal'),
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalData> }) =>
      goalsApi.update(id, data).then((r) => r.data.data.goal as Goal),
    onSuccess: (updated) => {
      qc.setQueryData(KEY, (prev: Goal[] | undefined) =>
        prev?.map((g) => (g._id === updated._id ? updated : g)) ?? [],
      );
      toast.success('Goal updated');
    },
    onError: () => toast.error('Failed to update goal'),
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData(KEY, (prev: Goal[] | undefined) => prev?.filter((g) => g._id !== id) ?? []);
      toast.success('Goal deleted');
    },
    onError: () => toast.error('Failed to delete goal'),
  });
};

export const useToggleMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      goalsApi.toggleMilestone(goalId, milestoneId).then((r) => r.data.data.goal as Goal),
    onSuccess: (updated) => {
      qc.setQueryData(KEY, (prev: Goal[] | undefined) =>
        prev?.map((g) => (g._id === updated._id ? updated : g)) ?? [],
      );
    },
  });
};
