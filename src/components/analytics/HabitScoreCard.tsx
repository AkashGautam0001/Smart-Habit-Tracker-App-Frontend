import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  score: number;
}

function ratingFor(score: number) {
  if (score >= 85) return 'Excellent!';
  if (score >= 65) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs work';
}

function messageFor(score: number) {
  if (score >= 85) return "You're doing great! Keep maintaining your consistency.";
  if (score >= 65) return 'Solid progress — a little more consistency to reach excellent.';
  if (score >= 40) return 'Fair start. Try to complete more habits each day.';
  return 'Let’s build momentum — complete a habit today.';
}

export default function HabitScoreCard({ score }: Props) {
  const size = 140;
  const strokeWidth = 11;
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arcFraction = 0.75; // 270deg arc
  const arcLength = circumference * arcFraction;
  const progressLength = arcLength * Math.min(Math.max(score, 0), 100) / 100;

  return (
    <Card>
      <CardHeader className="px-4 pb-0 pt-4">
        <CardTitle className="text-sm font-semibold">Habit Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center px-4 pb-4 pt-2 text-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--secondary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
            />
            <motion.circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              initial={{ strokeDashoffset: arcLength }}
              animate={{ strokeDashoffset: arcLength - progressLength }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
              style={{ filter: 'drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 45%, transparent))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[1.7rem] font-bold tabular-nums text-foreground">{score}</span>
            <span className="mt-0.5 text-[0.75rem] font-semibold text-primary">{ratingFor(score)}</span>
          </div>
        </div>
        <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">
          {messageFor(score)}
        </p>
      </CardContent>
    </Card>
  );
}
