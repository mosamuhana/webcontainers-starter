import type { ReactNode } from "react";
import { useState, useEffect, createContext, useContext } from "react";

import { getInitialTheme, saveTheme, useSystemMedia } from "./helper";
import type { Theme, SystemTheme } from "../types";

type ThemeContextType = {
  theme: Theme;
  systemTheme: SystemTheme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  systemTheme: 'light',
  isDark: false,
  setTheme: () => {}
})

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode; }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());
  const systemTheme = useSystemMedia();

  useEffect(() => {
    saveTheme(theme, systemTheme);
  }, [theme, systemTheme]);

  const value: ThemeContextType = {
    setTheme,
    theme,
    systemTheme,
    isDark: theme === "system" ? systemTheme === "dark" : theme === "dark",
  };

  return (<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>);
};
