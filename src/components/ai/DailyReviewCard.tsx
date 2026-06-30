import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RobotIcon, SparkleIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { streamAI } from '../../api/ai';

interface Props {
  date: string;
}

type State = 'idle' | 'streaming' | 'done' | 'error';

export default function DailyReviewCard({ date }: Props) {
  const [state,   setState]   = useState<State>('idle');
  const [content, setContent] = useState('');
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  const generate = async () => {
    abortRef.current = false;
    setState('streaming');
    setContent('');
    setError('');

    try {
      for await (const chunk of streamAI('/ai/daily-review', { date })) {
        if (abortRef.current) break;
        setContent((prev) => prev + chunk);
      }
      setState('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setState('error');
    }
  };

  const reset = () => {
    abortRef.current = true;
    setState('idle');
    setContent('');
    setError('');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 'var(--radius-xl)',
      padding: '18px 20px',
    }}>
      {/* Header */}
      <div style={{ alignItems: 'center', display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{
          alignItems: 'center', background: 'rgba(99,102,241,0.15)', borderRadius: 8,
          color: 'var(--color-accent)', display: 'flex', height: 32, justifyContent: 'center', width: 32,
        }}>
          <RobotIcon size={18} weight="duotone" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--color-text)', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
            AI Daily Review
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', margin: 0 }}>
            Personalized insights based on today's data
          </p>
        </div>
        {state === 'done' && (
          <button
            onClick={reset}
            title="Regenerate"
            style={{
              alignItems: 'center', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)',
              borderRadius: 6, color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'flex', height: 28, justifyContent: 'center', minHeight: 'auto', minWidth: 'auto', width: 28,
            }}
          >
            <ArrowClockwiseIcon size={13} weight="bold" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="btn"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={generate}
            style={{
              alignItems: 'center', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-accent)', cursor: 'pointer',
              display: 'flex', fontSize: '0.82rem', fontWeight: 600, gap: 6,
              justifyContent: 'center', minHeight: 'auto', minWidth: 'auto', padding: '10px 16px',
              width: '100%',
            }}
          >
            <SparkleIcon size={15} weight="duotone" />
            Generate Today's Review
          </motion.button>
        )}

        {(state === 'streaming' || state === 'done') && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <p style={{
              color: 'var(--color-text-secondary)', fontSize: '0.83rem',
              lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap',
            }}>
              {content}
              {state === 'streaming' && (
                <span style={{
                  animation: 'pulse 1s ease-in-out infinite',
                  background: 'var(--color-accent)', borderRadius: 1,
                  display: 'inline-block', height: '0.85em',
                  marginLeft: 2, verticalAlign: 'text-bottom', width: 2,
                }} />
              )}
            </p>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <p style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem', margin: '0 0 10px' }}>
              {error}
            </p>
            <button
              onClick={generate}
              style={{
                background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)',
                cursor: 'pointer', fontSize: '0.78rem', padding: '6px 12px',
              }}
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
