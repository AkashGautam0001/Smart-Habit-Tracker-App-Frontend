import { useNavigate } from 'react-router-dom';
import { LightningIcon } from '@phosphor-icons/react';
import { PlanFeatures } from '../../config/plans.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURE_LABELS: Partial<Record<keyof PlanFeatures, { title: string; description: string }>> = {
  advancedAnalytics: {
    title: 'Advanced Analytics',
    description: 'Unlock monthly/yearly reports, subject breakdown, and AI insights.',
  },
  aiCoach: {
    title: 'AI Coach',
    description: 'Get personalized daily reviews powered by AI.',
  },
  aiPlanner: {
    title: 'AI Study Planner',
    description: 'Generate a week-by-week study roadmap for your goals.',
  },
  focusMusic: {
    title: 'Focus Music',
    description: 'Listen to lo-fi, rain, forest, and white noise while you work.',
  },
  export: {
    title: 'Data Export',
    description: 'Export your data as PDF, CSV, or Excel.',
  },
  premiumThemes: {
    title: 'Premium Themes',
    description: 'Access AMOLED Black, Ocean, Purple, Green, and Dracula themes.',
  },
  richTextNotes: {
    title: 'Rich Text Notes',
    description: 'Write habit and task notes in Markdown.',
  },
  goals: {
    title: 'Goals & Milestones',
    description: 'Set learning goals with progress tracking.',
  },
  projects: {
    title: 'Projects',
    description: 'Group tasks by project for better organisation.',
  },
  fullHeatmap: {
    title: 'Full Year Heatmap',
    description: 'View your complete 365-day activity heatmap with filters.',
  },
  smartReminders: {
    title: 'Smart Reminders',
    description: 'Get behaviour-based reminders at the right time.',
  },
};

interface Props {
  feature: keyof PlanFeatures;
}

export default function UpgradePrompt({ feature }: Props) {
  const navigate = useNavigate();
  const info = FEATURE_LABELS[feature];

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-3 px-5 py-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/15">
          <LightningIcon size={24} weight="fill" className="text-primary" />
        </div>

        <div>
          <h3 className="mb-1.5 text-base font-semibold text-foreground">
            {info?.title ?? 'Pro Feature'}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {info?.description ?? 'This feature is available on the Pro plan.'}
          </p>
        </div>

        <Button onClick={() => navigate('/upgrade')} size="sm">
          Upgrade to Pro — ₹149/month
        </Button>
      </CardContent>
    </Card>
  );
}
