import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapTrifoldIcon,
  CaretDownIcon,
  CaretUpIcon,
  SparkleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { aiApi, type StudyWeek } from '../../api/ai';
import { useSettings } from '../../hooks/useSettings';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function StudyPlannerCard() {
  const settings = useSettings();
  const subjects = settings.subjects.map((s) => s.label);

  const [goalTitle, setGoalTitle] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [selectedSubs, setSelectedSubs] = useState<string[]>(subjects.slice(0, 2));
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<StudyWeek[]>({
    queryKey: ['study-plan', goalTitle, durationWeeks, selectedSubs],
    queryFn: () =>
      aiApi.studyPlan(goalTitle, durationWeeks, selectedSubs).then(
        (r) => r.data.data.plan,
      ),
    enabled: submitted,
    staleTime: Infinity,
  });

  const toggleSub = (sub: string) =>
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub],
    );

  const handleGenerate = () => {
    if (!goalTitle.trim() || selectedSubs.length === 0) return;
    setSubmitted(true);
    setExpandedWeek(1);
    if (submitted) refetch();
  };

  const handleReset = () => {
    setSubmitted(false);
    setGoalTitle('');
    setSelectedSubs(subjects.slice(0, 2));
    setDurationWeeks(4);
  };

  const canGenerate = goalTitle.trim().length > 0 && selectedSubs.length > 0;

  return (
    <Card className="border-chart-2/20 bg-gradient-to-br from-chart-2/7 to-primary/6">
      <CardHeader className="pb-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
          <MapTrifoldIcon size={18} weight="duotone" />
        </div>
        <CardTitle className="text-[0.88rem]">AI Study Planner</CardTitle>
        <CardDescription className="text-[0.72rem]">
          Turn your goal into a week-by-week roadmap
        </CardDescription>
        {submitted && (
          <CardAction>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              New Plan
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {!submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="space-y-1.5">
                <Label className="text-[0.78rem] text-muted-foreground">Goal</Label>
                <Input
                  placeholder="e.g. Master DSA in 3 months"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[0.78rem] text-muted-foreground">
                  Duration — {durationWeeks} weeks
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[2, 4, 6, 8, 12].map((w) => (
                    <Button
                      key={w}
                      type="button"
                      variant={durationWeeks === w ? 'secondary' : 'outline'}
                      size="sm"
                      className={cn(
                        durationWeeks === w &&
                          'border-chart-2/40 bg-chart-2/15 text-chart-2 hover:bg-chart-2/20',
                      )}
                      onClick={() => setDurationWeeks(w)}
                    >
                      {w}w
                    </Button>
                  ))}
                </div>
              </div>

              {subjects.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[0.78rem] text-muted-foreground">
                    Subjects to include
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map((s) => {
                      const selected = selectedSubs.includes(s);
                      return (
                        <Button
                          key={s}
                          type="button"
                          variant={selected ? 'secondary' : 'outline'}
                          size="sm"
                          className={cn(
                            selected &&
                              'border-primary/40 bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary',
                          )}
                          onClick={() => toggleSub(s)}
                        >
                          {s}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full border-chart-2/30 bg-chart-2/15 text-chart-2 hover:bg-chart-2/20 hover:text-chart-2"
                disabled={!canGenerate}
                onClick={handleGenerate}
              >
                <SparkleIcon size={15} weight="duotone" />
                Generate Study Plan
              </Button>
            </motion.div>
          )}

          {submitted && isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    'h-12 w-full',
                    i === 0 && 'opacity-60',
                    i === 1 && 'opacity-45',
                    i === 2 && 'opacity-30',
                  )}
                />
              ))}
              <p className="mt-2 text-center text-[0.76rem] text-muted-foreground">
                Building your {durationWeeks}-week plan…
              </p>
            </motion.div>
          )}

          {submitted && error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2.5"
            >
              <p className="m-0 text-[0.8rem] text-destructive">
                {(error as Error).message}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Try again
              </Button>
            </motion.div>
          )}

          {submitted && data && !isLoading && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <p className="mb-1 text-[0.72rem] text-muted-foreground">
                {durationWeeks}-week plan for &quot;{goalTitle}&quot;
              </p>
              {data.map((week) => (
                <Card
                  key={week.week}
                  size="sm"
                  className={cn(
                    'gap-0 overflow-hidden py-0 transition-colors',
                    expandedWeek === week.week &&
                      'ring-chart-2/30',
                  )}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between gap-2.5 rounded-none px-3.5 py-2.5"
                    onClick={() =>
                      setExpandedWeek(expandedWeek === week.week ? null : week.week)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="h-[22px] rounded-md bg-chart-2/15 px-1.5 text-[0.68rem] font-bold text-chart-2 hover:bg-chart-2/15">
                        W{week.week}
                      </Badge>
                      <span className="text-[0.82rem] font-semibold text-foreground">
                        {week.theme}
                      </span>
                    </div>
                    {expandedWeek === week.week ? (
                      <CaretUpIcon
                        size={13}
                        weight="bold"
                        className="text-muted-foreground"
                      />
                    ) : (
                      <CaretDownIcon
                        size={13}
                        weight="bold"
                        className="text-muted-foreground"
                      />
                    )}
                  </Button>

                  <AnimatePresence>
                    {expandedWeek === week.week && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-2 border-t px-3.5 py-2.5">
                          <div>
                            <p className="mb-1 text-[0.68rem] font-semibold tracking-wider text-muted-foreground uppercase">
                              Goals
                            </p>
                            <ul className="m-0 flex list-none flex-col gap-1 p-0">
                              {week.goals.map((g, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-1.5 text-[0.8rem] text-muted-foreground"
                                >
                                  <span className="mt-0.5 shrink-0 text-[0.7rem] text-chart-2">
                                    ✓
                                  </span>
                                  {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-md bg-chart-2/8 px-2.5 py-1.5">
                            <p className="mb-0.5 text-[0.67rem] font-semibold tracking-wider text-muted-foreground uppercase">
                              Daily
                            </p>
                            <p className="m-0 text-[0.79rem] text-muted-foreground">
                              {week.dailySuggestion}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
