import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  icon: ReactNode;
  iconBg: string;
  title: string;
  value: string;
  subtitle: string;
  children?: ReactNode;
  className?: string;
}

export default function StreakSideCard({ icon, iconBg, title, value, subtitle, children, className }: Props) {
  return (
    <Card className={className}>
      <CardContent className="px-4 py-3.5">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconBg)}>
            {icon}
          </div>
          <span className="text-[0.8rem] font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        <div className="mt-0.5 text-[0.72rem] text-muted-foreground">{subtitle}</div>
        {children}
      </CardContent>
    </Card>
  );
}
