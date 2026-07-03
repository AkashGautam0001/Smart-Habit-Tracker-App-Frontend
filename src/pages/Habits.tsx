import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MagnifyingGlassIcon, ArchiveIcon } from '@phosphor-icons/react';
import { useHabits, useCreateHabit, useUpdateHabit, useArchiveHabit, useLogHabit } from '../hooks/useHabits';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlan } from '../hooks/usePlan';
import type { Habit as HabitType } from '../types';
import type { CreateHabitPayload } from '../api/habits';
import { APP_CONFIG } from '../config/app.config';
import { PLANS } from '../config/plans.config';

export default function Habits() {
  const { habits, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const archiveHabit = useArchiveHabit();
  const logHabit = useLogHabit();
  const { planId } = usePlan();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HabitType | undefined>();
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const maxHabits = PLANS[planId].limits.maxHabits;
  const atLimit = isFinite(maxHabits) && habits.length >= maxHabits;

  const filtered = habits.filter((h: HabitType) =>
    h.title.toLowerCase().includes(search.toLowerCase()),
  );

  const doneCount = habits.filter((h: HabitType) => h.todayLog?.completed).length;
  const progressValue = habits.length > 0 ? (doneCount / habits.length) * 100 : 0;

  const handleToggle = async (id: string, completed: boolean) => {
    setLoggingId(id);
    try {
      await logHabit.mutateAsync({ id, data: { date: today, completed } });
    } finally {
      setLoggingId(null);
    }
  };

  const handleEdit = (habit: HabitType) => {
    setEditTarget(habit);
    setFormOpen(true);
  };

  const handleCreate = async (data: CreateHabitPayload) => {
    if (editTarget) {
      await updateHabit.mutateAsync({ id: editTarget._id, data });
    } else {
      await createHabit.mutateAsync(data);
    }
    setFormOpen(false);
    setEditTarget(undefined);
  };

  const handleArchive = async (id: string) => {
    if (confirm('Remove this habit? Your log history will be preserved.')) {
      await archiveHabit.mutateAsync(id);
    }
  };

  const openNewHabitForm = () => {
    if (atLimit) {
      alert(`You've reached the ${maxHabits} habit limit on the Free plan. Upgrade to Pro for unlimited habits.`);
      return;
    }
    setEditTarget(undefined);
    setFormOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Habits | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell narrow>
        <PageHeader
          title="Habits"
          description={
            !isLoading ? (
              <>
                {doneCount}/{habits.length} done today
                {isFinite(maxHabits) && ` · ${habits.length}/${maxHabits} habits`}
              </>
            ) : undefined
          }
          action={
            <motion.div whileTap={{ scale: 0.95 }} className="inline-flex">
              <Button onClick={openNewHabitForm}>
                <PlusIcon size={16} weight="bold" />
                New Habit
              </Button>
            </motion.div>
          }
        />

        {habits.length > 4 && (
          <div className="relative">
            <MagnifyingGlassIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search habits…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {habits.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Today&apos;s Progress</span>
              <span className="font-medium text-foreground">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No habits match &ldquo;{search}&rdquo;
            </p>
          ) : (
            <EmptyState
              icon="CheckSquare"
              title="No habits yet"
              description="Add your first habit and start building your daily streaks."
              action={{ label: 'Add Your First Habit', onClick: () => setFormOpen(true) }}
            />
          )
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-2">
              {filtered.map((habit: HabitType) => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  isLogging={loggingId === habit._id}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {atLimit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex items-center gap-3 p-3.5">
                <ArchiveIcon size={20} weight="duotone" className="shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    You&apos;ve reached {maxHabits} habits (Free plan limit)
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Upgrade to Pro for unlimited habits.
                  </p>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link to="/upgrade">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </PageShell>

      <HabitForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(undefined); }}
        onSubmit={handleCreate}
        isLoading={createHabit.isPending || updateHabit.isPending}
        initialData={editTarget}
      />
    </>
  );
}
