import type { ElementType } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from '@phosphor-icons/react';
import { useAchievementStore } from '../../store/achievementStore';

const CATEGORY_COLORS: Record<string, string> = {
  habits: '#f97316',
  focus: '#6366f1',
  tasks: '#22c55e',
  milestones: '#f59e0b',
  special: '#ec4899',
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
    ? ((Icons as unknown as Record<string, ElementType>)[current.icon] ?? Icons.Star)
    : null;

  const color = current ? (CATEGORY_COLORS[current.category] ?? '#6366f1') : '#6366f1';

  return (
    <div className="pointer-events-none fixed right-5 bottom-20 z-[999]">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="pointer-events-auto flex max-w-75 gap-3 rounded-lg border bg-card p-4 shadow-lg border-(--ach-c)/40 shadow-[0_4px_24px_color-mix(in_srgb,var(--ach-c)_15%,transparent)]"
            style={{ '--ach-c': color } as React.CSSProperties}
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ach-c)_15%,transparent)]">
              {IconEl && <IconEl size={22} weight="duotone" color={color} />}
            </div>

            <div className="min-w-0">
              <div className="mb-0.5 text-[0.68rem] font-bold tracking-widest uppercase text-(--ach-c)">
                Achievement Unlocked!
              </div>
              <div className="text-sm font-semibold text-foreground">{current.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{current.description}</div>
              {current.xpReward > 0 && (
                <div className="mt-1 text-[0.72rem] font-bold text-chart-3">
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
