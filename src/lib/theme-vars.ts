export interface ThemePalette {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  danger: string;
}

/** Build legacy + shadcn CSS variable map from a single palette. */
export function buildThemeVars(palette: ThemePalette): Record<string, string> {
  return {
  // Legacy tokens (kept during migration)
    '--color-bg': palette.bg,
    '--color-surface': palette.surface,
    '--color-surface-hover': palette.surfaceHover,
    '--color-border': palette.border,
    '--color-text': palette.text,
    '--color-text-secondary': palette.textSecondary,
    '--color-text-muted': palette.textMuted,
    '--color-accent': palette.accent,
    '--color-accent-hover': palette.accentHover,
    '--color-success': palette.success,
    '--color-warning': palette.warning,
    '--color-danger': palette.danger,

    // shadcn/ui tokens
    '--background': palette.bg,
    '--foreground': palette.text,
    '--card': palette.surface,
    '--card-foreground': palette.text,
    '--popover': palette.surface,
    '--popover-foreground': palette.text,
    '--primary': palette.accent,
    '--primary-foreground': '#ffffff',
    '--secondary': palette.surfaceHover,
    '--secondary-foreground': palette.text,
    '--muted': palette.surfaceHover,
    '--muted-foreground': palette.textMuted,
    '--accent': palette.surfaceHover,
    '--accent-foreground': palette.text,
    '--destructive': palette.danger,
    '--border': palette.border,
    '--input': palette.border,
    '--ring': palette.accent,
    '--chart-1': palette.accent,
    '--chart-2': palette.success,
    '--chart-3': palette.warning,
    '--chart-4': palette.textSecondary,
    '--chart-5': palette.danger,
    '--sidebar': palette.surface,
    '--sidebar-foreground': palette.text,
    '--sidebar-primary': palette.accent,
    '--sidebar-primary-foreground': '#ffffff',
    '--sidebar-accent': palette.surfaceHover,
    '--sidebar-accent-foreground': palette.text,
    '--sidebar-border': palette.border,
    '--sidebar-ring': palette.accent,
  };
}
