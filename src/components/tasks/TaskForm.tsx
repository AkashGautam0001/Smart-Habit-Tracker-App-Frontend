import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, TimerIcon, FolderOpenIcon } from '@phosphor-icons/react';
import { useSettings } from '../../hooks/useSettings';
import type { Task, Project } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; subject: string; estimatedPomodoros: number; projectId?: string }) => void;
  initial?: Task;
  isPending?: boolean;
  projects?: Project[];   // Pro users only — list of projects to choose from
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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              bottom: 0, left: 0, position: 'fixed', right: 0, top: 0, zIndex: 200,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              left: '50%', maxWidth: 440, padding: 24,
              position: 'fixed', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 32px)',
              zIndex: 201,
            }}
          >
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600 }}>
                {initial ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                style={{
                  alignItems: 'center', background: 'var(--color-surface-hover)',
                  border: 'none', borderRadius: '50%', color: 'var(--color-text-muted)',
                  cursor: 'pointer', display: 'flex', height: 30,
                  justifyContent: 'center', minHeight: 'auto', minWidth: 'auto', width: 30,
                }}
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
                  Task
                </label>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  maxLength={200}
                />
              </div>

              {/* Subject */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
                  Subject
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {settings.subjects.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubject(s.label)}
                      style={{
                        alignItems: 'center',
                        background: subject === s.label
                          ? `color-mix(in srgb, ${s.color} 15%, var(--color-surface))`
                          : 'var(--color-surface-hover)',
                        border: `1px solid ${subject === s.label ? s.color + '80' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: subject === s.label ? s.color : 'var(--color-text-secondary)',
                        cursor: 'pointer', display: 'inline-flex',
                        fontSize: '0.8rem', fontWeight: 600,
                        gap: 4, minHeight: 'auto', minWidth: 'auto',
                        padding: '6px 12px', transition: 'all 0.15s',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Pomodoros */}
              <div>
                <label style={{ alignItems: 'center', color: 'var(--color-text-secondary)', display: 'flex', fontSize: '0.8rem', fontWeight: 500, gap: 4, marginBottom: 8 }}>
                  <TimerIcon size={14} /> Estimated Sessions
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {POMODORO_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEstimated(n)}
                      style={{
                        alignItems: 'center',
                        background: estimated === n ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                        border: 'none', borderRadius: 'var(--radius-md)',
                        color: estimated === n ? '#fff' : 'var(--color-text-secondary)',
                        cursor: 'pointer', display: 'inline-flex',
                        fontSize: '0.8rem', fontWeight: 600,
                        gap: 3, minHeight: 'auto', minWidth: 'auto',
                        padding: '6px 10px', transition: 'all 0.15s',
                      }}
                    >
                      🍅 {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project (Pro only — shown when projects list is provided) */}
              {projects && projects.length > 0 && (
                <div>
                  <label style={{ alignItems: 'center', color: 'var(--color-text-secondary)', display: 'flex', fontSize: '0.8rem', fontWeight: 500, gap: 4, marginBottom: 8 }}>
                    <FolderOpenIcon size={14} /> Project (optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setProjectId('')}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 500,
                        background: !projectId ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                        border: `1px solid ${!projectId ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        color: !projectId ? '#fff' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      None
                    </button>
                    {projects.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => setProjectId(p._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 500,
                          background: projectId === p._id ? `color-mix(in srgb, ${p.color} 15%, var(--color-surface))` : 'var(--color-surface-hover)',
                          border: `1px solid ${projectId === p._id ? p.color + '80' : 'var(--color-border)'}`,
                          color: projectId === p._id ? p.color : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        {p.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isPending}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
