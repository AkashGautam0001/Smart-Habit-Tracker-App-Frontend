import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeftIcon, CaretRightIcon, NotePencilIcon, LockIcon, CheckCircleIcon, ClockIcon } from '@phosphor-icons/react';
import { useJournalEntry, useSaveJournal, useJournalHistory } from '../hooks/useJournal';
import RichTextEditor from '../components/journal/RichTextEditor';
import { usePlan } from '../hooks/usePlan';
import { APP_CONFIG } from '../config/app.config';
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const FREE_CHAR_LIMIT = 500;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = todayStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === yStr) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Amazing' },
] as const;

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function Journal() {
  const [date, setDate] = useState(todayStr());
  const [mood, setMood] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [proAlert, setProAlert] = useState(false);

  const { isPro, canDo } = usePlan();
  const charLimit = canDo('richTextNotes') ? undefined : FREE_CHAR_LIMIT;

  const { data: entry, isLoading } = useJournalEntry(date);
  const saveMutation = useSaveJournal();
  const { data: history = [] } = useJournalHistory(isPro);

  const pendingRef = useRef({ content: '', mood: null as number | null });
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync loaded entry into local state
  useEffect(() => {
    if (entry !== undefined) {
      const c = entry?.content ?? '';
      const m = entry?.mood ?? null;
      setContent(c);
      setMood(m);
      pendingRef.current = { content: c, mood: m };
    }
  }, [entry]);

  const doSave = useCallback(async (c: string, m: number | null) => {
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ date, content: c, mood: m });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('idle');
    }
  }, [saveMutation, date]);

  const handleContentChange = (html: string) => {
    setContent(html);
    pendingRef.current.content = html;
    setSaveStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doSave(pendingRef.current.content, pendingRef.current.mood);
    }, 1400);
  };

  const handleMoodClick = async (val: number) => {
    const newMood = mood === val ? null : val;
    setMood(newMood);
    pendingRef.current.mood = newMood;
    if (timerRef.current) clearTimeout(timerRef.current);
    await doSave(pendingRef.current.content, newMood);
  };

  const goBack = () => {
    if (!isPro) { setProAlert(true); return; }
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const goForward = () => {
    if (date >= todayStr()) return;
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === todayStr();

  // History entries with content (have dots on sidebar)
  const historyMap = new Set(history.filter((e) => e.content && e.content !== '<p></p>').map((e) => e.date));

  return (
    <>
      <Helmet>
        <title>Journal | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell className="max-w-[820px]">
        <div
          className={cn(
            'grid items-start gap-6',
            isPro && history.length > 0 && 'lg:grid-cols-[minmax(0,1fr)_200px]',
          )}
        >
          <div className="flex flex-col gap-4">
            <PageHeader
              title={
                <span className="flex w-full items-center justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={goBack} className="gap-1">
                    <CaretLeftIcon size={14} />
                    {!isPro && <LockIcon size={12} className="text-muted-foreground" />}
                  </Button>
                  <span className="flex flex-col items-center text-center">
                    <span className="text-base font-bold">{formatDate(date)}</span>
                    {!isToday && (
                      <span className="mt-0.5 text-[0.72rem] text-muted-foreground">
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goForward}
                    disabled={isToday}
                    aria-label="Next day"
                  >
                    <CaretRightIcon size={14} />
                  </Button>
                </span>
              }
            />

            <AnimatePresence>
              {proAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="flex items-start gap-3 px-3.5 py-3">
                      <LockIcon size={18} className="mt-0.5 shrink-0 text-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Past entries require Pro</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Upgrade to browse and write in your full journal history.
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button size="sm" asChild>
                          <Link to="/upgrade">Upgrade</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setProAlert(false)}
                          aria-label="Dismiss"
                        >
                          ×
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card>
              <CardContent className="px-4 py-3">
                <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  How are you feeling?
                </p>
                <div className="flex gap-1.5">
                  {MOODS.map(({ value, emoji, label }) => {
                    const selected = mood === value;
                    return (
                      <motion.div key={value} whileTap={{ scale: 0.9 }} className="flex-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleMoodClick(value)}
                          title={label}
                          className={cn(
                            'h-auto w-full flex-col gap-0.5 py-2 text-xl',
                            selected
                              ? 'border-2 border-primary bg-primary/15 text-primary'
                              : 'border-2 border-transparent bg-muted hover:bg-muted',
                          )}
                        >
                          <span>{emoji}</span>
                          <span
                            className={cn(
                              'text-[0.65rem] font-medium',
                              selected ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {label}
                          </span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div>
              {isLoading ? (
                <Skeleton className="h-[360px] rounded-xl" />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <RichTextEditor
                      content={content}
                      onChange={handleContentChange}
                      placeholder="What happened today? What are you thinking about?"
                      charLimit={charLimit}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <AnimatePresence>
              {saveStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  {saveStatus === 'saving' ? (
                    <ClockIcon size={13} className="text-muted-foreground" />
                  ) : (
                    <CheckCircleIcon size={13} className="text-green-500" />
                  )}
                  <span
                    className={cn(
                      'text-[0.73rem]',
                      saveStatus === 'saving' ? 'text-muted-foreground' : 'text-green-500',
                    )}
                  >
                    {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {!isPro && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-2.5 px-3.5 py-2.5">
                  <NotePencilIcon size={16} weight="duotone" className="shrink-0 text-primary" />
                  <p className="flex-1 text-sm text-muted-foreground">
                    Free plan: today&apos;s entry only, {FREE_CHAR_LIMIT}-character limit.{' '}
                    <Link to="/upgrade" className="font-medium text-primary hover:underline">
                      Upgrade to Pro
                    </Link>{' '}
                    for unlimited history and rich formatting.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {isPro && history.length > 0 && (
            <Card className="gap-0 overflow-hidden py-0">
              <CardHeader className="border-b px-3.5 py-2.5">
                <CardTitle className="text-sm font-semibold">Recent Entries</CardTitle>
              </CardHeader>
              <div className="max-h-[420px] overflow-y-auto">
                {history.slice(0, 30).map((e, idx) => (
                  <div key={e.date}>
                    {idx > 0 && <Separator />}
                    <button
                      type="button"
                      onClick={() => setDate(e.date)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-2.5 border-none px-3.5 py-2.5 text-left transition-colors',
                        date === e.date ? 'bg-primary/10' : 'bg-transparent hover:bg-muted/50',
                      )}
                    >
                      <span
                        className={cn(
                          'size-[7px] shrink-0 rounded-full',
                          historyMap.has(e.date) ? 'bg-primary' : 'bg-border',
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            date === e.date ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          {formatDate(e.date)}
                        </p>
                        {e.mood && (
                          <span className="text-[0.7rem]">
                            {MOODS.find((m) => m.value === e.mood)?.emoji}
                          </span>
                        )}
                      </div>
                      {e.wordCount > 0 && (
                        <Badge variant="secondary" className="ml-auto text-[0.68rem]">
                          {e.wordCount}w
                        </Badge>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </PageShell>
    </>
  );
}
