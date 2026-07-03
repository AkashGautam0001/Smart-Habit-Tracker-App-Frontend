import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainIcon, SparkleIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { streamAI } from '../../api/ai';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  date: string;
}

type State = 'idle' | 'streaming' | 'done' | 'error';

export default function WeeklyReviewCard({ date }: Props) {
  const [state, setState] = useState<State>('idle');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef(false);

  const generate = async () => {
    abortRef.current = false;
    setState('streaming');
    setContent('');
    setError('');

    try {
      for await (const chunk of streamAI('/ai/weekly-review', { date })) {
        if (abortRef.current) break;
        setContent((prev) => prev + chunk);
      }
      setState('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
    <Card className="border-[#8b5cf6]/25 bg-gradient-to-br from-[#8b5cf6]/8 to-primary/6">
      <CardHeader className="pb-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6]">
          <BrainIcon size={18} weight="duotone" />
        </div>
        <CardTitle className="text-[0.88rem]">AI Weekly Review</CardTitle>
        <CardDescription className="text-[0.72rem]">
          Trends, insights and priorities from the last 7 days
        </CardDescription>
        {state === 'done' && (
          <CardAction>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={reset}
              title="Regenerate"
            >
              <ArrowClockwiseIcon size={13} weight="bold" />
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="btn"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#8b5cf6]/30 bg-[#8b5cf6]/12 text-[#8b5cf6] hover:bg-[#8b5cf6]/20 hover:text-[#8b5cf6]"
                onClick={generate}
              >
                <SparkleIcon size={15} weight="duotone" />
                Generate Weekly Review
              </Button>
            </motion.div>
          )}

          {(state === 'streaming' || state === 'done') && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="m-0 whitespace-pre-wrap text-[0.83rem] leading-relaxed text-muted-foreground">
                {content}
                {state === 'streaming' && (
                  <span className="ml-0.5 inline-block h-[0.85em] w-0.5 animate-pulse rounded-sm bg-[#8b5cf6] align-text-bottom" />
                )}
              </p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              <p className="m-0 text-[0.8rem] text-destructive">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={generate}>
                Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
