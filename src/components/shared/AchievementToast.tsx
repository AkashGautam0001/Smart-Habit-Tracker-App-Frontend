import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '@phosphor-icons/react';
import { useAchievementStore } from '../../store/achievementStore';

const CATEGORY_COLORS: Record<string, string> = {
  habits:     '#f97316',
  focus:      '#6366f1',
  tasks:      '#22c55e',
  milestones: '#f59e0b',
  special:    '#ec4899',
};

export default function AchievementToast() {
  const { queue, dequeue } = useAchievementStore();
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dequeue, 4500);
    return () => clearTimeout(t);
  }, [current, dequeue]);

  const IconEl = current
    ? (Icons as unknown as Record<string, React.ElementType>)[current.icon] ?? Icons.Star
    : null;

  const color = current ? (CATEGORY_COLORS[current.category] ?? '#6366f1') : '#6366f1';

  return (
    <div style={{ bottom: 80, pointerEvents: 'none', position: 'fixed', right: 20, zIndex: 999 }}>
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{
              background: 'var(--color-surface)',
              border: `1px solid ${color}60`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: `0 4px 24px ${color}25, var(--shadow-lg)`,
              display: 'flex',
              gap: 12,
              maxWidth: 300,
              padding: '14px 16px',
              pointerEvents: 'auto',
            }}
          >
            {/* Icon circle */}
            <div style={{
              alignItems: 'center',
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              borderRadius: '50%',
              display: 'flex',
              flexShrink: 0,
              height: 44,
              justifyContent: 'center',
              width: 44,
            }}>
              {IconEl && <IconEl size={22} weight="duotone" color={color} />}
            </div>

            {/* Text */}
            <div style={{ minWidth: 0 }}>
              <div style={{ color: color, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 2, textTransform: 'uppercase' }}>
                Achievement Unlocked!
              </div>
              <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600 }}>
                {current.title}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                {current.description}
              </div>
              {current.xpReward > 0 && (
                <div style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 700, marginTop: 4 }}>
                  +{current.xpReward} XP bonus
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
