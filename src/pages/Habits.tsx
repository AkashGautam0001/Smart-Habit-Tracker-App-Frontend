import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MagnifyingGlassIcon, ArchiveIcon } from '@phosphor-icons/react';
import { useHabits, useCreateHabit, useUpdateHabit, useArchiveHabit, useLogHabit } from '../hooks/useHabits';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import EmptyState from '../components/shared/EmptyState';
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

  return (
    <>
      <Helmet>
        <title>Habits | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>

        {/* Header row */}
        <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 700 }}>Habits</h1>
            {!isLoading && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                {doneCount}/{habits.length} done today
                {isFinite(maxHabits) && ` · ${habits.length}/${maxHabits} habits`}
              </p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (atLimit) {
                alert(`You've reached the ${maxHabits} habit limit on the Free plan. Upgrade to Pro for unlimited habits.`);
                return;
              }
              setEditTarget(undefined);
              setFormOpen(true);
            }}
            className="btn btn-primary"
            style={{ alignItems: 'center', display: 'flex', gap: 6, padding: '8px 16px', fontSize: '0.875rem' }}
          >
            <PlusIcon size={16} weight="bold" />
            New Habit
          </motion.button>
        </div>

        {/* Search */}
        {habits.length > 4 && (
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input"
              placeholder="Search habits…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        )}

        {/* Progress bar */}
        {habits.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Today's Progress</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
                {Math.round((doneCount / habits.length) * 100)}%
              </span>
            </div>
            <div style={{ background: 'var(--color-surface-hover)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / habits.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: 'var(--color-accent)', borderRadius: 99, height: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Habit list */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ height: 64, opacity: 0.5 }}>
                <div style={{ background: 'var(--color-surface-hover)', animation: 'pulse 1.5s ease-in-out infinite', height: '100%', borderRadius: 'var(--radius-lg)' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No habits match "{search}"
            </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

        {/* Free plan limit notice */}
        {atLimit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card"
            style={{
              alignItems: 'center', display: 'flex', gap: 12, padding: '14px 16px',
              background: 'color-mix(in srgb, var(--color-accent) 6%, var(--color-surface))',
              borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
            }}
          >
            <ArchiveIcon size={20} weight="duotone" color="var(--color-accent)" />
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500 }}>
                You've reached {maxHabits} habits (Free plan limit)
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                Upgrade to Pro for unlimited habits.
              </p>
            </div>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px', flexShrink: 0, minHeight: 'auto' }}
              onClick={() => window.location.href = '/upgrade'}>
              Upgrade
            </button>
          </motion.div>
        )}
      </div>

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
