import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { THEMES } from '../config/theme.config';

const ACCENT_KEYS = [
  '--color-accent',
  '--color-accent-hover',
  '--primary',
  '--ring',
  '--chart-1',
  '--sidebar-primary',
  '--sidebar-ring',
] as const;

export const useTheme = () => {
  const settings = useSettings();

  useEffect(() => {
    const theme = THEMES.find((t) => t.id === settings.theme) ?? THEMES[0];
    const root = document.documentElement;

    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  // Custom accent overrides both legacy and shadcn primary tokens
    if (settings.accentColor && settings.accentColor !== theme.vars['--color-accent']) {
      ACCENT_KEYS.forEach((key) => {
        root.style.setProperty(key, settings.accentColor!);
      });
    }

    const fontSizes: Record<string, string> = { sm: '13px', md: '15px', lg: '17px' };
    root.style.setProperty('--font-size-base', fontSizes[settings.fontSize] ?? '15px');

    root.classList.add('dark');
    root.setAttribute('data-theme', theme.id);
  }, [settings.theme, settings.accentColor, settings.fontSize]);
};
