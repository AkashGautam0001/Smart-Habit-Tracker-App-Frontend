import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  /** Narrow content column (forms, habits list) */
  narrow?: boolean;
}

export default function PageShell({ children, className, narrow }: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full space-y-5',
        narrow ? 'max-w-2xl' : 'max-w-7xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
