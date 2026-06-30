import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  CheckCircleIcon, CircleIcon, PencilSimpleIcon, TrashIcon, DotsThree,
} from '@phosphor-icons/react';
import type { Habit } from '../../types';
import StreakBadge from './StreakBadge';

interface Props {
  habit: Habit;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (id: string) => void;
  isLogging?: boolean;
}

export default function HabitCard({ habit, onToggle, onEdit, onArchive, isLogging }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isDone = habit.todayLog?.completed ?? false;

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === 'Right' && !isDone) setSwipeOffset(Math.min(e.deltaX, 80));
      if (e.dir === 'Left' && isDone) setSwipeOffset(Math.max(e.deltaX, -80));
    },
    onSwipedRight: (e) => {
      if (e.deltaX > 60 && !isDone) {
        handleToggle();
      }
      setSwipeOffset(0);
    },
    onSwipedLeft: (e) => {
      if (e.deltaX < -60 && isDone) {
        handleToggle();
      }
      setSwipeOffset(0);
    },
    onTouchEndOrOnMouseUp: () => setSwipeOffset(0),
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  const handleToggle = () => {
    navigator.vibrate?.(10);
    onToggle(habit._id, !isDone);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      {/* Swipe hint background */}
      {swipeOffset > 0 && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'var(--radius-lg)',
          background: 'color-mix(in srgb, var(--color-success) 20%, transparent)',
          display: 'flex', alignItems: 'center', paddingLeft: 20,
        }}>
          <CheckCircleIcon size={22} weight="fill" color="var(--color-success)" />
        </div>
      )}

      <div
        {...swipeHandlers}
        className="card"
        style={{
          alignItems: 'center', display: 'flex', gap: 14, padding: '14px 16px',
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.25s ease' : 'none',
          opacity: isLogging ? 0.6 : 1,
        }}
        onClick={() => setMenuOpen(false)}
      >
        {/* Color dot */}
        <div style={{
          width: 4, height: 36, borderRadius: 2, background: habit.color, flexShrink: 0,
        }} />

        {/* Check button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleToggle}
          disabled={isLogging}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            minHeight: 'auto', minWidth: 'auto', padding: 2,
            color: isDone ? 'var(--color-success)' : 'var(--color-border)',
          }}
          aria-label={isDone ? 'Unmark habit' : 'Complete habit'}
        >
          {isDone
            ? <CheckCircleIcon size={26} weight="fill" />
            : <CircleIcon size={26} weight="regular" />
          }
        </motion.button>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              color: isDone ? 'var(--color-text-secondary)' : 'var(--color-text)',
              fontSize: '0.9rem', fontWeight: 500,
              textDecoration: isDone ? 'line-through' : 'none',
              textDecorationColor: 'var(--color-text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {habit.title}
            </span>
            {(habit.currentStreak ?? 0) > 0 && (
              <StreakBadge streak={habit.currentStreak!} size="sm" />
            )}
          </div>
          {habit.description && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {habit.description}
            </p>
          )}
        </div>

        {/* Longest streak */}
        {(habit.longestStreak ?? 0) > 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', flexShrink: 0, textAlign: 'right' }}>
            Best {habit.longestStreak}d
          </div>
        )}

        {/* Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'var(--color-text-muted)', minHeight: 'auto', minWidth: 'auto', borderRadius: 6,
            }}
            aria-label="Habit options"
          >
            <DotsThree size={20} weight="bold" />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 50,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 10, boxShadow: 'var(--shadow-md)', minWidth: 140, overflow: 'hidden',
            }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setMenuOpen(false); onEdit(habit); }}
                style={{
                  alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                  gap: 10, minHeight: 'auto', minWidth: 'auto', padding: '10px 14px', width: '100%',
                  color: 'var(--color-text-secondary)', fontSize: '0.85rem',
                }}
              >
                <PencilSimpleIcon size={15} /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onArchive(habit._id); }}
                style={{
                  alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                  gap: 10, minHeight: 'auto', minWidth: 'auto', padding: '10px 14px', width: '100%',
                  color: 'var(--color-danger)', fontSize: '0.85rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <TrashIcon size={15} /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
