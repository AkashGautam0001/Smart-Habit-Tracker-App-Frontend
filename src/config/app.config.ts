export const APP_CONFIG = {
  name: 'HabitFlow',
  tagline: 'Build better, every day.',
  description: 'A modern productivity OS combining habit tracking, Pomodoro focus timer, and AI-powered study analytics.',
  version: '1.0.0',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  supportEmail: 'support@habitflow.app',
  socials: {
    twitter: 'https://twitter.com/habitflowapp',
    github: 'https://github.com/habitflow',
  },
  quotes: [
    'Small steps every day lead to big results.',
    'Discipline is choosing between what you want now and what you want most.',
    'The secret of getting ahead is getting started.',
    'Focus on progress, not perfection.',
    'Every expert was once a beginner.',
    'Your future self will thank you for today\'s hard work.',
  ],
} as const;
