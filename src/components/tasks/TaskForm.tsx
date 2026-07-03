import { useState, useEffect } from 'react';
import { TimerIcon, FolderOpenIcon, AlarmIcon } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '../../hooks/useSettings';
import type { Task, Project } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; subject: string; estimatedPomodoros: number; projectId?: string }) => void;
  initial?: Task;
  isPending?: boolean;
  projects?: Project[];
}

const POMODORO_OPTIONS = [1, 2, 3, 4, 5, 6, 8];

export default function TaskForm({ open, onClose, onSubmit, initial, isPending, projects }: Props) {
  const settings = useSettings();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [estimated, setEstimated] = useState(1);
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setSubject(initial?.subject ?? (settings.subjects[0]?.label ?? ''));
      setEstimated(initial?.estimatedPomodoros ?? 1);
      setProjectId(initial?.projectId ?? '');
    }
  }, [open, initial, settings.subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title:              title.trim(),
      subject,
      estimatedPomodoros: estimated,
      projectId:          projectId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <div className="flex flex-wrap gap-2">
              {settings.subjects.map((s) => {
                const selected = subject === s.label;
                return (
                  <Button
                    key={s.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-7 text-xs font-semibold',
                      selected &&
                        'border-(--picker-color)/50 bg-[color-mix(in_srgb,var(--picker-color)_15%,transparent)] text-(--picker-color) hover:bg-[color-mix(in_srgb,var(--picker-color)_20%,transparent)]',
                    )}
                    style={selected ? { '--picker-color': s.color } as React.CSSProperties : undefined}
                    onClick={() => setSubject(s.label)}
                  >
                    {s.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="gap-1">
              <TimerIcon size={14} />
              Estimated Sessions
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {POMODORO_OPTIONS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={estimated === n ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 gap-1 text-xs font-semibold"
                  onClick={() => setEstimated(n)}
                >
                  <AlarmIcon size={11} weight={estimated === n ? 'fill' : 'regular'} />
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {projects && projects.length > 0 && (
            <div className="space-y-2">
              <Label className="gap-1">
                <FolderOpenIcon size={14} />
                Project (optional)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant={!projectId ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-medium"
                  onClick={() => setProjectId('')}
                >
                  None
                </Button>
                {projects.map((p) => {
                  const selected = projectId === p._id;
                  return (
                    <Button
                      key={p._id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 gap-1.5 text-xs font-medium',
                        selected &&
                          'border-(--picker-color)/50 bg-[color-mix(in_srgb,var(--picker-color)_15%,transparent)] text-(--picker-color) hover:bg-[color-mix(in_srgb,var(--picker-color)_20%,transparent)]',
                      )}
                      style={selected ? { '--picker-color': p.color } as React.CSSProperties : undefined}
                      onClick={() => setProjectId(p._id)}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full bg-(--picker-color)"
                        style={{ '--picker-color': p.color } as React.CSSProperties}
                      />
                      {p.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending} className="flex-2">
              {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
