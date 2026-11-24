// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/run-store.tsx
// Purpose:    Keeps the Simulate page's settings and its last finished run while other pages are open,
//             so a run started from the Experiments page can be watched on the Simulate page.

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CourseworkId, RunResult, Settings } from "./api";

// Where a run came from: a saved run (its coursework, name and title), or null for settings of one's own.
export type RunSource = { coursework: CourseworkId; run: string; title: string } | null;

// The settings on the Simulate page: the model settings, the number of steps and the saved run they
// were loaded from (null once they no longer match one).
export type RunForm = { settings: Settings; steps: number; source: RunSource };

// The last finished run and where it came from.
export type CurrentRun = { result: RunResult; source: RunSource };

type Store = {
  form: RunForm | null;
  setForm: (form: RunForm) => void;
  current: CurrentRun | null;
  setCurrent: (run: CurrentRun | null) => void;
};

const RunContext = createContext<Store>({ form: null, setForm: () => {}, current: null, setCurrent: () => {} });

// Makes the settings and the current run available to every page.
// children: the app itself.
export function RunProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<RunForm | null>(null);
  const [current, setCurrent] = useState<CurrentRun | null>(null);
  return <RunContext.Provider value={{ form, setForm, current, setCurrent }}>{children}</RunContext.Provider>;
}

// Gives the settings, the current run and the functions that change them. No parameters.
export function useRunStore(): Store {
  return useContext(RunContext);
}
