import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpenIcon, PlusIcon, XIcon, Pencil, TrashIcon, LockIcon, ArrowSquareOut,
  BookOpenIcon, CodeIcon, BarbellIcon, HeartIcon, RocketIcon, StarIcon, TargetIcon, PaintBrushIcon,
} from '@phosphor-icons/react';
import { usePlan } from '../hooks/usePlan';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import type { Project } from '../types';

// ── constants ─────────────────────────────────────────────────────────────────
const PROJECT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

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

function ProjectIcon({ id, size = 20, ...props }: { id: string; size?: number; color?: string }) {
  const found = PROJECT_ICONS.find((i) => i.id === id);
  if (!found) return <FolderOpenIcon size={size} {...props} />;
  const { Icon } = found;
  return <Icon size={size} weight="duotone" {...props} />;
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
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 32px)', maxWidth: 460,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: 24, zIndex: 201,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{initial ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={onClose} style={{ background: 'var(--color-surface-hover)', border: 'none', borderRadius: '50%', color: 'var(--color-text-muted)', cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XIcon size={15} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Project Name</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. DSA Mastery, React Roadmap" autoFocus maxLength={100} />
              </div>

              {/* Icon + Color row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PROJECT_ICONS.map(({ id, Icon }) => (
                      <button key={id} type="button" onClick={() => setIcon(id as IconId)}
                        style={{
                          width: 34, height: 34, borderRadius: 8, border: `2px solid ${icon === id ? color : 'var(--color-border)'}`,
                          background: icon === id ? `color-mix(in srgb, ${color} 15%, var(--color-surface))` : 'var(--color-surface-hover)',
                          color: icon === id ? color : 'var(--color-text-muted)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon size={16} weight={icon === id ? 'fill' : 'regular'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Color</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PROJECT_COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setColor(c)}
                        style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: `2px solid ${color === c ? '#fff' : 'transparent'}`, cursor: 'pointer', transition: 'transform 0.1s', transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description (optional)</label>
                <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={2} maxLength={500} style={{ resize: 'vertical' }} />
              </div>

              {/* Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: `1px solid ${color}30` }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `color-mix(in srgb, ${color} 20%, var(--color-surface))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ProjectIcon id={icon} size={18} color={color} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>{title || 'Project Preview'}</span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={!title.trim() || isPending} className="btn btn-primary" style={{ flex: 2 }}>
                  {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
      className="card card-hover"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
      onClick={onView}
    >
      {/* Color header */}
      <div style={{ height: 5, background: project.color }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `color-mix(in srgb, ${project.color} 18%, var(--color-surface-hover))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ProjectIcon id={project.icon} size={18} color={project.color} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.2, marginBottom: 2 }}>{project.title}</h3>
              {project.description && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{project.description}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}>
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', opacity: 0.6, cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}>
              <TrashIcon size={13} />
            </button>
          </div>
        </div>

        {/* Progress */}
        {total > 0 ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>{completed}/{total} tasks</span>
              <span style={{ fontSize: '0.73rem', fontWeight: 600, color: pct === 100 ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{pct}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--color-surface-hover)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : project.color, transition: 'width 500ms ease' }} />
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>No tasks yet</p>
        )}

        {/* View tasks button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: project.color, fontWeight: 500 }}>
          <ArrowSquareOut size={13} /> View Tasks
        </div>
      </div>
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

  if (!canDo('projects')) {
    return (
      <>
        <Helmet><title>Projects — HabitFlow</title><meta name="robots" content="noindex" /></Helmet>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <FolderOpenIcon size={22} weight="duotone" style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Projects</h1>
          </div>
          <div className="card" style={{ padding: '28px 24px', textAlign: 'center', borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)' }}>
            <LockIcon size={32} weight="duotone" style={{ color: 'var(--color-accent)', opacity: 0.6, marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Projects — Pro Feature</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', maxWidth: 340, margin: '0 auto 20px' }}>
              Group tasks into projects like "DSA Mastery", "React Roadmap" or "English B2". See progress at a glance.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/upgrade')}>Upgrade to Pro — ₹149/month</button>
          </div>
        </div>
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
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Archive this project?</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>Tasks will be unlinked but not deleted.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => { del.mutate(confirmDelete); setConfirmDelete(null); }} className="btn btn-danger" style={{ flex: 1 }}>Archive</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpenIcon size={22} weight="duotone" style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Projects</h1>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: 999 }}>
              {projects.length}
            </span>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setEditing(undefined); setFormOpen(true); }}
            className="btn btn-primary" style={{ gap: 6, padding: '8px 16px' }}>
            <PlusIcon size={15} weight="bold" /> New Project
          </motion.button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 130 }} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && projects.length === 0 && (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📂</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No projects yet</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Group your tasks by project — DSA Mastery, React Roadmap, English B2…
            </p>
            <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <PlusIcon size={15} weight="bold" /> Create first project
            </button>
          </div>
        )}

        {/* Project grid */}
        {projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
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
      </motion.div>
    </>
  );
}
