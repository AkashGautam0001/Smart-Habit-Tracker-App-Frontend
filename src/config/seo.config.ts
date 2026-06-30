import { APP_CONFIG } from './app.config';

export const SEO_CONFIG = {
  defaultTitle: `${APP_CONFIG.name} — Habit Tracker & Pomodoro Learning OS`,
  titleTemplate: `%s | ${APP_CONFIG.name}`,
  description: APP_CONFIG.description,
  keywords: 'habit tracker, pomodoro timer, study tracker, productivity app, streak tracker, focus timer, learning analytics',
  ogImage: `${APP_CONFIG.url}/og-image.png`,
  twitterCard: 'summary_large_image' as const,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web, PWA',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    featureList: [
      'Habit tracking with streaks',
      'Pomodoro focus timer',
      'Study analytics',
      'AI coaching (Pro)',
      'GitHub-style heatmap',
      'PWA installable',
    ],
  },
} as const;
