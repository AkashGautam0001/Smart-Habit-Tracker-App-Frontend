import { FireIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  streak: number;
  size?: 'sm' | 'md';
}

export default function StreakBadge({ streak, size = 'md' }: Props) {
  if (!streak) return null;

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-orange-500/30 bg-orange-500/10 font-bold text-orange-500 tabular-nums',
        size === 'sm' ? 'h-5 gap-0.5 px-1.5 text-[0.72rem]' : 'h-6 gap-1 px-2 text-xs',
      )}
    >
      <FireIcon size={iconSize} weight="fill" className="text-orange-500" />
      {streak}
    </Badge>
  );
}
