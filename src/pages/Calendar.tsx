import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CaretLeftIcon, CaretRightIcon, CalendarBlankIcon } from '@phosphor-icons/react';
import CalendarGrid from '../components/calendar/CalendarGrid';
import DayPanel from '../components/calendar/DayPanel';
import { analyticsApi } from '../api/analytics';
import { APP_CONFIG } from '../config/app.config';
import PageShell from '@/components/shared/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function Calendar() {
  const [current, setCurrent]       = useState(() => new Date());
  const [selectedDate, setSelected] = useState<string | null>(null);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const mk = monthKey(current);
  const { data, isLoading } = useQuery({
    queryKey: ['calendar', mk],
    queryFn: () => analyticsApi.getCalendar(mk).then((r) => r.data.data),
    staleTime: 2 * 60_000,
  });

  const prevMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
    setSelected(null);
  };

  const nextMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
    setSelected(null);
  };

  const isThisMonth = monthKey(current) === monthKey(new Date());

  // Quick month stats
  const days = data?.days ?? [];
  const activeDays = days.filter((d: { habitsPct: number; focusMinutes: number }) => d.habitsPct > 0 || d.focusMinutes > 0).length;
  const totalFocus = days.reduce((s: number, d: { focusMinutes: number }) => s + d.focusMinutes, 0);
  const perfectDays = days.filter((d: { habitsPct: number }) => d.habitsPct === 100).length;

  return (
    <>
      <Helmet>
        <title>Calendar | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell
        className={cn(
          !isMobile && 'grid grid-cols-1 items-start justify-center gap-5 space-y-0 lg:grid-cols-[minmax(0,640px)_minmax(0,340px)]',
        )}
      >
        <div className="flex flex-col gap-4">
          {!isLoading && days.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { label: 'Active days',  value: activeDays,  tint: 'from-primary/10' },
                { label: 'Perfect days', value: perfectDays, tint: 'from-green-500/10' },
                { label: 'Focus time',   value: totalFocus >= 60 ? `${Math.floor(totalFocus / 60)}h` : `${totalFocus}m`, tint: 'from-orange-500/10' },
              ].map((s) => (
                <Card key={s.label} size="sm" className={cn('bg-linear-to-br via-card to-card py-0', s.tint)}>
                  <CardContent className="px-3 py-3 text-center">
                    <div className="text-xl font-bold text-foreground">{s.value}</div>
                    <div className="mt-0.5 text-[0.72rem] text-muted-foreground">{s.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          <Card className="py-0">
            <CardContent className="p-4">
              {/* Month navigation inside the calendar */}
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-base font-bold text-foreground">
                  {monthLabel(current)}
                </h1>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth} aria-label="Previous month">
                      <CaretLeftIcon size={14} weight="bold" />
                    </motion.button>
                  </Button>
                  <Button
                    variant={isThisMonth ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6.5 px-2 text-[0.7rem]"
                    onClick={() => { setCurrent(new Date()); setSelected(null); }}
                  >
                    Today
                  </Button>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth} aria-label="Next month">
                      <CaretRightIcon size={14} weight="bold" />
                    </motion.button>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-md opacity-40" />
                  ))}
                </div>
              ) : (
                <CalendarGrid
                  days={days}
                  selectedDate={selectedDate}
                  onSelect={(d) => setSelected((prev) => prev === d ? null : d)}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {isMobile ? (
          <DayPanel
            date={selectedDate}
            onClose={() => setSelected(null)}
            isMobile
          />
        ) : (
          <div className="min-h-0">
            {selectedDate ? (
              <DayPanel
                date={selectedDate}
                onClose={() => setSelected(null)}
                isMobile={false}
              />
            ) : (
              <Card className="sticky top-20">
                <CardContent className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted/60">
                    <CalendarBlankIcon size={20} weight="duotone" className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No day selected</p>
                  <p className="text-[0.72rem] text-muted-foreground">
                    Click a day on the calendar to see its habits, focus sessions and tasks.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </PageShell>
    </>
  );
}
