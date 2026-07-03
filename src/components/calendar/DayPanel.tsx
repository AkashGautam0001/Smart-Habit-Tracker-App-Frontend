import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, CircleIcon, XIcon, TimerIcon } from '@phosphor-icons/react';
import { analyticsApi } from '../../api/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  date: string | null;
  onClose: () => void;
  isMobile: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatMinutes(m: number) {
  if (m >= 60) {
    return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`.trim();
  }
  return `${m}m`;
}

export default function DayPanel({ date, onClose, isMobile }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['day-detail', date],
    queryFn: () =>
      date ? analyticsApi.getDay(date).then((r) => r.data.data) : null,
    enabled: !!date,
    staleTime: 60_000,
  });

  const displayDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  const completedHabits = (data?.habits ?? []).filter(
    (h: { completed: boolean }) => h.completed,
  );
  const pendingHabits = (data?.habits ?? []).filter(
    (h: { completed: boolean }) => !h.completed,
  );
  const doneSessions = (data?.sessions ?? []).filter(
    (s: { wasCompleted: boolean }) => s.wasCompleted,
  );

  const panelContent = (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-4 py-3.5">
        <div>
          <div className="text-[0.95rem] font-semibold text-foreground">
            {displayDate}
          </div>
          {data && (
            <div className="mt-0.5 text-[0.72rem] text-muted-foreground">
              {completedHabits.length}/{data.habits.length} habits ·{' '}
              {formatMinutes(data.totalFocusMinutes || 0)} focus
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon size={14} weight="bold" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}

      {!isLoading && data && (
        <div className="flex flex-col">
          {doneSessions.length > 0 && (
            <section className="border-b px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5">
                <TimerIcon size={14} className="text-primary" />
                <span className="text-[0.78rem] font-semibold text-muted-foreground">
                  Focus — {formatMinutes(data.totalFocusMinutes)}
                </span>
              </div>
              {doneSessions.map(
                (
                  s: { startTime: string; subject: string; duration: number },
                  i: number,
                ) => (
                  <div key={i} className="mb-1.5 flex items-center gap-2">
                    <TimerIcon size={13} weight="duotone" className="shrink-0 text-primary" />
                    <span className="flex-1 text-[0.82rem] text-foreground">
                      {s.subject || 'General Focus'}
                    </span>
                    <span className="text-[0.72rem] text-muted-foreground">
                      {s.duration}m · {formatTime(s.startTime)}
                    </span>
                  </div>
                ),
              )}
            </section>
          )}

          {data.habits.length > 0 && (
            <section className="border-b px-4 py-3">
              <div className="mb-2 text-[0.78rem] font-semibold text-muted-foreground">
                Habits ({completedHabits.length}/{data.habits.length})
              </div>
              {[...completedHabits, ...pendingHabits].map(
                (h: {
                  _id: string;
                  color: string;
                  title: string;
                  completed: boolean;
                }) => (
                  <div key={h._id} className="mb-1.5 flex items-center gap-2">
                    <div
                      className="h-4 w-0.5 shrink-0 rounded-sm bg-(--habit-c)"
                      style={{ '--habit-c': h.color } as React.CSSProperties}
                    />
                    {h.completed ? (
                      <CheckCircleIcon
                        size={16}
                        weight="fill"
                        className="text-chart-2"
                      />
                    ) : (
                      <CircleIcon size={16} className="text-border" />
                    )}
                    <span
                      className={cn(
                        'flex-1 text-[0.82rem]',
                        h.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {h.title}
                    </span>
                  </div>
                ),
              )}
            </section>
          )}

          {data.tasks.length > 0 && (
            <section className="px-4 py-3">
              <div className="mb-2 text-[0.78rem] font-semibold text-muted-foreground">
                Tasks (
                {data.tasks.filter((t: { isCompleted: boolean }) => t.isCompleted).length}
                /{data.tasks.length})
              </div>
              {data.tasks.map(
                (t: {
                  _id: string;
                  title: string;
                  isCompleted: boolean;
                  subject: string;
                }) => (
                  <div key={t._id} className="mb-1.5 flex items-center gap-2">
                    {t.isCompleted ? (
                      <CheckCircleIcon
                        size={15}
                        weight="fill"
                        className="text-chart-2"
                      />
                    ) : (
                      <CircleIcon size={15} className="text-border" />
                    )}
                    <span
                      className={cn(
                        'flex-1 text-[0.82rem]',
                        t.isCompleted
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {t.title}
                    </span>
                    {t.subject && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[0.68rem] font-normal"
                      >
                        {t.subject}
                      </Badge>
                    )}
                  </div>
                ),
              )}
            </section>
          )}

          {data.habits.length === 0 &&
            doneSessions.length === 0 &&
            data.tasks.length === 0 && (
              <p className="px-4 py-6 text-center text-[0.85rem] text-muted-foreground">
                No activity recorded for this day.
              </p>
            )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {date && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] bg-black/50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-[101] max-h-[75dvh] overflow-hidden rounded-t-[20px] border border-border bg-card"
            >
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {date && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18 }}
        >
          <Card className="sticky top-20 max-h-[600px] overflow-hidden py-0">
            {panelContent}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
