'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

type ThemeProviderProps = PropsWithChildren<{
  /** Default preference when nothing in localStorage yet */
  defaultTheme?: Theme;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(pref: Theme): 'dark' | 'light' {
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(resolved: 'dark' | 'light'): void {
  const root = document.documentElement;
  if (resolved === 'light') {
    root.classList.add('theme-light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('theme-light');
    root.style.colorScheme = 'dark';
  }
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = window.localStorage?.getItem('theme') as Theme | null;
    return stored ?? defaultTheme;
  });

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  useEffect(() => {
    applyTheme(resolvedTheme);
    try {
      window.localStorage?.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme, resolvedTheme]);

  // React to system changes if user selected "system"
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(resolveTheme('system'));
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
      toggle: () => setThemeState((t) => (resolveTheme(t) === 'dark' ? 'light' : 'dark')),
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
