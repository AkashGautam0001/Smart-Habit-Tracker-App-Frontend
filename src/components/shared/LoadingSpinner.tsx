import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex min-h-dvh items-center justify-center bg-background', className)}>
      <Loader2Icon className="size-8 animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}
