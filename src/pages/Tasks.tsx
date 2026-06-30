import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, CaretLeftIcon, CaretRightIcon, CheckCircleIcon, ArrowLeftIcon, FolderOpenIcon } from '@phosphor-icons/react';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks, useCreateTask, useUpdateTask, useToggleTask, useDeleteTask } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useSettings } from '../hooks/useSettings';
import { usePlan } from '../hooks/usePlan';
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

  // Group tasks by subject; completed go to end
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

  // Daily plan estimate
  const totalEstimated = incomplete.reduce((sum: number, t: Task) => sum + (t.estimatedPomodoros || 1), 0);
  const totalMinutes = totalEstimated * (settings.pomodoroFocusMin || 25);
  const planLabel = totalMinutes >= 60
    ? `~${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m · ${totalEstimated} 🍅`
    : `~${totalMinutes}m · ${totalEstimated} 🍅`;

  const getSubjectColor = (subject: string) =>
    subjectColorMap[subject] ?? 'var(--color-text-muted)';

  return (
    <>
      <Helmet>
        <title>Tasks | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Task form modal */}
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

      {/* Project mode: back button + project header */}
      {projectId && currentProject && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px 12px', fontSize: '0.82rem', fontWeight: 500 }}>
            <ArrowLeftIcon size={14} /> Projects
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: currentProject.color }} />
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>{currentProject.title}</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: 999 }}>
              {tasks.filter((t: Task) => !t.isCompleted).length} remaining
            </span>
          </div>
        </div>
      )}

      {/* Date navigation — hidden in project mode */}
      {!projectId && <div style={{
        alignItems: 'center', display: 'flex', gap: 12,
        justifyContent: 'space-between', marginBottom: 20,
      }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
          <button
            onClick={prevDay}
            style={{
              alignItems: 'center', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 8,
              color: 'var(--color-text-secondary)', cursor: 'pointer',
              display: 'flex', minHeight: 'auto', minWidth: 'auto', padding: 6,
            }}
          >
            <CaretLeftIcon size={16} weight="bold" />
          </button>

          <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            <h1 style={{ color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 700 }}>
              {displayDate(selectedDate)}
            </h1>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                style={{
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  minHeight: 'auto', minWidth: 'auto',
                  padding: '2px 8px',
                }}
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={nextDay}
            style={{
              alignItems: 'center', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 8,
              color: 'var(--color-text-secondary)', cursor: 'pointer',
              display: 'flex', minHeight: 'auto', minWidth: 'auto', padding: 6,
            }}
          >
            <CaretRightIcon size={16} weight="bold" />
          </button>
        </div>

        {/* Add task */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditing(undefined); setFormOpen(true); }}
          className="btn btn-primary"
          style={{ gap: 6, padding: '8px 16px' }}
        >
          <PlusIcon size={16} weight="bold" /> Add Task
        </motion.button>
      </div>}

      {/* Add task button for project mode */}
      {projectId && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEditing(undefined); setFormOpen(true); }} className="btn btn-primary" style={{ gap: 6, padding: '8px 16px' }}>
            <PlusIcon size={16} weight="bold" /> Add Task
          </motion.button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: 60, opacity: 0.4 }} />
          ))}
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: '40px 24px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
          <h2 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
            No tasks for {displayDate(selectedDate).toLowerCase()}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            Plan your session before you start.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setFormOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', gap: 6 }}
          >
            <PlusIcon size={15} weight="bold" /> Add First Task
          </motion.button>
        </motion.div>
      )}

      {/* Tasks by subject */}
      {!isLoading && incomplete.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Daily plan estimate bar */}
          <div style={{
            alignItems: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, display: 'flex',
            fontSize: '0.8rem', gap: 6,
            justifyContent: 'space-between',
            padding: '8px 14px',
          }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Plan estimate</span>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{planLabel}</span>
          </div>

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
                  className="card"
                  style={{ overflow: 'hidden' }}
                >
                  {/* Subject header */}
                  <div style={{
                    alignItems: 'center', background: `color-mix(in srgb, ${color} 8%, var(--color-surface))`,
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex', gap: 8, padding: '10px 14px',
                  }}>
                    <div style={{ background: color, borderRadius: '50%', height: 8, width: 8 }} />
                    <span style={{ color, fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {subject}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>
                      {subjectDone}/{subjectTasks.length}
                    </span>
                  </div>

                  {/* Task list */}
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Completed section */}
      {!isLoading && completed.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 6, marginBottom: 10 }}>
            <CheckCircleIcon size={16} weight="fill" color="var(--color-success)" />
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
              Completed ({completed.length})
            </span>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
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
          </div>
        </div>
      )}
    </>
  );
}
