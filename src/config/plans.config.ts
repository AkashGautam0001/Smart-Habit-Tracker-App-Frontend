export type PlanId = 'free' | 'pro';

export interface PlanLimits {
  maxHabits: number;
  sessionHistoryDays: number;
  journalEntriesPerDay: number;
  analyticsRangeDays: number;
  maxGoals: number;
  maxProjects: number;
}

export interface PlanFeatures {
  unlimitedPomodoro: boolean;
  unlimitedTasks: boolean;
  cloudSync: boolean;
  advancedAnalytics: boolean;
  aiCoach: boolean;
  aiPlanner: boolean;
  focusMusic: boolean;
  export: boolean;
  premiumThemes: boolean;
  richTextNotes: boolean;
  customDateFilters: boolean;
  goals: boolean;
  projects: boolean;
  fullHeatmap: boolean;
  smartReminders: boolean;
}

export interface Plan {
  id: PlanId;
  label: string;
  price: { monthly: number; yearly: number; currency?: string };
  limits: PlanLimits;
  features: PlanFeatures;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    label: 'Free',
    price: { monthly: 0, yearly: 0 },
    limits: {
      maxHabits: 10,
      sessionHistoryDays: 30,
      journalEntriesPerDay: 1,
      analyticsRangeDays: 31,
      maxGoals: 2,
      maxProjects: 0,
    },
    features: {
      unlimitedPomodoro: true,
      unlimitedTasks: true,
      cloudSync: true,
      advancedAnalytics: false,
      aiCoach: false,
      aiPlanner: false,
      focusMusic: false,
      export: false,
      premiumThemes: false,
      richTextNotes: false,
      customDateFilters: false,
      goals: false,
      projects: false,
      fullHeatmap: false,
      smartReminders: false,
    },
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    price: { monthly: 149, yearly: 1499, currency: 'INR' },
    limits: {
      maxHabits: Infinity,
      sessionHistoryDays: Infinity,
      journalEntriesPerDay: Infinity,
      analyticsRangeDays: Infinity,
      maxGoals: Infinity,
      maxProjects: Infinity,
    },
    features: {
      unlimitedPomodoro: true,
      unlimitedTasks: true,
      cloudSync: true,
      advancedAnalytics: true,
      aiCoach: true,
      aiPlanner: true,
      focusMusic: true,
      export: true,
      premiumThemes: true,
      richTextNotes: true,
      customDateFilters: true,
      goals: true,
      projects: true,
      fullHeatmap: true,
      smartReminders: true,
    },
  },
};

export const PRO_YEARLY_SAVINGS_MONTHS = 2;
