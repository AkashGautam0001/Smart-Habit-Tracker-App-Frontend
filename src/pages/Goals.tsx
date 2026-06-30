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
import type { Goal, Milestone } from '../types';

// ── constants ─────────────────────────────────────────────────────────────────
const GOAL_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 32px)', maxWidth: 500, maxHeight: '90dvh', overflowY: 'auto',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: 24, zIndex: 201,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{initial ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={onClose} style={{ background: 'var(--color-surface-hover)', border: 'none', borderRadius: '50%', color: 'var(--color-text-muted)', cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XIcon size={15} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Goal</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Master DSA in 3 months" autoFocus maxLength={200} />
              </div>

              {/* Color */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {GOAL_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: `2px solid ${color === c ? '#fff' : 'transparent'}`, cursor: 'pointer', transition: 'transform 0.1s', transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Target date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target Date (optional)</label>
                <input className="input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Subjects */}
              {availableSubjects.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Subjects</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {availableSubjects.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSubject(s)}
                        style={{
                          padding: '5px 11px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 500,
                          background: subjects.includes(s) ? 'rgba(99,102,241,0.15)' : 'var(--color-surface-hover)',
                          border: `1px solid ${subjects.includes(s) ? 'rgba(99,102,241,0.4)' : 'var(--color-border)'}`,
                          color: subjects.includes(s) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                        }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Milestones</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {milestones.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="input"
                        value={m}
                        onChange={(e) => handleMilestone(i, e.target.value)}
                        placeholder={`Milestone ${i + 1}`}
                        style={{ flex: 1 }}
                      />
                      {milestones.length > 1 && (
                        <button type="button" onClick={() => removeMilestone(i)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                          <XIcon size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addMilestone}
                    style={{ background: 'none', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <PlusIcon size={13} weight="bold" /> Add milestone
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Notes (optional)</label>
                <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why this goal matters…" rows={2} maxLength={1000} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={!title.trim() || isPending} className="btn btn-primary" style={{ flex: 2 }}>
                  {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
      className="card"
      style={{ padding: 0, overflow: 'hidden', opacity: goal.isCompleted ? 0.7 : 1 }}
    >
      {/* Color strip */}
      <div style={{ height: 4, background: goal.color }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: goal.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)', textDecoration: goal.isCompleted ? 'line-through' : 'none', marginBottom: 6, lineHeight: 1.3 }}>
              {goal.title}
            </h3>
            {/* Subject tags */}
            {goal.subjects.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                {goal.subjects.map((s) => (
                  <span key={s} style={{ fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px', borderRadius: 999, background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={onEdit} style={{ background: 'var(--color-surface-hover)', border: 'none', borderRadius: 6, color: 'var(--color-text-muted)', cursor: 'pointer', padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} style={{ background: 'var(--color-surface-hover)', border: 'none', borderRadius: 6, color: 'var(--color-danger)', cursor: 'pointer', padding: '5px 8px', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
              <TrashIcon size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {goal.milestones.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {done}/{goal.milestones.length} milestones
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: goal.progress === 100 ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {goal.progress}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-hover)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${goal.progress}%`, background: goal.progress === 100 ? 'var(--color-success)' : goal.color, transition: 'width 500ms ease' }} />
            </div>
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {goal.targetDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: isOverdue(goal.targetDate) && !goal.isCompleted ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                <CalendarBlank size={12} />
                {fmtDate(goal.targetDate)}
              </span>
            )}
            {goal.isCompleted && <span style={{ fontSize: '0.74rem', color: 'var(--color-success)', fontWeight: 600 }}>✓ Completed</span>}
          </div>

          {goal.milestones.length > 0 && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}
            >
              {expanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
              {expanded ? 'Hide' : 'Milestones'}
            </button>
          )}
        </div>

        {/* Milestones list */}
        <AnimatePresence>
          {expanded && goal.milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {goal.milestones.map((m: Milestone) => (
                  <button
                    key={m._id}
                    onClick={() => onToggleMilestone(m._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
                      cursor: 'pointer', padding: '6px 0', textAlign: 'left', width: '100%',
                    }}
                  >
                    {m.isCompleted
                      ? <CheckCircleIcon size={16} weight="fill" style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      : <CircleIcon size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: '0.84rem', color: m.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)', textDecoration: m.isCompleted ? 'line-through' : 'none' }}>
                      {m.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
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

  if (!canDo('goals')) {
    return (
      <>
        <Helmet><title>Goals — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <TargetIcon size={22} weight="duotone" style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Goals</h1>
          </div>
          <div className="card" style={{ padding: '28px 24px', textAlign: 'center', borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)' }}>
            <LockIcon size={32} weight="duotone" style={{ color: 'var(--color-accent)', opacity: 0.6, marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Goals — Pro Feature</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', maxWidth: 340, margin: '0 auto 20px' }}>
              Set learning goals with milestones and track your progress. Stay focused on what matters most.
            </p>
            <ul style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7, marginBottom: 24, textAlign: 'left' }}>
              {['Custom goal with color coding', 'Milestone-based progress (auto-calculated)', 'Subject tags', 'Target date with overdue alerts'].map((f) => (
                <li key={f} style={{ listStyle: 'none', display: 'flex', gap: 8, fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={() => navigate('/upgrade')}>Upgrade to Pro — ₹149/month</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Goals — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>

      {/* Goal form */}
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

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 24, zIndex: 201, width: 'calc(100% - 32px)', maxWidth: 360, textAlign: 'center' }}>
              <TrashIcon size={28} weight="duotone" style={{ color: 'var(--color-danger)', marginBottom: 12 }} />
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Delete this goal?</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>All milestones will be permanently deleted.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => { del.mutate(confirmDelete); setConfirmDelete(null); }} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TargetIcon size={22} weight="duotone" style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Goals</h1>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: 999 }}>
              {active.length} active
            </span>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setEditing(undefined); setFormOpen(true); }}
            className="btn btn-primary" style={{ gap: 6, padding: '8px 16px' }}>
            <PlusIcon size={15} weight="bold" /> New Goal
          </motion.button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && goals.length === 0 && (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No goals yet</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Start with something meaningful — "Master DSA", "Read 25 books", "Learn Spanish B2"
            </p>
            <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <PlusIcon size={15} weight="bold" /> Create your first goal
            </button>
          </div>
        )}

        {/* Active goals */}
        {active.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

        {/* Completed goals */}
        {completed.length > 0 && (
          <div>
            <h2 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Completed</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

        {/* AI Study Planner */}
        <StudyPlannerCard />
      </motion.div>
    </>
  );
}
