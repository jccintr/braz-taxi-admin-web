import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'braz:theme'; // mesma chave que o script anti-piscada do index.html lê

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const readStored = () => {
  try { return localStorage.getItem(STORAGE_KEY) || 'system'; } catch { return 'system'; }
};

// Três estados — 'light' | 'dark' | 'system' (mesmo padrão do Delivroo).
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readStored);
  const [systemPrefersDark, setSystemPrefersDark] = useState(systemDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setSystemPrefersDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = preference === 'dark' || (preference === 'system' && systemPrefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const value = useMemo(() => ({
    preference,
    isDark,
    setThemePreference: (v) => {
      setPreference(v);
      try {
        if (v === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, v);
      } catch { /* sem storage */ }
    },
  }), [preference, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme precisa estar dentro de um ThemeProvider');
  return ctx;
}
