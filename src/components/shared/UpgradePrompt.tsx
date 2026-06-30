import { useNavigate } from 'react-router-dom';
import { LightningIcon } from '@phosphor-icons/react';
import { PlanFeatures } from '../../config/plans.config';

const FEATURE_LABELS: Partial<Record<keyof PlanFeatures, { title: string; description: string }>> = {
  advancedAnalytics: { title: 'Advanced Analytics', description: 'Unlock monthly/yearly reports, subject breakdown, and AI insights.' },
  aiCoach:           { title: 'AI Coach', description: 'Get personalized daily reviews powered by AI.' },
  aiPlanner:         { title: 'AI Study Planner', description: 'Generate a week-by-week study roadmap for your goals.' },
  focusMusic:        { title: 'Focus Music', description: 'Listen to lo-fi, rain, forest, and white noise while you work.' },
  export:            { title: 'Data Export', description: 'Export your data as PDF, CSV, or Excel.' },
  premiumThemes:     { title: 'Premium Themes', description: 'Access AMOLED Black, Ocean, Purple, Green, and Dracula themes.' },
  richTextNotes:     { title: 'Rich Text Notes', description: 'Write habit and task notes in Markdown.' },
  goals:             { title: 'Goals & Milestones', description: 'Set learning goals with progress tracking.' },
  projects:          { title: 'Projects', description: 'Group tasks by project for better organisation.' },
  fullHeatmap:       { title: 'Full Year Heatmap', description: 'View your complete 365-day activity heatmap with filters.' },
  smartReminders:    { title: 'Smart Reminders', description: 'Get behaviour-based reminders at the right time.' },
};

interface Props {
  feature: keyof PlanFeatures;
}

export default function UpgradePrompt({ feature }: Props) {
  const navigate = useNavigate();
  const info = FEATURE_LABELS[feature];

  return (
    <div style={{
      alignItems: 'center',
      background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))',
      border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '24px 20px',
      textAlign: 'center',
    }}>
      <div style={{
        alignItems: 'center', background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
        borderRadius: '50%', display: 'flex', height: 48, justifyContent: 'center', width: 48,
      }}>
        <LightningIcon size={24} weight="fill" color="var(--color-accent)" />
      </div>

      <div>
        <h3 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
          {info?.title ?? 'Pro Feature'}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          {info?.description ?? 'This feature is available on the Pro plan.'}
        </p>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => navigate('/upgrade')}
        style={{ borderRadius: 'var(--radius-md)', fontSize: '0.85rem', padding: '10px 20px' }}
      >
        Upgrade to Pro — ₹149/month
      </button>
    </div>
  );
}
