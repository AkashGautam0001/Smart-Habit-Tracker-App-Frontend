import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  CornersOutIcon, CornersInIcon, BookOpenIcon, ListChecksIcon,
  TimerIcon, FlameIcon, ClockIcon,
} from '@phosphor-icons/react';
import TimerRing from '../components/pomodoro/TimerRing';
import TimerControls from '../components/pomodoro/TimerControls';
import BreakModal from '../components/pomodoro/BreakModal';
import SessionCard from '../components/pomodoro/SessionCard';
import SoundPlayer from '../components/shared/SoundPlayer';
import PageShell from '@/components/shared/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTimer } from '../hooks/useTimer';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';
import { pomodoroApi } from '../api/pomodoro';
import { APP_CONFIG } from '../config/app.config';
import { PHASE_LABELS, type PomodoroPhase } from '../config/pomodoro.config';
import type { PomodoroSession, Task } from '../types';

const NONE_VALUE = '__none__';

function phaseTextClass(phase: PomodoroPhase) {
  return {
    focus: 'text-primary',
    short_break: 'text-green-500',
    long_break: 'text-cyan-500',
  }[phase];
}

function phaseTabClass(phase: PomodoroPhase, active: boolean) {
  if (!active) return 'text-muted-foreground hover:text-foreground';
  return {
    focus: 'bg-linear-to-r from-primary to-[#8b5cf6] text-primary-foreground shadow-md shadow-primary/25',
    short_break: 'bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/25',
    long_break: 'bg-linear-to-r from-cyan-500 to-sky-500 text-white shadow-md shadow-cyan-500/25',
  }[phase];
}

function phaseDotClass(phase: PomodoroPhase, completed: boolean) {
  if (!completed) return 'border-border bg-muted shadow-none';
  return {
    focus: 'border-primary bg-primary shadow-[0_0_6px] shadow-primary/50',
    short_break: 'border-green-500 bg-green-500 shadow-[0_0_6px] shadow-green-500/50',
    long_break: 'border-cyan-500 bg-cyan-500 shadow-[0_0_6px] shadow-cyan-500/50',
  }[phase];
}

function phaseCardClass(phase: PomodoroPhase) {
  return {
    focus: 'bg-linear-to-b from-primary/10 via-card to-card',
    short_break: 'bg-linear-to-b from-green-500/10 via-card to-card',
    long_break: 'bg-linear-to-b from-cyan-500/10 via-card to-card',
  }[phase];
}

function phaseProgressClass(phase: PomodoroPhase) {
  return {
    focus: '**:data-[slot=progress-indicator]:bg-primary',
    short_break: '**:data-[slot=progress-indicator]:bg-green-500',
    long_break: '**:data-[slot=progress-indicator]:bg-cyan-500',
  }[phase];
}

export default function Focus() {
  const timer = useTimer();
  const settings = useSettings();
  const [focusMode, setFocusMode] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [prevPhase, setPrevPhase] = useState(timer.phase);
  const manualSwitchRef = useRef(false);

  const handleTabSwitch = (p: PomodoroPhase) => {
    manualSwitchRef.current = true;
    timer.switchPhase(p);
  };

  useEffect(() => {
    if (prevPhase === 'focus' && (timer.phase === 'short_break' || timer.phase === 'long_break')) {
      if (!manualSwitchRef.current) setShowBreakModal(true);
    }
    if (timer.phase === 'focus') {
      setShowBreakModal(false);
    }
    manualSwitchRef.current = false;
    setPrevPhase(timer.phase);
  }, [timer.phase, prevPhase]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.isRunning) { timer.pause(); } else { timer.start(); }
      }
      if (e.key === 'f' || e.key === 'F') setFocusMode((f) => !f);
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [timer]);

  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: todayTasks = [] } = useTasks(todayDate);
  const incompleteTasks = (todayTasks as Task[]).filter((t) => !t.isCompleted);

  const { data: sessionsData } = useQuery({
    queryKey: ['pomodoro-sessions'],
    queryFn: () => pomodoroApi.getSessions().then((r) => r.data.data.sessions),
    staleTime: 30_000,
  });

  const { data: todayStats } = useQuery({
    queryKey: ['pomodoro-today'],
    queryFn: () => pomodoroApi.getToday().then((r) => r.data.data),
    staleTime: 30_000,
  });

  const focusSessions = (sessionsData ?? []).filter((s: PomodoroSession) => s.type === 'focus');
  const dotsInCycle = settings.sessionsUntilLongBreak;
  const completedInCycle = timer.sessionCount % dotsInCycle;

  return (
    <>
      <Helmet>
        <title>
          {timer.isRunning ? `${timer.timeDisplay} – ${PHASE_LABELS[timer.phase]} | ` : ''}
          Focus | {APP_CONFIG.name}
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <BreakModal
        open={showBreakModal && !settings.autoStartBreaks}
        phase={timer.phase}
        timeDisplay={timer.timeDisplay}
        sessionCount={timer.sessionCount}
        onSkip={() => { setShowBreakModal(false); timer.skip(); }}
      />

      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-150 flex flex-col items-center justify-center gap-8 bg-background"
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'text-sm font-bold uppercase tracking-widest',
                phaseTextClass(timer.phase),
              )}
            >
              {PHASE_LABELS[timer.phase]}
            </motion.div>

            <TimerRing progress={timer.progress} phase={timer.phase} size={280} timeDisplay={timer.timeDisplay} />

            {timer.subject && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpenIcon size={16} />
                {timer.subject}
              </div>
            )}

            <TimerControls
              isRunning={timer.isRunning}
              phase={timer.phase}
              onStart={timer.start}
              onPause={timer.pause}
              onSkip={timer.skip}
              onReset={timer.reset}
            />

            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={() => setFocusMode(false)}
            >
              <CornersInIcon size={16} />
              Exit Focus Mode
              <span className="text-[0.72rem] text-muted-foreground/60">Esc</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <PageShell>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="flex flex-col gap-5">
            {/* Phase tabs */}
            <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-border bg-card p-1.5">
              {(['focus', 'short_break', 'long_break'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={timer.isRunning}
                  className={cn(
                    'flex-1 rounded-lg px-2 py-2 text-[0.82rem] font-semibold transition-all duration-200',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    phaseTabClass(p, timer.phase === p),
                  )}
                  onClick={() => handleTabSwitch(p)}
                >
                  {PHASE_LABELS[p]}
                </button>
              ))}
            </div>

            {/* Timer card */}
            <Card className={cn('transition-colors duration-500', phaseCardClass(timer.phase))}>
              <CardContent className="px-6 py-10 text-center">
                <div className="mb-8 flex justify-center gap-2.5">
                  {Array.from({ length: dotsInCycle }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'size-2.5 rounded-full border-2 transition-all',
                        phaseDotClass(timer.phase, i < completedInCycle),
                      )}
                    />
                  ))}
                </div>

                <div
                  className={cn(
                    'mb-6 text-xs font-bold uppercase tracking-widest',
                    phaseTextClass(timer.phase),
                  )}
                >
                  {PHASE_LABELS[timer.phase]}
                </div>

                <div className="mb-8 flex justify-center">
                  <TimerRing
                    progress={timer.progress}
                    phase={timer.phase}
                    size={window.innerWidth < 480 ? 210 : 280}
                    timeDisplay={timer.timeDisplay}
                  />
                </div>

                <TimerControls
                  isRunning={timer.isRunning}
                  phase={timer.phase}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onSkip={timer.skip}
                  onReset={timer.reset}
                />

                <p className="mt-5 text-[0.72rem] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.65rem]">Space</kbd>
                  {' '}play/pause · {' '}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.65rem]">F</kbd>
                  {' '}focus mode
                </p>
              </CardContent>
            </Card>

            {/* Subject / task / focus-mode row */}
            <Card>
              <CardContent className="flex flex-col gap-3 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-2">
                    <BookOpenIcon size={16} className="shrink-0 text-muted-foreground" />
                    <Select
                      value={timer.subject ?? NONE_VALUE}
                      onValueChange={(v) => timer.setTask(timer.taskId, v === NONE_VALUE ? null : v)}
                    >
                      <SelectTrigger className="w-full flex-1" aria-label="Select subject">
                        <SelectValue placeholder="No subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>No subject</SelectItem>
                        {settings.subjects.map((s) => (
                          <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      className="w-full gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] hover:opacity-90 sm:w-auto"
                      onClick={() => setFocusMode(true)}
                    >
                      <CornersOutIcon size={16} />
                      Focus Mode
                    </Button>
                  </motion.div>
                </div>

                {incompleteTasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <ListChecksIcon size={16} className="shrink-0 text-muted-foreground" />
                    <Select
                      value={timer.taskId ?? NONE_VALUE}
                      onValueChange={(v) => {
                        if (v === NONE_VALUE) { timer.setTask(null, timer.subject); return; }
                        const task = incompleteTasks.find((t) => t._id === v);
                        timer.setTask(v, task?.subject ?? null);
                      }}
                    >
                      <SelectTrigger className="w-full flex-1" aria-label="Link to task">
                        <SelectValue placeholder="No task linked" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>No task linked</SelectItem>
                        {incompleteTasks.map((t: Task) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.subject ? `[${t.subject}] ` : ''}{t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <SoundPlayer />

            <Card>
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-sm font-semibold">Today&apos;s Sessions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-linear-to-br from-primary/12 via-card to-card border border-border px-3.5 py-3">
                    <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-primary/15">
                      <FlameIcon size={14} weight="duotone" className="text-primary" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{todayStats?.tomatoCount ?? 0}</div>
                    <div className="text-[0.7rem] text-muted-foreground">Sessions</div>
                  </div>
                  <div className="rounded-xl bg-linear-to-br from-orange-500/12 via-card to-card border border-border px-3.5 py-3">
                    <div className="mb-1.5 flex size-7 items-center justify-center rounded-lg bg-orange-500/15">
                      <ClockIcon size={14} weight="duotone" className="text-orange-500" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{todayStats?.totalMinutes ?? 0} min</div>
                    <div className="text-[0.7rem] text-muted-foreground">Focus Time</div>
                  </div>
                </div>

                {(todayStats?.subjectBreakdown?.length ?? 0) > 0 && (
                  <div className="mt-3.5 flex flex-col gap-2">
                    {todayStats!.subjectBreakdown.map(({ subject, minutes }) => (
                      <div key={subject} className="flex items-center gap-2">
                        <span className="flex-1 truncate text-sm text-muted-foreground">{subject}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{minutes}m</span>
                        <Progress
                          value={Math.min(100, (minutes / (todayStats!.totalMinutes || 1)) * 100)}
                          className={cn('h-1 w-15', phaseProgressClass(timer.phase))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {focusSessions.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="px-3.5 py-3">
                  <CardTitle className="text-sm font-semibold">Session History</CardTitle>
                </CardHeader>
                <Separator />
                <div>
                  <AnimatePresence>
                    {focusSessions.slice(0, 8).map((s: PomodoroSession, i) => (
                      <motion.div
                        key={s._id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <SessionCard session={s} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            )}

            {focusSessions.length === 0 && !timer.isRunning && (
              <Card>
                <CardContent className="flex flex-col items-center gap-2.5 px-4 py-7 text-center">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted/60">
                    <TimerIcon size={20} weight="duotone" className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No sessions yet</p>
                  <p className="text-[0.72rem] text-muted-foreground">
                    Start your first focus session today!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageShell>
    </>
  );
}
