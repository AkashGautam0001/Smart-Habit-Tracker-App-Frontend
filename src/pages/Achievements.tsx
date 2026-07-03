import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import * as Icons from '@phosphor-icons/react';
import { LockIcon } from '@phosphor-icons/react';
import { apiClient } from '../api/client';
import { ACHIEVEMENTS, CATEGORY_LABELS, type AchievementCategory } from '../config/achievements.config';
import { APP_CONFIG } from '../config/app.config';
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES: Record<string, {
  badge: string;
  icon: string;
  iconBg: string;
  border: string;
  shadow: string;
}> = {
  habits: {
    badge: 'bg-orange-500/15 text-orange-500',
    icon: 'text-orange-500',
    iconBg: 'bg-orange-500/15',
    border: 'border-orange-500/25',
    shadow: 'shadow-[0_0_16px_rgba(249,115,22,0.09)]',
  },
  focus: {
    badge: 'bg-indigo-500/15 text-indigo-500',
    icon: 'text-indigo-500',
    iconBg: 'bg-indigo-500/15',
    border: 'border-indigo-500/25',
    shadow: 'shadow-[0_0_16px_rgba(99,102,241,0.09)]',
  },
  tasks: {
    badge: 'bg-green-500/15 text-green-500',
    icon: 'text-green-500',
    iconBg: 'bg-green-500/15',
    border: 'border-green-500/25',
    shadow: 'shadow-[0_0_16px_rgba(34,197,94,0.09)]',
  },
  milestones: {
    badge: 'bg-amber-500/15 text-amber-500',
    icon: 'text-amber-500',
    iconBg: 'bg-amber-500/15',
    border: 'border-amber-500/25',
    shadow: 'shadow-[0_0_16px_rgba(245,158,11,0.09)]',
  },
  special: {
    badge: 'bg-pink-500/15 text-pink-500',
    icon: 'text-pink-500',
    iconBg: 'bg-pink-500/15',
    border: 'border-pink-500/25',
    shadow: 'shadow-[0_0_16px_rgba(236,72,153,0.09)]',
  },
};

const DEFAULT_CATEGORY_STYLE = CATEGORY_STYLES.focus;

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

      <PageShell className="max-w-[840px]">
        <PageHeader
          title="Achievements"
          description={isLoading ? 'Loading…' : `${unlockedCount} of ${total} unlocked`}
        />

        {!isLoading && (
          <Progress
            value={(unlockedCount / total) * 100}
            className="h-1.5 bg-muted"
          />
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as AchievementCategory | 'all')}
        >
          <TabsList className="h-auto flex-wrap">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {sorted.map((a, i) => {
              const server = serverMap[a.id];
              const isUnlocked = !!server?.isUnlocked;
              const styles = CATEGORY_STYLES[a.category] ?? DEFAULT_CATEGORY_STYLE;
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
                >
                  <Card
                    className={cn(
                      'relative transition-all duration-200',
                      isUnlocked ? styles.border : 'border-border',
                      isUnlocked ? styles.shadow : 'shadow-none',
                      isUnlocked ? 'opacity-100' : 'opacity-60',
                    )}
                  >
                    <CardContent className="px-4 py-[18px]">
                      <div
                        className={cn(
                          'mb-3 flex size-12 items-center justify-center rounded-full',
                          isUnlocked ? styles.iconBg : 'bg-muted',
                        )}
                      >
                        {isUnlocked
                          ? <IconEl size={24} weight="duotone" className={styles.icon} />
                          : <LockIcon size={20} weight="duotone" className="text-muted-foreground" />
                        }
                      </div>

                      <Badge
                        variant="secondary"
                        className={cn('mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider', styles.badge)}
                      >
                        {CATEGORY_LABELS[a.category]}
                      </Badge>

                      <div className="mb-1 text-sm font-semibold text-foreground">
                        {a.title}
                      </div>

                      <div className="text-xs leading-snug text-muted-foreground">
                        {a.description}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        {isUnlocked && unlockedDate ? (
                          <span className="text-[0.68rem] text-muted-foreground">
                            🗓 {unlockedDate}
                          </span>
                        ) : (
                          <span />
                        )}
                        {a.xpReward > 0 && (
                          <span
                            className={cn(
                              'text-[0.72rem] font-bold',
                              isUnlocked ? 'text-amber-500' : 'text-muted-foreground',
                            )}
                          >
                            +{a.xpReward} XP
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
}
