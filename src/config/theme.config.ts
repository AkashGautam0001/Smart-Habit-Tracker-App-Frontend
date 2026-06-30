export interface Theme {
  id: string;
  label: string;
  isPro: boolean;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    label: 'Default Dark',
    isPro: false,
    vars: {
      '--color-bg': '#09090b',
      '--color-surface': '#18181b',
      '--color-surface-hover': '#27272a',
      '--color-border': '#3f3f46',
      '--color-text': '#fafafa',
      '--color-text-secondary': '#a1a1aa',
      '--color-text-muted': '#71717a',
      '--color-accent': '#6366f1',
      '--color-accent-hover': '#4f46e5',
      '--color-success': '#22c55e',
      '--color-warning': '#f59e0b',
      '--color-danger': '#ef4444',
    },
  },
  {
    id: 'amoled',
    label: 'AMOLED Black',
    isPro: true,
    vars: {
      '--color-bg': '#000000',
      '--color-surface': '#0a0a0a',
      '--color-surface-hover': '#141414',
      '--color-border': '#262626',
      '--color-text': '#ffffff',
      '--color-text-secondary': '#a3a3a3',
      '--color-text-muted': '#737373',
      '--color-accent': '#6366f1',
      '--color-accent-hover': '#4f46e5',
      '--color-success': '#22c55e',
      '--color-warning': '#f59e0b',
      '--color-danger': '#ef4444',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    isPro: true,
    vars: {
      '--color-bg': '#0c1220',
      '--color-surface': '#111827',
      '--color-surface-hover': '#1f2937',
      '--color-border': '#374151',
      '--color-text': '#f0f9ff',
      '--color-text-secondary': '#94a3b8',
      '--color-text-muted': '#64748b',
      '--color-accent': '#06b6d4',
      '--color-accent-hover': '#0891b2',
      '--color-success': '#22c55e',
      '--color-warning': '#f59e0b',
      '--color-danger': '#ef4444',
    },
  },
  {
    id: 'purple',
    label: 'Purple',
    isPro: true,
    vars: {
      '--color-bg': '#0f0a1e',
      '--color-surface': '#1a1035',
      '--color-surface-hover': '#251a4a',
      '--color-border': '#3b2f6e',
      '--color-text': '#faf5ff',
      '--color-text-secondary': '#c4b5fd',
      '--color-text-muted': '#8b5cf6',
      '--color-accent': '#a855f7',
      '--color-accent-hover': '#9333ea',
      '--color-success': '#22c55e',
      '--color-warning': '#f59e0b',
      '--color-danger': '#ef4444',
    },
  },
  {
    id: 'green',
    label: 'Green',
    isPro: true,
    vars: {
      '--color-bg': '#051208',
      '--color-surface': '#0d1f12',
      '--color-surface-hover': '#162b1c',
      '--color-border': '#1f4028',
      '--color-text': '#f0fdf4',
      '--color-text-secondary': '#86efac',
      '--color-text-muted': '#4ade80',
      '--color-accent': '#22c55e',
      '--color-accent-hover': '#16a34a',
      '--color-success': '#22c55e',
      '--color-warning': '#f59e0b',
      '--color-danger': '#ef4444',
    },
  },
  {
    id: 'dracula',
    label: 'Dracula',
    isPro: true,
    vars: {
      '--color-bg': '#282a36',
      '--color-surface': '#21222c',
      '--color-surface-hover': '#343746',
      '--color-border': '#44475a',
      '--color-text': '#f8f8f2',
      '--color-text-secondary': '#bd93f9',
      '--color-text-muted': '#6272a4',
      '--color-accent': '#ff79c6',
      '--color-accent-hover': '#ff5af7',
      '--color-success': '#50fa7b',
      '--color-warning': '#ffb86c',
      '--color-danger': '#ff5555',
    },
  },
];

export const ACCENT_PRESETS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
];

export const FONT_SIZES = {
  sm: { base: '13px', heading: '1.1rem' },
  md: { base: '15px', heading: '1.25rem' },
  lg: { base: '17px', heading: '1.4rem' },
} as const;
