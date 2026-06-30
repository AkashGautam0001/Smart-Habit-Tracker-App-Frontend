export const DATE_RANGE_OPTIONS = [
  { id: 'week',   label: 'This Week',  days: 7,   proRequired: false },
  { id: 'month',  label: 'This Month', days: 31,  proRequired: false },
  { id: 'year',   label: 'This Year',  days: 365, proRequired: true },
  { id: 'custom', label: 'Custom',     days: 0,   proRequired: true },
] as const;

export const HEATMAP_COLORS = [
  '#27272a',  // 0 — empty (zinc-800)
  '#312e81',  // 1 — low (indigo-900)
  '#4338ca',  // 2 — medium-low (indigo-700)
  '#6366f1',  // 3 — medium (indigo-500)
  '#818cf8',  // 4 — high (indigo-400)
  '#a5b4fc',  // 5 — max (indigo-300)
];

export const CHART_COLORS = {
  primary:   '#6366f1',
  secondary: '#22c55e',
  tertiary:  '#f59e0b',
  quaternary:'#06b6d4',
  quinary:   '#ec4899',
  grid:      '#27272a',
  tooltip:   '#18181b',
  text:      '#a1a1aa',
};
