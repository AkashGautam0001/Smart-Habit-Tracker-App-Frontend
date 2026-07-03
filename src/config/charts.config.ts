export const DATE_RANGE_OPTIONS = [
  { id: 'week', label: 'This Week', days: 7, proRequired: false },
  { id: 'month', label: 'This Month', days: 31, proRequired: false },
  { id: 'year', label: 'This Year', days: 365, proRequired: true },
  { id: 'custom', label: 'Custom', days: 0, proRequired: true },
] as const;

/** Heatmap intensity scale — reads theme tokens at runtime (SVG/Recharts). */
export const HEATMAP_COLORS = [
  'var(--secondary)',
  'color-mix(in srgb, var(--primary) 25%, var(--secondary))',
  'color-mix(in srgb, var(--primary) 45%, var(--secondary))',
  'var(--primary)',
  'color-mix(in srgb, var(--primary) 75%, white)',
  'color-mix(in srgb, var(--primary) 55%, white)',
] as const;

/** Shared chart palette — CSS variables for theme-aware charts. */
export const CHART_COLORS = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  tertiary: 'var(--chart-3)',
  quaternary: 'var(--chart-4)',
  quinary: 'var(--chart-5)',
  grid: 'var(--secondary)',
  tooltip: 'var(--card)',
  text: 'var(--muted-foreground)',
} as const;
