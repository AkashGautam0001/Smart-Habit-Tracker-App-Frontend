import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { BrainIcon, SparkleIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { streamAI } from '../../api/ai';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  date: string;
}

type State = 'idle' | 'streaming' | 'done' | 'error';

const MD_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => <h3 className="mb-1.5 mt-4 text-[0.95rem] font-bold text-foreground first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-1.5 mt-4 text-[0.9rem] font-bold text-foreground first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-1 mt-3 text-[0.85rem] font-semibold text-foreground first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mb-2 text-[0.83rem] leading-relaxed text-muted-foreground last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 flex list-disc flex-col gap-1 pl-5 text-[0.83rem] text-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 flex list-decimal flex-col gap-1 pl-5 text-[0.83rem] text-muted-foreground">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-3 border-border" />,
  code: ({ children }) => (
    <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.78rem] text-foreground">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-primary/50 pl-3 italic text-muted-foreground">{children}</blockquote>
  ),
};

export default function WeeklyReviewDialog({ date }: Props) {
  const [open, setOpen] = useState(false);
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

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && state === 'idle') generate();
    if (!next) abortRef.current = true;
  };

  return (
    <>
      <Button
        className="w-full gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] hover:opacity-90"
        onClick={() => handleOpenChange(true)}
      >
        <SparkleIcon size={15} weight="fill" />
        AI Weekly Review
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[80dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-[#8b5cf6] text-primary-foreground">
              <BrainIcon size={19} weight="duotone" />
            </div>
            <DialogTitle>AI Weekly Review</DialogTitle>
            <DialogDescription>
              Trends, insights and priorities from the last 7 days
            </DialogDescription>
          </DialogHeader>

          {state === 'streaming' && content.length === 0 && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          )}

          {(state === 'streaming' || state === 'done') && content.length > 0 && (
            <div>
              <ReactMarkdown components={MD_COMPONENTS}>{content}</ReactMarkdown>
              {state === 'streaming' && (
                <span className="ml-0.5 inline-block h-[0.85em] w-0.5 animate-pulse rounded-sm bg-primary align-text-bottom" />
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-2.5">
              <p className="m-0 text-[0.8rem] text-destructive">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={generate}>
                Try again
              </Button>
            </div>
          )}

          {state === 'done' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
              onClick={generate}
            >
              <ArrowClockwiseIcon size={13} weight="bold" />
              Regenerate
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
