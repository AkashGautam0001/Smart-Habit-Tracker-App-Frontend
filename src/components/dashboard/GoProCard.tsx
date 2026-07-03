import { Link } from 'react-router-dom';
import { CrownIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GoProCard() {
  return (
    <Card className="border-primary/25 bg-linear-to-br from-primary/15 via-[#8b5cf6]/10 to-card">
      <CardContent className="px-4 py-4">
        <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-[#8b5cf6] text-primary-foreground">
          <CrownIcon size={18} weight="fill" />
        </div>
        <h3 className="text-[0.92rem] font-semibold text-foreground">
          Go Pro. <span className="text-primary">Unlock More.</span>
        </h3>
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
          Custom reminders, advanced analytics, unlimited habits &amp; more.
        </p>
        <Button className="mt-3.5 w-full gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] hover:opacity-90" asChild>
          <Link to="/upgrade">
            Upgrade Now
            <ArrowRightIcon size={14} weight="bold" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
