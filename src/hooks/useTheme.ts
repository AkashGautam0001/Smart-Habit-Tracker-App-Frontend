import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { THEMES } from '../config/theme.config';

export const useTheme = () => {
  const settings = useSettings();

  useEffect(() => {
    const theme = THEMES.find((t) => t.id === settings.theme) ?? THEMES[0];
    const root = document.documentElement;

    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Override accent color if user has a custom one
    if (settings.accentColor && settings.accentColor !== theme.vars['--color-accent']) {
      root.style.setProperty('--color-accent', settings.accentColor);
    }

    // Font size
    const fontSizes: Record<string, string> = { sm: '13px', md: '15px', lg: '17px' };
    root.style.setProperty('--font-size-base', fontSizes[settings.fontSize] ?? '15px');
  }, [settings.theme, settings.accentColor, settings.fontSize]);
};
