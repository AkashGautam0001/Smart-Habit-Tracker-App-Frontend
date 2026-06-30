import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, CreateProjectData } from '../api/projects';
import type { Project, Task } from '../types';

const KEY = ['projects'] as const;

export const useProjects = () =>
  useQuery({
    queryKey: KEY,
    queryFn: () => projectsApi.getAll().then((r) => r.data.data.projects as Project[]),
    staleTime: 30_000,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectData) =>
      projectsApi.create(data).then((r) => r.data.data.project as Project),
    onSuccess: (project) => {
      qc.setQueryData(KEY, (prev: Project[] | undefined) => [...(prev ?? []), project]);
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectData> }) =>
      projectsApi.update(id, data).then((r) => r.data.data.project as Project),
    onSuccess: (updated) => {
      qc.setQueryData(KEY, (prev: Project[] | undefined) =>
        prev?.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)) ?? [],
      );
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData(KEY, (prev: Project[] | undefined) => prev?.filter((p) => p._id !== id) ?? []);
    },
  });
};

export const useProjectTasks = (projectId: string | null) =>
  useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () =>
      projectsApi.getTasks(projectId!).then(
        (r) => r.data.data as { project: Project; tasks: Task[] },
      ),
    enabled: !!projectId,
    staleTime: 15_000,
  });
