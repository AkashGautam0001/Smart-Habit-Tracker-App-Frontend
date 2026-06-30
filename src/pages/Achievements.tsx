import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import * as Icons from '@phosphor-icons/react';
import { LockIcon } from '@phosphor-icons/react';
import { apiClient } from '../api/client';
import { ACHIEVEMENTS, CATEGORY_LABELS, type AchievementCategory } from '../config/achievements.config';
import { APP_CONFIG } from '../config/app.config';

const CATEGORY_COLORS: Record<string, string> = {
  habits:     '#f97316',
  focus:      '#6366f1',
  tasks:      '#22c55e',
  milestones: '#f59e0b',
  special:    '#ec4899',
};

const TABS: Array<{ id: AchievementCategory | 'all'; label: string }> = [
  { id: 'all',        label: 'All' },
  { id: 'habits',     label: CATEGORY_LABELS.habits },
  { id: 'focus',      label: CATEGORY_LABELS.focus },
  { id: 'tasks',      label: CATEGORY_LABELS.tasks },
  { id: 'milestones', label: CATEGORY_LABELS.milestones },
  { id: 'special',    label: CATEGORY_LABELS.special },
];

interface ServerAchievement {
  id: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export default function Achievements() {
  const [activeTab, setActiveTab] = useState<AchievementCategory | 'all'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiClient.get('/users/achievements').then((r) => r.data.data),
    staleTime: 60_000,
  });

  const serverMap: Record<string, ServerAchievement> = {};
  (data?.achievements ?? []).forEach((a: ServerAchievement) => { serverMap[a.id] = a; });

  const unlockedCount = data?.unlockedCount ?? 0;
  const total         = ACHIEVEMENTS.length;

  const filtered = ACHIEVEMENTS.filter(
    (a) => activeTab === 'all' || a.category === activeTab,
  );

  // Sort: unlocked first, then locked
  const sorted = [...filtered].sort((a, b) => {
    const aU = !!serverMap[a.id]?.isUnlocked;
    const bU = !!serverMap[b.id]?.isUnlocked;
    if (aU && !bU) return -1;
    if (!aU && bU) return 1;
    return 0;
  });

  return (
    <>
      <Helmet>
        <title>Achievements | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{ maxWidth: 840 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: 'var(--color-text)', fontSize: '1.3rem', fontWeight: 700 }}>Achievements</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            {isLoading ? 'Loading…' : `${unlockedCount} of ${total} unlocked`}
          </p>

          {/* Progress bar */}
          {!isLoading && (
            <div style={{ background: 'var(--color-surface-hover)', borderRadius: 99, height: 5, marginTop: 10, overflow: 'hidden', width: '100%' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / total) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                style={{ background: 'linear-gradient(90deg, var(--color-accent), #f59e0b)', borderRadius: 99, height: '100%' }}
              />
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-surface)',
                border: `1px solid ${activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 99,
                color: activeTab === tab.id ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                minHeight: 'auto', minWidth: 'auto', padding: '6px 14px',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 140, opacity: 0.4 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {sorted.map((a, i) => {
              const server = serverMap[a.id];
              const isUnlocked = !!server?.isUnlocked;
              const color = CATEGORY_COLORS[a.category] ?? 'var(--color-accent)';
              const IconEl = (Icons as unknown as Record<string, React.ElementType>)[a.icon] ?? Icons.Star;
              const unlockedDate = server?.unlockedAt
                ? new Date(server.unlockedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : null;

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="card"
                  style={{
                    border: isUnlocked ? `1px solid ${color}40` : '1px solid var(--color-border)',
                    boxShadow: isUnlocked ? `0 0 16px ${color}18` : 'none',
                    opacity: isUnlocked ? 1 : 0.6,
                    padding: '18px 16px',
                    position: 'relative',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    alignItems: 'center',
                    background: isUnlocked
                      ? `color-mix(in srgb, ${color} 15%, transparent)`
                      : 'var(--color-surface-hover)',
                    borderRadius: '50%',
                    display: 'flex',
                    height: 48,
                    justifyContent: 'center',
                    marginBottom: 12,
                    width: 48,
                  }}>
                    {isUnlocked
                      ? <IconEl size={24} weight="duotone" color={color} />
                      : <LockIcon size={20} weight="duotone" color="var(--color-text-muted)" />
                    }
                  </div>

                  {/* Badge pill */}
                  <div style={{
                    background: `color-mix(in srgb, ${color} 15%, transparent)`,
                    borderRadius: 99,
                    color,
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    marginBottom: 6,
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                  }}>
                    {CATEGORY_LABELS[a.category]}
                  </div>

                  {/* Title */}
                  <div style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>
                    {a.title}
                  </div>

                  {/* Description */}
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {a.description}
                  </div>

                  {/* Unlock info / XP reward */}
                  <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    {isUnlocked && unlockedDate ? (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem' }}>
                        🗓 {unlockedDate}
                      </span>
                    ) : (
                      <span />
                    )}
                    {a.xpReward > 0 && (
                      <span style={{ color: isUnlocked ? '#f59e0b' : 'var(--color-text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>
                        +{a.xpReward} XP
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
