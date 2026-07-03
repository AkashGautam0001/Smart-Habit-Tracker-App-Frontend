import NavIcon from '../layout/NavIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = 'Ghost', title, description, action }: Props) {
  return (
    <Card className="border-dashed bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-border bg-card">
          <NavIcon name={icon} size={32} weight="duotone" className="text-muted-foreground" />
        </div>

        <div>
          <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {action && (
          <Button onClick={action.onClick} className={cn('mt-1')}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
