import { buildThemeVars, type ThemePalette } from '../lib/theme-vars';

export interface Theme {
  id: string;
  label: string;
  isPro: boolean;
  vars: Record<string, string>;
}

const SEMANTIC = {
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

function theme(id: string, label: string, isPro: boolean, palette: ThemePalette): Theme {
  return { id, label, isPro, vars: buildThemeVars(palette) };
}

export const THEMES: Theme[] = [
  theme('default', 'Default Dark', false, {
    bg: '#000000',
    surface: '#0a0a0a',
    surfaceHover: '#141414',
    border: '#262626',
    text: '#fafafa',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    ...SEMANTIC,
  }),
  theme('amoled', 'AMOLED Black', true, {
    bg: '#000000',
    surface: '#0a0a0a',
    surfaceHover: '#141414',
    border: '#262626',
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    ...SEMANTIC,
  }),
  theme('ocean', 'Ocean', true, {
    bg: '#0c1220',
    surface: '#111827',
    surfaceHover: '#1f2937',
    border: '#374151',
    text: '#f0f9ff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    ...SEMANTIC,
  }),
  theme('purple', 'Purple', true, {
    bg: '#0f0a1e',
    surface: '#1a1035',
    surfaceHover: '#251a4a',
    border: '#3b2f6e',
    text: '#faf5ff',
    textSecondary: '#c4b5fd',
    textMuted: '#8b5cf6',
    accent: '#a855f7',
    accentHover: '#9333ea',
    ...SEMANTIC,
  }),
  theme('green', 'Green', true, {
    bg: '#051208',
    surface: '#0d1f12',
    surfaceHover: '#162b1c',
    border: '#1f4028',
    text: '#f0fdf4',
    textSecondary: '#86efac',
    textMuted: '#4ade80',
    accent: '#22c55e',
    accentHover: '#16a34a',
    ...SEMANTIC,
  }),
  theme('dracula', 'Dracula', true, {
    bg: '#282a36',
    surface: '#21222c',
    surfaceHover: '#343746',
    border: '#44475a',
    text: '#f8f8f2',
    textSecondary: '#bd93f9',
    textMuted: '#6272a4',
    accent: '#ff79c6',
    accentHover: '#ff5af7',
    success: '#50fa7b',
    warning: '#ffb86c',
    danger: '#ff5555',
  }),
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
