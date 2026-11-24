// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/settings.tsx
// Purpose:    Holds the two settings: Detail (off = short text, on = every longer explanation shown)
//             and the light or dark theme. Both are remembered in the browser between visits.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const DETAIL_KEY = "sugarscape-lab-detail";
const THEME_KEY = "sugarscape-lab-theme"; // also read by the small script in index.html

export type Theme = "light" | "dark";

type Settings = {
  detail: boolean;
  setDetail: (on: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const SettingsContext = createContext<Settings>({
  detail: false,
  setDetail: () => {},
  theme: "light",
  setTheme: () => {},
});

// Reads a saved setting, or gives back null if nothing was saved or the browser blocks storage.
// key: the name the setting is saved under.
function readSaved(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Saves a setting. If the browser blocks storage, the setting still works until the page is closed.
// key: the name to save under. value: the value to save.
function save(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage blocked: nothing else to do
  }
}

// Makes the settings available to every part of the app, and applies the theme to the page.
// children: the app itself.
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [detail, setDetailState] = useState<boolean>(() => readSaved(DETAIL_KEY) === "on");
  const [theme, setThemeState] = useState<Theme>(() => (readSaved(THEME_KEY) === "dark" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setDetail = (on: boolean) => {
    setDetailState(on);
    save(DETAIL_KEY, on ? "on" : "off");
  };
  const setTheme = (next: Theme) => {
    setThemeState(next);
    save(THEME_KEY, next);
  };

  return (
    <SettingsContext.Provider value={{ detail, setDetail, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Gives the Detail setting and a function to change it. No parameters.
export function useDetail(): Pick<Settings, "detail" | "setDetail"> {
  return useContext(SettingsContext);
}

// Gives the theme and a function to change it. No parameters.
export function useTheme(): Pick<Settings, "theme" | "setTheme"> {
  return useContext(SettingsContext);
}
