import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeftIcon, CaretRightIcon, NotePencilIcon, LockIcon, CheckCircleIcon, ClockIcon } from '@phosphor-icons/react';
import { useJournalEntry, useSaveJournal, useJournalHistory } from '../hooks/useJournal';
import RichTextEditor from '../components/journal/RichTextEditor';
import { usePlan } from '../hooks/usePlan';
import { APP_CONFIG } from '../config/app.config';

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

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isPro && history.length > 0 ? 'minmax(0,1fr) 200px' : '1fr', alignItems: 'start', maxWidth: 820 }}
        className="journal-grid">
        {/* ─── Main editor column ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Date navigation */}
          <div style={{ alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <button
              onClick={goBack}
              style={{
                alignItems: 'center', background: 'var(--color-surface)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
                display: 'flex', gap: 4, minHeight: 'auto', padding: '6px 12px', fontSize: '0.8rem',
              }}
            >
              <CaretLeftIcon size={14} />
              {!isPro && <LockIcon size={12} color="var(--color-text-muted)" />}
            </button>

            <div style={{ textAlign: 'center' }}>
              <h1 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 700 }}>
                {formatDate(date)}
              </h1>
              {!isToday && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            <button
              onClick={goForward}
              disabled={isToday}
              style={{
                alignItems: 'center', background: 'var(--color-surface)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                color: isToday ? 'var(--color-border)' : 'var(--color-text-secondary)',
                cursor: isToday ? 'not-allowed' : 'pointer',
                display: 'flex', minHeight: 'auto', padding: '6px 12px',
              }}
            >
              <CaretRightIcon size={14} />
            </button>
          </div>

          {/* Pro alert */}
          <AnimatePresence>
            {proAlert && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="card"
                style={{
                  alignItems: 'flex-start', display: 'flex', gap: 12, padding: '12px 14px',
                  background: 'color-mix(in srgb, var(--color-warning) 8%, var(--color-surface))',
                  borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                }}
              >
                <LockIcon size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600 }}>Past entries require Pro</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                    Upgrade to browse and write in your full journal history.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '5px 12px', minHeight: 'auto' }}
                    onClick={() => window.location.href = '/upgrade'}>
                    Upgrade
                  </button>
                  <button onClick={() => setProAlert(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mood picker */}
          <div className="card" style={{ padding: '12px 16px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              How are you feeling?
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {MOODS.map(({ value, emoji, label }) => {
                const selected = mood === value;
                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMoodClick(value)}
                    title={label}
                    style={{
                      alignItems: 'center',
                      background: selected
                        ? 'color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-hover))'
                        : 'var(--color-surface-hover)',
                      border: `2px solid ${selected ? 'var(--color-accent)' : 'transparent'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                      fontSize: '1.3rem',
                      gap: 3,
                      minHeight: 'auto',
                      padding: '8px 4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{emoji}</span>
                    <span style={{ color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '0.65rem', fontWeight: 500 }}>
                      {label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div>
            {isLoading ? (
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                height: 360,
              }}
                className="skeleton"
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
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

          {/* Save status */}
          <AnimatePresence>
            {saveStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ alignItems: 'center', display: 'flex', gap: 6 }}
              >
                {saveStatus === 'saving' ? (
                  <ClockIcon size={13} color="var(--color-text-muted)" />
                ) : (
                  <CheckCircleIcon size={13} color="var(--color-success)" />
                )}
                <span style={{ color: saveStatus === 'saving' ? 'var(--color-text-muted)' : 'var(--color-success)', fontSize: '0.73rem' }}>
                  {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Free plan notice */}
          {!isPro && (
            <div style={{
              alignItems: 'center', display: 'flex', gap: 10,
              background: 'color-mix(in srgb, var(--color-accent) 6%, var(--color-surface))',
              border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 14px',
            }}>
              <NotePencilIcon size={16} weight="duotone" color="var(--color-accent)" />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', flex: 1 }}>
                Free plan: today's entry only, {FREE_CHAR_LIMIT}-character limit.{' '}
                <a href="/upgrade" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
                  Upgrade to Pro
                </a>{' '}
                for unlimited history and rich formatting.
              </p>
            </div>
          )}
        </div>

        {/* ─── Pro history sidebar ─── */}
        {isPro && history.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 14px' }}>
              <h2 style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 600 }}>Recent Entries</h2>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {history.slice(0, 30).map((e) => (
                <button
                  key={e.date}
                  onClick={() => setDate(e.date)}
                  style={{
                    alignItems: 'center',
                    background: date === e.date ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    padding: '10px 14px',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{
                    background: historyMap.has(e.date) ? 'var(--color-accent)' : 'var(--color-border)',
                    borderRadius: '50%',
                    flexShrink: 0,
                    height: 7,
                    width: 7,
                  }} />
                  <div>
                    <p style={{ color: date === e.date ? 'var(--color-accent)' : 'var(--color-text)', fontSize: '0.8rem', fontWeight: 500 }}>
                      {formatDate(e.date)}
                    </p>
                    {e.mood && (
                      <span style={{ fontSize: '0.7rem' }}>
                        {MOODS.find((m) => m.value === e.mood)?.emoji}
                      </span>
                    )}
                  </div>
                  {e.wordCount > 0 && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', marginLeft: 'auto' }}>
                      {e.wordCount}w
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
