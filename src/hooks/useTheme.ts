import { useEffect, useState } from 'react';

import {
  applyThemeMode,
  loadThemeSetting,
  saveThemeSetting,
} from '../logic';
import type { ThemeMode } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadThemeSetting());

  useEffect(() => {
    applyThemeMode(theme);
    saveThemeSetting(theme);
  }, [theme]);

  return { theme, setTheme };
}
