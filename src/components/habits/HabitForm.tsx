import { useState, useEffect } from 'react';
import { CheckIcon } from '@phosphor-icons/react';
import type { Habit } from '../../types';
import type { CreateHabitPayload } from '../../api/habits';
import { HABIT_CATEGORIES, HABIT_COLORS, TARGET_TYPES, FREQUENCY_OPTIONS, DAY_LABELS } from '../../config/habits.config';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHabitPayload) => void;
  isLoading?: boolean;
  initialData?: Habit;
}

const DEFAULT: CreateHabitPayload = {
  title: '',
  description: '',
  category: 'other',
  color: '#6366f1',
  icon: 'Star',
  targetType: 'yes_no',
  targetValue: 1,
  frequency: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
};

const HABIT_COLOR_BG: Record<string, string> = {
  '#6366f1': 'bg-indigo-500',
  '#8b5cf6': 'bg-violet-500',
  '#ec4899': 'bg-pink-500',
  '#ef4444': 'bg-red-500',
  '#f97316': 'bg-orange-500',
  '#f59e0b': 'bg-amber-500',
  '#22c55e': 'bg-green-500',
  '#10b981': 'bg-emerald-500',
  '#06b6d4': 'bg-cyan-500',
  '#3b82f6': 'bg-blue-500',
  '#a855f7': 'bg-purple-500',
  '#71717a': 'bg-zinc-500',
};

const HABIT_COLOR_TINT: Record<string, string> = {
  '#6366f1': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
  '#8b5cf6': 'bg-violet-500/10 text-violet-500 border-violet-500/30',
  '#ec4899': 'bg-pink-500/10 text-pink-500 border-pink-500/30',
  '#ef4444': 'bg-red-500/10 text-red-500 border-red-500/30',
  '#f97316': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  '#f59e0b': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  '#22c55e': 'bg-green-500/10 text-green-500 border-green-500/30',
  '#10b981': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  '#06b6d4': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  '#3b82f6': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  '#a855f7': 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  '#71717a': 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30',
};

const CATEGORY_COLOR_TINT: Record<string, string> = {
  '#f97316': 'bg-orange-500/15 text-orange-500 border-orange-500/50',
  '#6366f1': 'bg-indigo-500/15 text-indigo-500 border-indigo-500/50',
  '#22c55e': 'bg-green-500/15 text-green-500 border-green-500/50',
  '#f59e0b': 'bg-amber-500/15 text-amber-500 border-amber-500/50',
  '#ec4899': 'bg-pink-500/15 text-pink-500 border-pink-500/50',
  '#3b82f6': 'bg-blue-500/15 text-blue-500 border-blue-500/50',
  '#10b981': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/50',
  '#a855f7': 'bg-purple-500/15 text-purple-500 border-purple-500/50',
  '#71717a': 'bg-zinc-500/15 text-zinc-500 border-zinc-500/50',
};

function habitColorClass(color: string) {
  return HABIT_COLOR_BG[color.toLowerCase()] ?? 'bg-primary';
}

function habitTintClass(color: string) {
  return HABIT_COLOR_TINT[color.toLowerCase()] ?? 'bg-primary/10 text-primary border-primary/30';
}

function categoryTintClass(color: string) {
  return CATEGORY_COLOR_TINT[color.toLowerCase()] ?? 'bg-primary/15 text-primary border-primary/50';
}

export default function HabitForm({ open, onClose, onSubmit, isLoading, initialData }: Props) {
  const [form, setForm] = useState<CreateHabitPayload>(DEFAULT);
  const [customDays, setCustomDays] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title,
          description: initialData.description ?? '',
          category: initialData.category,
          color: initialData.color,
          icon: initialData.icon,
          targetType: initialData.targetType,
          targetValue: initialData.targetValue,
          frequency: initialData.frequency,
        });
        if (initialData.frequency.type === 'custom') setCustomDays(initialData.frequency.days);
      } else {
        setForm(DEFAULT);
        setCustomDays([]);
      }
    }
  }, [open, initialData]);

  const setFreqType = (type: string) => {
    const preset = FREQUENCY_OPTIONS.find((f) => f.id === type);
    setForm((f) => ({ ...f, frequency: { type: type as typeof form.frequency.type, days: preset?.days ?? customDays } }));
  };

  const toggleDay = (day: number) => {
    const next = customDays.includes(day) ? customDays.filter((d) => d !== day) : [...customDays, day].sort();
    setCustomDays(next);
    setForm((f) => ({ ...f, frequency: { type: 'custom', days: next } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, title: form.title.trim() });
  };

  const selectedCategory = HABIT_CATEGORIES.find((c) => c.id === form.category);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-48px)] max-w-[calc(100vw-32px)] overflow-y-auto sm:max-w-130">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Habit' : 'New Habit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="habit-title">Habit Name *</Label>
            <Input
              id="habit-title"
              placeholder="e.g. Morning run, Read 30 min…"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-description">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="habit-description"
              placeholder="Any notes or goal for this habit"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_CATEGORIES.map((cat) => {
                const selected = form.category === cat.id;
                return (
                  <Button
                    key={cat.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, category: cat.id, color: cat.color, icon: cat.icon }))}
                    className={cn(
                      'h-auto min-h-0 px-3 py-1.5 text-[0.8rem] font-medium',
                      selected
                        ? categoryTintClass(cat.color)
                        : 'bg-muted/50 text-muted-foreground',
                    )}
                  >
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    'flex size-6.5 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform',
                    habitColorClass(c),
                    form.color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-background ring-(--swatch-c)' : 'scale-100',
                  )}
                  style={{ '--swatch-c': c } as React.CSSProperties}
                  aria-label={c}
                >
                  {form.color === c && <CheckIcon size={12} color="#fff" weight="bold" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tracking Type</Label>
            <div role="radiogroup" aria-label="Tracking type" className="flex flex-col gap-1.5">
              {TARGET_TYPES.map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors',
                    form.targetType === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50',
                  )}
                >
                  <input
                    type="radio"
                    name="targetType"
                    value={t.id}
                    checked={form.targetType === t.id}
                    onChange={() => setForm((f) => ({ ...f, targetType: t.id }))}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                </label>
              ))}
            </div>

            {form.targetType !== 'yes_no' && (
              <div className="mt-2 space-y-1.5">
                <Label htmlFor="habit-target-value" className="text-xs font-normal text-muted-foreground">
                  {form.targetType === 'number' ? 'Target count' : 'Target minutes'}
                </Label>
                <Input
                  id="habit-target-value"
                  type="number"
                  min={1}
                  value={form.targetValue}
                  onChange={(e) => setForm((f) => ({ ...f, targetValue: Number(e.target.value) }))}
                  className="w-25"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFreqType(f.id)}
                  className={cn(
                    'h-auto min-h-0 px-3 py-1.5 text-[0.8rem] font-medium',
                    form.frequency.type === f.id
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'bg-muted/50 text-muted-foreground',
                  )}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {form.frequency.type === 'custom' && (
              <div className="mt-2 flex gap-1.5">
                {DAY_LABELS.map((day, i) => (
                  <Button
                    key={day}
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      'min-w-0 px-2 text-[0.72rem] font-semibold',
                      customDays.includes(i)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground',
                    )}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium',
              habitTintClass(form.color),
            )}
          >
            <div
              className="size-2.5 shrink-0 rounded bg-(--preview-c)"
              style={{ '--preview-c': form.color } as React.CSSProperties}
            />
            <span className="truncate">
              {form.title || 'Your habit'} · {selectedCategory?.label}
            </span>
          </div>

          <DialogFooter className="-mx-4 -mb-4 mt-1 sm:justify-end">
            <Button
              type="submit"
              disabled={isLoading || !form.title.trim()}
              className="min-w-25"
            >
              {isLoading ? '…' : initialData ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
