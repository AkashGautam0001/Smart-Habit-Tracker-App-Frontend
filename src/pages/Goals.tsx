import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TargetIcon, PlusIcon, XIcon, CheckCircleIcon, CircleIcon, Pencil, TrashIcon,
  CalendarBlank, CaretDownIcon, CaretUpIcon, LockIcon,
} from '@phosphor-icons/react';
import { usePlan } from '../hooks/usePlan';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useToggleMilestone } from '../hooks/useGoals';
import { useSettings } from '../hooks/useSettings';
import StudyPlannerCard from '../components/ai/StudyPlannerCard';
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
import { Separator } from '@/components/ui/separator';
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
import type { Goal, Milestone } from '../types';

// ── constants ─────────────────────────────────────────────────────────────────
const GOAL_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

const GOAL_COLOR_BG: Record<string, string> = {
  '#6366f1': 'bg-indigo-500',
  '#22c55e': 'bg-green-500',
  '#f59e0b': 'bg-amber-500',
  '#3b82f6': 'bg-blue-500',
  '#ef4444': 'bg-red-500',
  '#ec4899': 'bg-pink-500',
  '#8b5cf6': 'bg-violet-500',
  '#06b6d4': 'bg-cyan-500',
};

const GOAL_PROGRESS_INDICATOR: Record<string, string> = {
  '#6366f1': '[&_[data-slot=progress-indicator]]:bg-indigo-500',
  '#22c55e': '[&_[data-slot=progress-indicator]]:bg-green-500',
  '#f59e0b': '[&_[data-slot=progress-indicator]]:bg-amber-500',
  '#3b82f6': '[&_[data-slot=progress-indicator]]:bg-blue-500',
  '#ef4444': '[&_[data-slot=progress-indicator]]:bg-red-500',
  '#ec4899': '[&_[data-slot=progress-indicator]]:bg-pink-500',
  '#8b5cf6': '[&_[data-slot=progress-indicator]]:bg-violet-500',
  '#06b6d4': '[&_[data-slot=progress-indicator]]:bg-cyan-500',
};

function goalColorClass(color: string) {
  return GOAL_COLOR_BG[color.toLowerCase()] ?? 'bg-primary';
}

function goalProgressClass(color: string, complete: boolean) {
  if (complete) return '[&_[data-slot=progress-indicator]]:bg-green-500';
  return GOAL_PROGRESS_INDICATOR[color.toLowerCase()] ?? '[&_[data-slot=progress-indicator]]:bg-primary';
}

function fmtDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

// ── GoalForm modal ────────────────────────────────────────────────────────────
interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string; description: string; color: string;
    targetDate: string; subjects: string[];
    milestones: { title: string }[];
  }) => void;
  initial?: Goal;
  isPending?: boolean;
  availableSubjects: string[];
}

function GoalForm({ open, onClose, onSubmit, initial, isPending, availableSubjects }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [targetDate, setTargetDate] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<string[]>(['']);

  // Reset when opening
  useState(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setColor(initial?.color ?? '#6366f1');
    setTargetDate(initial?.targetDate ? initial.targetDate.slice(0, 10) : '');
    setSubjects(initial?.subjects ?? []);
    setMilestones(initial?.milestones?.map((m) => m.title) ?? ['']);
  });

  const toggleSubject = (s: string) =>
    setSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleMilestone = (i: number, val: string) =>
    setMilestones((ms) => ms.map((m, idx) => idx === i ? val : m));

  const addMilestone = () => setMilestones((ms) => [...ms, '']);
  const removeMilestone = (i: number) => setMilestones((ms) => ms.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      color,
      targetDate,
      subjects,
      milestones: milestones.filter((m) => m.trim()).map((m) => ({ title: m.trim() })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Goal' : 'New Goal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master DSA in 3 months"
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-[26px] cursor-pointer rounded-full transition-transform',
                    goalColorClass(c),
                    color === c ? 'scale-110 ring-2 ring-white' : 'scale-100',
                  )}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-date">Target Date (optional)</Label>
            <Input
              id="goal-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="dark:scheme-dark"
            />
          </div>

          {availableSubjects.length > 0 && (
            <div className="space-y-2">
              <Label>Subjects</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableSubjects.map((s) => {
                  const selected = subjects.includes(s);
                  return (
                    <Button
                      key={s}
                      type="button"
                      variant={selected ? 'secondary' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-7 text-xs',
                        selected && 'border-primary/40 bg-primary/15 text-primary',
                      )}
                      onClick={() => toggleSubject(s)}
                    >
                      {s}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Milestones</Label>
            <div className="flex flex-col gap-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={m}
                    onChange={(e) => handleMilestone(i, e.target.value)}
                    placeholder={`Milestone ${i + 1}`}
                    className="flex-1"
                  />
                  {milestones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeMilestone(i)}
                      aria-label="Remove milestone"
                    >
                      <XIcon size={14} weight="bold" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed text-muted-foreground"
                onClick={addMilestone}
              >
                <PlusIcon size={13} weight="bold" />
                Add milestone
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-notes">Notes (optional)</Label>
            <Textarea
              id="goal-notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this goal matters…"
              rows={2}
              maxLength={1000}
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending} className="flex-2">
              {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── GoalCard ──────────────────────────────────────────────────────────────────
interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onToggleMilestone: (milestoneId: string) => void;
}

function GoalCard({ goal, onEdit, onDelete, onToggleMilestone }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const done = goal.milestones.filter((m) => m.isCompleted).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          'gap-0 overflow-hidden py-0',
          goal.isCompleted && 'opacity-70',
        )}
      >
        <div className={cn('h-1', goalColorClass(goal.color))} />

        <CardContent className="px-[18px] py-4">
          <div className="mb-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  'mb-1.5 text-[0.95rem] font-semibold leading-snug',
                  goal.isCompleted
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground',
                )}
              >
                {goal.title}
              </h3>
              {goal.subjects.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {goal.subjects.map((s) => (
                    <Badge key={s} variant="outline" className="text-[0.72rem] font-medium">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="secondary" size="icon-sm" onClick={onEdit} aria-label="Edit goal">
                <Pencil size={14} />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={onDelete}
                className="text-destructive opacity-70 hover:text-destructive"
                aria-label="Delete goal"
              >
                <TrashIcon size={14} />
              </Button>
            </div>
          </div>

          {goal.milestones.length > 0 && (
            <div className="mb-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {done}/{goal.milestones.length} milestones
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    goal.progress === 100 ? 'text-green-500' : 'text-muted-foreground',
                  )}
                >
                  {goal.progress}%
                </span>
              </div>
              <Progress
                value={goal.progress}
                className={cn('h-1.5', goalProgressClass(goal.color, goal.progress === 100))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {goal.targetDate && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-[0.74rem]',
                    isOverdue(goal.targetDate) && !goal.isCompleted
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  )}
                >
                  <CalendarBlank size={12} />
                  {fmtDate(goal.targetDate)}
                </span>
              )}
              {goal.isCompleted && (
                <span className="text-[0.74rem] font-semibold text-green-500">✓ Completed</span>
              )}
            </div>

            {goal.milestones.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto gap-1 px-0 text-xs text-muted-foreground"
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                {expanded ? 'Hide' : 'Milestones'}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {expanded && goal.milestones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Separator className="my-3" />
                <div className="flex flex-col gap-2">
                  {goal.milestones.map((m: Milestone) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => onToggleMilestone(m._id)}
                      className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent p-1.5 text-left"
                    >
                      {m.isCompleted ? (
                        <CheckCircleIcon size={16} weight="fill" className="shrink-0 text-green-500" />
                      ) : (
                        <CircleIcon size={16} className="shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          'text-[0.84rem]',
                          m.isCompleted
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground',
                        )}
                      >
                        {m.title}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
const PRO_FEATURES = [
  'Custom goal with color coding',
  'Milestone-based progress (auto-calculated)',
  'Subject tags',
  'Target date with overdue alerts',
];

export default function Goals() {
  const { isPro, canDo } = usePlan();
  const navigate = useNavigate();
  const settings = useSettings();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: goals = [], isLoading } = useGoals();
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const del    = useDeleteGoal();
  const toggleM = useToggleMilestone();

  const availableSubjects = settings.subjects.map((s) => s.label);

  const active    = goals.filter((g) => !g.isCompleted);
  const completed = goals.filter((g) => g.isCompleted);

  const openNewGoalForm = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  if (!canDo('goals')) {
    return (
      <>
        <Helmet><title>Goals — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>
        <PageShell narrow>
          <PageHeader
            title={
              <span className="flex items-center gap-2.5">
                <TargetIcon size={22} weight="duotone" className="text-primary" />
                Goals
              </span>
            }
          />
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center px-6 py-7 text-center">
              <LockIcon size={32} weight="duotone" className="mb-3 text-primary opacity-60" />
              <h3 className="mb-2 text-base font-bold">Goals — Pro Feature</h3>
              <p className="mb-5 max-w-[340px] text-sm text-muted-foreground">
                Set learning goals with milestones and track your progress. Stay focused on what matters most.
              </p>
              <ul className="mb-6 inline-flex flex-col items-start gap-1.5 text-left">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="font-bold text-primary">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/upgrade')}>Upgrade to Pro — ₹149/month</Button>
            </CardContent>
          </Card>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Goals — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>

      <GoalForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        onSubmit={(data) => {
          if (editing) {
            update.mutate({ id: editing._id, data }, { onSuccess: () => { setFormOpen(false); setEditing(undefined); } });
          } else {
            create.mutate(data, { onSuccess: () => setFormOpen(false) });
          }
        }}
        initial={editing}
        isPending={create.isPending || update.isPending}
        availableSubjects={availableSubjects}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TrashIcon size={24} weight="duotone" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              All milestones will be permanently deleted.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageShell narrow className="max-w-[720px]">
        <PageHeader
          title={
            <span className="flex items-center gap-2.5">
              <TargetIcon size={22} weight="duotone" className="text-primary" />
              Goals
              <Badge variant="secondary">{active.length} active</Badge>
            </span>
          }
          action={
            <motion.div whileTap={{ scale: 0.96 }} className="inline-flex">
              <Button onClick={openNewGoalForm}>
                <PlusIcon size={15} weight="bold" />
                New Goal
              </Button>
            </motion.div>
          }
        />

        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[100px] rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && goals.length === 0 && (
          <EmptyState
            icon="Target"
            title="No goals yet"
            description={'Start with something meaningful — "Master DSA", "Read 25 books", "Learn Spanish B2"'}
            action={{ label: 'Create your first goal', onClick: () => setFormOpen(true) }}
          />
        )}

        {active.length > 0 && (
          <div className="flex flex-col gap-3">
            {active.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onEdit={() => { setEditing(goal); setFormOpen(true); }}
                onDelete={() => setConfirmDelete(goal._id)}
                onToggleMilestone={(mId) => toggleM.mutate({ goalId: goal._id, milestoneId: mId })}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="mb-2.5 text-[0.82rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Completed
            </h2>
            <div className="flex flex-col gap-2.5">
              {completed.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onEdit={() => { setEditing(goal); setFormOpen(true); }}
                  onDelete={() => setConfirmDelete(goal._id)}
                  onToggleMilestone={(mId) => toggleM.mutate({ goalId: goal._id, milestoneId: mId })}
                />
              ))}
            </div>
          </div>
        )}

        <StudyPlannerCard />
      </PageShell>
    </>
  );
}
