import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function resolveTheme(theme: Theme): boolean {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return theme === 'dark';
}

/**
 * useTheme — shared hook for reading and setting the app colour scheme.
 *
 * - Persists the user's choice in localStorage under the key "theme".
 * - Applies / removes the "dark" class on <html> so Tailwind's darkMode:'class'
 *   strategy takes effect immediately across the whole app.
 * - Reacts to OS-level preference changes when the "system" option is active.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
    return 'light';
  });

  // Derived boolean: is the screen currently dark?
  const [isDark, setIsDark] = useState<boolean>(() => resolveTheme(theme));

  useEffect(() => {
    const applyDark = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark);
      setIsDark(dark);
    };

    applyDark(resolveTheme(theme));

    // When "system" is selected, keep in sync with OS preference changes
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem('theme', next);
    setThemeState(next);
  };

  /** Convenience toggle — cycles light → dark → system */
  const toggleDarkMode = (dark: boolean) => setTheme(dark ? 'dark' : 'light');

  return { theme, setTheme, isDark, toggleDarkMode };
}
