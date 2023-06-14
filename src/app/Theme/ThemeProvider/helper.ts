import { useState } from "react";

import type { Theme, SystemTheme } from "../types";
import { useEffectSafe } from "../../hooks/useEffectSafe";

let initialTheme: Theme | undefined;
let lightMedia: MediaQueryList | undefined;
let darkMedia: MediaQueryList | undefined;

const prefersColorQuery = (theme?: 'light' | 'dark' | null) => {
  return window.matchMedia(`(prefers-color-scheme${theme ? ':' + theme : ''})`);
}

const getLightMedia = () => lightMedia ??= prefersColorQuery('light');
const getDarkMedia = () => darkMedia ??= prefersColorQuery('dark');

const setHtmlDark = (value: boolean) => {
  if (value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getThemeStore = () => {
  const value = localStorage.getItem('theme');
  if (!value) return null;
  return value as Theme;
};

const setThemeStore = (theme: Theme | null) => {
  if (theme == null) {
    localStorage.remove('theme');
  } else {
    localStorage.setItem('theme', theme);
  }
};

export const getInitialTheme = (): Theme => {
  if (initialTheme) return initialTheme;

  let theme: Theme;
  let isDark = false;
  const savedTheme = getThemeStore();

  if (savedTheme) {
    theme = savedTheme;
    isDark = theme === 'dark';
  } else {
    theme = 'system';
    if (getDarkMedia().matches) {
      isDark = true;
    } else if (getLightMedia().matches) {
      isDark = false;
    }
  }

  setHtmlDark(isDark);

  if (savedTheme != theme) {
    setThemeStore(theme);
  }

  return initialTheme = theme;
};

export const saveTheme = (theme: Theme, systemTheme: SystemTheme) => {
  setThemeStore(theme);
  if (theme === 'system') {
    setHtmlDark(systemTheme === 'dark');
  } else {
    setHtmlDark(theme === 'dark');
  }
};

export const useSystemMedia = () => {
  const [systemTheme, setSystemTheme] = useState<SystemTheme>(getDarkMedia().matches ? 'dark' : 'light');

  useEffectSafe(() => {
    const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');

    getDarkMedia().addEventListener('change', onChange);

    return () => getDarkMedia().removeEventListener('change', onChange);
  }, []);

  return systemTheme;
};

// https://web.dev/prefers-color-scheme/
//const isSupported = prefersColorQuery().media !== 'not all';
