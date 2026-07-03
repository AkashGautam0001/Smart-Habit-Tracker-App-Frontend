import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpenIcon, PlusIcon, Pencil, TrashIcon, LockIcon, ArrowSquareOut,
  BookOpenIcon, CodeIcon, BarbellIcon, HeartIcon, RocketIcon, StarIcon, TargetIcon, PaintBrushIcon,
} from '@phosphor-icons/react';
import { usePlan } from '../hooks/usePlan';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { Project } from '../types';

// ── constants ─────────────────────────────────────────────────────────────────
const PROJECT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

const PROJECT_COLOR_BG: Record<string, string> = {
  '#6366f1': 'bg-indigo-500',
  '#22c55e': 'bg-green-500',
  '#f59e0b': 'bg-amber-500',
  '#3b82f6': 'bg-blue-500',
  '#ef4444': 'bg-red-500',
  '#ec4899': 'bg-pink-500',
  '#8b5cf6': 'bg-violet-500',
  '#06b6d4': 'bg-cyan-500',
};

const PROJECT_COLOR_TINT: Record<string, string> = {
  '#6366f1': 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
  '#22c55e': 'bg-green-500/15 text-green-500 border-green-500/30',
  '#f59e0b': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  '#3b82f6': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  '#ef4444': 'bg-red-500/15 text-red-500 border-red-500/30',
  '#ec4899': 'bg-pink-500/15 text-pink-500 border-pink-500/30',
  '#8b5cf6': 'bg-violet-500/15 text-violet-500 border-violet-500/30',
  '#06b6d4': 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30',
};

const PROJECT_PROGRESS_INDICATOR: Record<string, string> = {
  '#6366f1': '[&_[data-slot=progress-indicator]]:bg-indigo-500',
  '#22c55e': '[&_[data-slot=progress-indicator]]:bg-green-500',
  '#f59e0b': '[&_[data-slot=progress-indicator]]:bg-amber-500',
  '#3b82f6': '[&_[data-slot=progress-indicator]]:bg-blue-500',
  '#ef4444': '[&_[data-slot=progress-indicator]]:bg-red-500',
  '#ec4899': '[&_[data-slot=progress-indicator]]:bg-pink-500',
  '#8b5cf6': '[&_[data-slot=progress-indicator]]:bg-violet-500',
  '#06b6d4': '[&_[data-slot=progress-indicator]]:bg-cyan-500',
};

const PROJECT_ICONS = [
  { id: 'FolderOpen', Icon: FolderOpenIcon },
  { id: 'BookOpen',   Icon: BookOpenIcon },
  { id: 'Code',       Icon: CodeIcon },
  { id: 'Barbell',    Icon: BarbellIcon },
  { id: 'Heart',      Icon: HeartIcon },
  { id: 'Rocket',     Icon: RocketIcon },
  { id: 'Star',       Icon: StarIcon },
  { id: 'Target',     Icon: TargetIcon },
  { id: 'PaintBrush', Icon: PaintBrushIcon },
] as const;

type IconId = typeof PROJECT_ICONS[number]['id'];

function projectColorClass(color: string) {
  return PROJECT_COLOR_BG[color.toLowerCase()] ?? 'bg-primary';
}

function projectTintClass(color: string) {
  return PROJECT_COLOR_TINT[color.toLowerCase()] ?? 'bg-primary/15 text-primary border-primary/30';
}

function projectProgressClass(color: string, complete: boolean) {
  if (complete) return '[&_[data-slot=progress-indicator]]:bg-green-500';
  return PROJECT_PROGRESS_INDICATOR[color.toLowerCase()] ?? '[&_[data-slot=progress-indicator]]:bg-primary';
}

function projectTextClass(color: string) {
  const map: Record<string, string> = {
    '#6366f1': 'text-indigo-500',
    '#22c55e': 'text-green-500',
    '#f59e0b': 'text-amber-500',
    '#3b82f6': 'text-blue-500',
    '#ef4444': 'text-red-500',
    '#ec4899': 'text-pink-500',
    '#8b5cf6': 'text-violet-500',
    '#06b6d4': 'text-cyan-500',
  };
  return map[color.toLowerCase()] ?? 'text-primary';
}

function ProjectIcon({ id, size = 20, className }: { id: string; size?: number; className?: string }) {
  const found = PROJECT_ICONS.find((i) => i.id === id);
  if (!found) return <FolderOpenIcon size={size} weight="duotone" className={className} />;
  const { Icon } = found;
  return <Icon size={size} weight="duotone" className={className} />;
}

// ── ProjectForm modal ─────────────────────────────────────────────────────────
interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; color: string; icon: string }) => void;
  initial?: Project;
  isPending?: boolean;
}

function ProjectForm({ open, onClose, onSubmit, initial, isPending }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState(initial?.color ?? '#6366f1');
  const [icon, setIcon] = useState<IconId>((initial?.icon ?? 'FolderOpen') as IconId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), color, icon });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-title">Project Name</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DSA Mastery, React Roadmap"
              autoFocus
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_ICONS.map(({ id, Icon }) => {
                  const selected = icon === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setIcon(id as IconId)}
                      className={cn(
                        'flex size-[34px] cursor-pointer items-center justify-center rounded-lg border-2 transition-colors',
                        selected
                          ? projectTintClass(color)
                          : 'border-border bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon size={16} weight={selected ? 'fill' : 'regular'} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'size-[26px] cursor-pointer rounded-full transition-transform',
                      projectColorClass(c),
                      color === c ? 'scale-110 ring-2 ring-white' : 'scale-100',
                    )}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc">Description (optional)</Label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={2}
              maxLength={500}
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5',
              projectTintClass(color),
            )}
          >
            <div
              className={cn(
                'flex size-[34px] shrink-0 items-center justify-center rounded-lg',
                projectTintClass(color),
              )}
            >
              <ProjectIcon id={icon} size={18} className={projectTextClass(color)} />
            </div>
            <span className="text-[0.88rem] font-semibold text-foreground">
              {title || 'Project Preview'}
            </span>
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending} className="flex-2">
              {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── ProjectCard ───────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const total     = project.taskCount     ?? 0;
  const completed = project.completedCount ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="cursor-pointer gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/30"
        onClick={onView}
      >
        <div className={cn('h-[5px]', projectColorClass(project.color))} />

        <CardContent className="px-[18px] py-4">
          <div className="mb-3 flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-[9px]',
                  projectTintClass(project.color),
                )}
              >
                <ProjectIcon id={project.icon} size={18} className={projectTextClass(project.color)} />
              </div>
              <div>
                <h3 className="mb-0.5 text-[0.92rem] font-semibold leading-tight">{project.title}</h3>
                {project.description && (
                  <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit project">
                <Pencil size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                className="text-destructive opacity-60 hover:text-destructive"
                aria-label="Archive project"
              >
                <TrashIcon size={13} />
              </Button>
            </div>
          </div>

          {total > 0 ? (
            <div className="mb-2.5">
              <div className="mb-1 flex justify-between">
                <span className="text-[0.73rem] text-muted-foreground">{completed}/{total} tasks</span>
                <span
                  className={cn(
                    'text-[0.73rem] font-semibold',
                    pct === 100 ? 'text-green-500' : 'text-muted-foreground',
                  )}
                >
                  {pct}%
                </span>
              </div>
              <Progress
                value={pct}
                className={cn('h-[5px]', projectProgressClass(project.color, pct === 100))}
              />
            </div>
          ) : (
            <p className="mb-2.5 text-[0.76rem] text-muted-foreground">No tasks yet</p>
          )}

          <div className={cn('flex items-center gap-1 text-[0.78rem] font-medium', projectTextClass(project.color))}>
            <ArrowSquareOut size={13} />
            View Tasks
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function Projects() {
  const { canDo } = usePlan();
  const navigate  = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState<Project | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useProjects();
  const create = useCreateProject();
  const upd    = useUpdateProject();
  const del    = useDeleteProject();

  const openNewProjectForm = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  if (!canDo('projects')) {
    return (
      <>
        <Helmet><title>Projects — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>
        <PageShell narrow>
          <PageHeader
            title={
              <span className="flex items-center gap-2.5">
                <FolderOpenIcon size={22} weight="duotone" className="text-primary" />
                Projects
              </span>
            }
          />
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center px-6 py-7 text-center">
              <LockIcon size={32} weight="duotone" className="mb-3 text-primary opacity-60" />
              <h3 className="mb-2 text-base font-bold">Projects — Pro Feature</h3>
              <p className="mb-5 max-w-[340px] text-sm text-muted-foreground">
                Group tasks into projects like &ldquo;DSA Mastery&rdquo;, &ldquo;React Roadmap&rdquo; or &ldquo;English B2&rdquo;. See progress at a glance.
              </p>
              <Button onClick={() => navigate('/upgrade')}>Upgrade to Pro — ₹149/month</Button>
            </CardContent>
          </Card>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Projects — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>

      <ProjectForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        onSubmit={(data) => {
          if (editing) {
            upd.mutate({ id: editing._id, data }, { onSuccess: () => { setFormOpen(false); setEditing(undefined); } });
          } else {
            create.mutate(data, { onSuccess: () => setFormOpen(false) });
          }
        }}
        initial={editing}
        isPending={create.isPending || upd.isPending}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TrashIcon size={24} weight="duotone" />
            </AlertDialogMedia>
            <AlertDialogTitle>Archive this project?</AlertDialogTitle>
            <AlertDialogDescription>
              Tasks will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmDelete) del.mutate(confirmDelete);
                setConfirmDelete(null);
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageShell className="max-w-[860px]">
        <PageHeader
          title={
            <span className="flex items-center gap-2.5">
              <FolderOpenIcon size={22} weight="duotone" className="text-primary" />
              Projects
              <Badge variant="secondary">{projects.length}</Badge>
            </span>
          }
          action={
            <motion.div whileTap={{ scale: 0.96 }} className="inline-flex">
              <Button onClick={openNewProjectForm}>
                <PlusIcon size={15} weight="bold" />
                New Project
              </Button>
            </motion.div>
          }
        />

        {isLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[130px] rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <EmptyState
            icon="FolderOpen"
            title="No projects yet"
            description="Group your tasks by project — DSA Mastery, React Roadmap, English B2…"
            action={{ label: 'Create first project', onClick: () => setFormOpen(true) }}
          />
        )}

        {projects.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
            {projects.map((p) => (
              <ProjectCard
                key={p._id}
                project={p}
                onEdit={() => { setEditing(p); setFormOpen(true); }}
                onDelete={() => setConfirmDelete(p._id)}
                onView={() => navigate(`/tasks?projectId=${p._id}`)}
              />
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}
