import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckIcon } from '@phosphor-icons/react';
import type { Habit } from '../../types';
import type { CreateHabitPayload } from '../../api/habits';
import { HABIT_CATEGORIES, HABIT_COLORS, TARGET_TYPES, FREQUENCY_OPTIONS, DAY_LABELS } from '../../config/habits.config';

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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 201, width: 'min(520px, calc(100vw - 32px))',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
              maxHeight: 'calc(100dvh - 48px)', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ alignItems: 'center', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', padding: '18px 20px' }}>
              <h2 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600 }}>
                {initialData ? 'Edit Habit' : 'New Habit'}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4 }}>
                <XIcon size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Title */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Habit Name *</label>
                <input className="input" placeholder="e.g. Morning run, Read 30 min…" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required autoFocus />
              </div>

              {/* Description */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Description <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span></label>
                <input className="input" placeholder="Any notes or goal for this habit" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Category */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8 }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {HABIT_CATEGORIES.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setForm((f) => ({ ...f, category: cat.id, color: cat.color, icon: cat.icon }))}
                      style={{
                        alignItems: 'center', background: form.category === cat.id ? `color-mix(in srgb, ${cat.color} 15%, transparent)` : 'var(--color-surface-hover)',
                        border: `1px solid ${form.category === cat.id ? `color-mix(in srgb, ${cat.color} 50%, transparent)` : 'var(--color-border)'}`,
                        borderRadius: 8, color: form.category === cat.id ? cat.color : 'var(--color-text-secondary)',
                        cursor: 'pointer', display: 'flex', fontSize: '0.8rem', fontWeight: 500,
                        gap: 6, minHeight: 'auto', minWidth: 'auto', padding: '6px 12px',
                        transition: 'all 0.15s',
                      }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8 }}>Accent Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {HABIT_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                      style={{
                        background: c, border: `2px solid ${form.color === c ? '#fff' : 'transparent'}`,
                        borderRadius: '50%', cursor: 'pointer', height: 26, minHeight: 'auto', minWidth: 'auto', padding: 0, width: 26,
                        outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                        flexShrink: 0,
                      }}
                      aria-label={c}
                    >
                      {form.color === c && <CheckIcon size={12} color="#fff" weight="bold" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target type */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8 }}>Tracking Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TARGET_TYPES.map((t) => (
                    <label key={t.id} style={{ alignItems: 'center', cursor: 'pointer', display: 'flex', gap: 10 }}>
                      <input type="radio" name="targetType" value={t.id} checked={form.targetType === t.id} onChange={() => setForm((f) => ({ ...f, targetType: t.id }))}
                        style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }} />
                      <div>
                        <div style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500 }}>{t.label}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{t.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {form.targetType !== 'yes_no' && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: 4, display: 'block' }}>
                      {form.targetType === 'number' ? 'Target count' : 'Target minutes'}
                    </label>
                    <input className="input" type="number" min={1} value={form.targetValue}
                      onChange={(e) => setForm((f) => ({ ...f, targetValue: Number(e.target.value) }))}
                      style={{ width: 100 }} />
                  </div>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8 }}>Frequency</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {FREQUENCY_OPTIONS.map((f) => (
                    <button key={f.id} type="button" onClick={() => setFreqType(f.id)}
                      style={{
                        background: form.frequency.type === f.id ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)' : 'var(--color-surface-hover)',
                        border: `1px solid ${form.frequency.type === f.id ? 'color-mix(in srgb, var(--color-accent) 50%, transparent)' : 'var(--color-border)'}`,
                        borderRadius: 8, color: form.frequency.type === f.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, minHeight: 'auto', minWidth: 'auto', padding: '6px 12px',
                      }}>{f.label}</button>
                  ))}
                </div>

                {form.frequency.type === 'custom' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {DAY_LABELS.map((day, i) => (
                      <button key={day} type="button" onClick={() => toggleDay(i)}
                        style={{
                          background: customDays.includes(i) ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                          border: `1px solid ${customDays.includes(i) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          borderRadius: 8, color: customDays.includes(i) ? '#fff' : 'var(--color-text-muted)',
                          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, minHeight: 'auto', minWidth: 'auto', padding: '6px 8px',
                        }}>{day}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview + submit */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {/* Color preview */}
                <div style={{
                  alignItems: 'center', background: `color-mix(in srgb, ${form.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${form.color} 30%, transparent)`,
                  borderRadius: 10, color: form.color, display: 'flex', flex: 1,
                  fontSize: '0.85rem', fontWeight: 500, gap: 8, padding: '10px 14px',
                }}>
                  <div style={{ background: form.color, borderRadius: 4, height: 10, width: 10, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.title || 'Your habit'} · {selectedCategory?.label}
                  </span>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading || !form.title.trim()}
                  style={{ minWidth: 100, flexShrink: 0 }}>
                  {isLoading ? '…' : initialData ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
