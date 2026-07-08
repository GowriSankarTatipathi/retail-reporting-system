import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, type PaletteMode } from '@mui/material';
import { buildTheme } from '@/theme/theme';

const STORAGE_KEY = 'rrs.themeMode';

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context object, not a component
export const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
