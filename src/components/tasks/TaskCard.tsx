import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, CircleIcon, DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { Task } from '../../types';

interface Props {
  task: Task;
  subjectColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, subjectColor, onToggle, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tomatoFilled = Math.min(task.completedPomodoros, task.estimatedPomodoros);
  const tomatoTotal = Math.max(task.estimatedPomodoros, task.completedPomodoros);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: task.isCompleted ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', gap: 12, padding: '12px 14px',
        position: 'relative',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          alignItems: 'center', background: 'none', border: 'none',
          color: task.isCompleted ? 'var(--color-success)' : 'var(--color-text-muted)',
          cursor: 'pointer', display: 'flex', flexShrink: 0,
          minHeight: 'auto', minWidth: 'auto', padding: 0,
          transition: 'color 0.2s',
        }}
      >
        {task.isCompleted
          ? <CheckCircleIcon size={22} weight="fill" />
          : <CircleIcon size={22} weight="regular" />
        }
      </button>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: 'var(--color-text)',
          fontSize: '0.9rem',
          fontWeight: 500,
          overflow: 'hidden',
          textDecoration: task.isCompleted ? 'line-through' : 'none',
          textOverflow: 'ellipsis',
          transition: 'text-decoration 0.2s',
          whiteSpace: 'nowrap',
        }}>
          {task.title}
        </div>

        {/* Pomodoro dots */}
        <div style={{ alignItems: 'center', display: 'flex', gap: 4, marginTop: 4 }}>
          {Array.from({ length: tomatoTotal }).map((_, i) => (
            <span
              key={i}
              style={{ fontSize: '0.7rem', opacity: i < tomatoFilled ? 1 : 0.3 }}
              title={i < tomatoFilled ? 'Completed session' : 'Planned session'}
            >
              🍅
            </span>
          ))}
          {task.completedPomodoros > task.estimatedPomodoros && (
            <span style={{ color: 'var(--color-warning)', fontSize: '0.7rem' }}>
              +{task.completedPomodoros - task.estimatedPomodoros}
            </span>
          )}
        </div>
      </div>

      {/* Subject badge */}
      {task.subject && (
        <span style={{
          background: `color-mix(in srgb, ${subjectColor} 15%, transparent)`,
          border: `1px solid ${subjectColor}40`,
          borderRadius: 99,
          color: subjectColor,
          fontSize: '0.7rem', fontWeight: 600,
          padding: '2px 8px', flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          {task.subject}
        </span>
      )}

      {/* Three-dot menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          style={{
            alignItems: 'center', background: 'none', border: 'none',
            borderRadius: 6,
            color: 'var(--color-text-muted)', cursor: 'pointer',
            display: 'flex', minHeight: 'auto', minWidth: 'auto',
            padding: 4, transition: 'color 0.15s',
          }}
        >
          <DotsThreeVerticalIcon size={18} weight="bold" />
        </button>

        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ bottom: 0, left: 0, position: 'fixed', right: 0, top: 0, zIndex: 10 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 130,
                position: 'absolute', right: 0, top: '100%',
                zIndex: 20, overflow: 'hidden',
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                style={{
                  alignItems: 'center', background: 'none', border: 'none',
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                  display: 'flex', fontSize: '0.85rem',
                  gap: 8, minHeight: 'auto', minWidth: 'auto',
                  padding: '10px 14px', width: '100%',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <PencilSimpleIcon size={14} /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                style={{
                  alignItems: 'center', background: 'none', border: 'none',
                  color: 'var(--color-danger)', cursor: 'pointer',
                  display: 'flex', fontSize: '0.85rem',
                  gap: 8, minHeight: 'auto', minWidth: 'auto',
                  padding: '10px 14px', width: '100%',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <TrashIcon size={14} /> Delete
              </button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
