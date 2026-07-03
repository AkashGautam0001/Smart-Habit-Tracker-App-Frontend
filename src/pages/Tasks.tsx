import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@phosphor-icons/react';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks, useCreateTask, useUpdateTask, useToggleTask, useDeleteTask } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useSettings } from '../hooks/useSettings';
import { usePlan } from '../hooks/usePlan';
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '../config/app.config';
import type { Task } from '../types';

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function displayDate(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const ds = dateStr(d);
  if (ds === dateStr(today)) return 'Today';
  if (ds === dateStr(yesterday)) return 'Yesterday';
  if (ds === dateStr(tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

function SubjectDot({ color, className }: { color: string; className?: string }) {
  return (
    <svg
      width={8}
      height={8}
      viewBox="0 0 8 8"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <circle cx={4} cy={4} r={4} fill={color} />
    </svg>
  );
}

export default function Tasks() {
  const settings = useSettings();
  const { isPro } = usePlan();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  const dateKey = dateStr(selectedDate);
  const { data: tasks = [], isLoading } = useTasks(dateKey, projectId);
  const createTask = useCreateTask(dateKey, projectId);
  const updateTask = useUpdateTask(dateKey);
  const toggleTask = useToggleTask(dateKey);
  const deleteTask = useDeleteTask(dateKey);

  const { data: projects = [] } = useProjects();
  const currentProject = projects.find((p) => p._id === projectId);

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const isToday = dateStr(selectedDate) === dateStr(new Date());

  const { subjectMap, incomplete, completed } = useMemo(() => {
    const incomplete = tasks.filter((t: Task) => !t.isCompleted);
    const completed = tasks.filter((t: Task) => t.isCompleted);

    const subjectMap = new Map<string, Task[]>();
    incomplete.forEach((t: Task) => {
      const key = t.subject || 'General';
      if (!subjectMap.has(key)) subjectMap.set(key, []);
      subjectMap.get(key)!.push(t);
    });

    return { subjectMap, incomplete, completed };
  }, [tasks]);

  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    settings.subjects.forEach((s) => { map[s.label] = s.color; });
    return map;
  }, [settings.subjects]);

  const totalEstimated = incomplete.reduce((sum: number, t: Task) => sum + (t.estimatedPomodoros || 1), 0);
  const totalMinutes = totalEstimated * (settings.pomodoroFocusMin || 25);
  const planLabel = totalMinutes >= 60
    ? `~${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m · ${totalEstimated} sessions`
    : `~${totalMinutes}m · ${totalEstimated} sessions`;

  const getSubjectColor = (subject: string) =>
    subjectColorMap[subject] ?? '#71717a';

  const remainingCount = tasks.filter((t: Task) => !t.isCompleted).length;

  const openNewTaskForm = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const addTaskButton = (
    <motion.div whileTap={{ scale: 0.95 }} className="inline-flex">
      <Button onClick={openNewTaskForm}>
        <PlusIcon size={16} weight="bold" />
        Add Task
      </Button>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Tasks | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        onSubmit={(data) => {
          if (editing) {
            updateTask.mutate(
              { id: editing._id, data },
              { onSuccess: () => { setFormOpen(false); setEditing(undefined); } },
            );
          } else {
            createTask.mutate(
              projectId ? { ...data, projectId } : data,
              { onSuccess: () => setFormOpen(false) },
            );
          }
        }}
        initial={editing}
        isPending={createTask.isPending || updateTask.isPending}
        projects={isPro ? projects : undefined}
      />

      <PageShell>
        {projectId && currentProject && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              <ArrowLeftIcon size={14} />
              Projects
            </Button>

            <PageHeader
              title={
                <span className="flex items-center gap-2">
                  <SubjectDot color={currentProject.color} className="size-3" />
                  {currentProject.title}
                </span>
              }
              description={
                <Badge variant="secondary">{remainingCount} remaining</Badge>
              }
              action={addTaskButton}
            />
          </div>
        )}

        {!projectId && (
          <PageHeader
            title={
              <span className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" onClick={prevDay} aria-label="Previous day">
                  <CaretLeftIcon size={16} weight="bold" />
                </Button>
                {displayDate(selectedDate)}
                {!isToday && (
                  <Button variant="secondary" size="xs" onClick={() => setSelectedDate(new Date())}>
                    Today
                  </Button>
                )}
                <Button variant="outline" size="icon-sm" onClick={nextDay} aria-label="Next day">
                  <CaretRightIcon size={16} weight="bold" />
                </Button>
              </span>
            }
            action={addTaskButton}
          />
        )}

        {isLoading && (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <EmptyState
              icon="ListChecks"
              title={`No tasks for ${displayDate(selectedDate).toLowerCase()}`}
              description="Plan your session before you start."
              action={{ label: 'Add First Task', onClick: () => setFormOpen(true) }}
            />
          </motion.div>
        )}

        {!isLoading && incomplete.length > 0 && (
          <div className="flex flex-col gap-3.5">
            <Card size="sm">
              <CardContent className="flex items-center justify-between py-0">
                <span className="text-sm text-muted-foreground">Plan estimate</span>
                <span className="text-sm font-semibold text-foreground">{planLabel}</span>
              </CardContent>
            </Card>

            <AnimatePresence mode="popLayout">
              {Array.from(subjectMap.entries()).map(([subject, subjectTasks]) => {
                const color = getSubjectColor(subject);
                const subjectDone = subjectTasks.filter((t) => t.isCompleted).length;

                return (
                  <motion.div
                    key={subject}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="overflow-hidden py-0">
                      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3.5 py-2.5">
                        <SubjectDot color={color} />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {subject}
                        </span>
                        <Badge variant="secondary" className="ml-auto">
                          {subjectDone}/{subjectTasks.length}
                        </Badge>
                      </div>

                      <AnimatePresence>
                        {subjectTasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            subjectColor={color}
                            onToggle={() => toggleTask.mutate(task._id)}
                            onEdit={() => { setEditing(task); setFormOpen(true); }}
                            onDelete={() => deleteTask.mutate(task._id)}
                          />
                        ))}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && completed.length > 0 && (
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon size={16} weight="fill" className="text-chart-2" />
              <span className="text-sm font-semibold text-muted-foreground">
                Completed ({completed.length})
              </span>
            </div>

            <Card className="overflow-hidden py-0">
              <AnimatePresence>
                {completed.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    subjectColor={getSubjectColor(task.subject)}
                    onToggle={() => toggleTask.mutate(task._id)}
                    onEdit={() => { setEditing(task); setFormOpen(true); }}
                    onDelete={() => deleteTask.mutate(task._id)}
                  />
                ))}
              </AnimatePresence>
            </Card>
          </div>
        )}
      </PageShell>
    </>
  );
}
