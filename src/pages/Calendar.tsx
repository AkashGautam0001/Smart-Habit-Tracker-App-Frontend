import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
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
          'max-w-[900px]',
          selectedDate && !isMobile && 'grid grid-cols-[1fr_300px] gap-5 space-y-0',
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" asChild>
                <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth}>
                  <CaretLeftIcon size={15} weight="bold" />
                </motion.button>
              </Button>

              <h1 className="min-w-40 text-center text-lg font-bold text-foreground">
                {monthLabel(current)}
              </h1>

              <Button variant="outline" size="icon-sm" asChild>
                <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth}>
                  <CaretRightIcon size={15} weight="bold" />
                </motion.button>
              </Button>
            </div>

            {!isThisMonth && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setCurrent(new Date()); setSelected(null); }}
              >
                Today
              </Button>
            )}
          </div>

          {!isLoading && days.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {[
                { label: 'Active days',  value: activeDays },
                { label: 'Perfect days', value: perfectDays },
                { label: 'Focus time',   value: totalFocus >= 60 ? `${Math.floor(totalFocus / 60)}h` : `${totalFocus}m` },
              ].map((s) => (
                <Card key={s.label} size="sm" className="py-0">
                  <CardContent className="px-3 py-2.5 text-center">
                    <div className="text-lg font-bold text-foreground">{s.value}</div>
                    <div className="mt-0.5 text-[0.7rem] text-muted-foreground">{s.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          <Card className="py-0">
            <CardContent className="p-4">
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

        <DayPanel
          date={selectedDate}
          onClose={() => setSelected(null)}
          isMobile={isMobile}
        />
      </PageShell>
    </>
  );
}
