// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/results.ts
// Purpose:    Reads the runs and their results once from the server (each coursework's results.json,
//             through /api/experiments) and shares them with every page. Text that quotes a number is
//             written as a small function of these facts, so no result is ever typed into the text.

import { useEffect, useState } from "react";
import { getExperiments, type Coursework, type CourseworkId, type Experiments, type RunNumbers, type SavedRun } from "./api";

// Everything a text can quote: both pieces of coursework with their runs and numbers, and the defaults.
export type Facts = Experiments;

// A text that is either fixed, or built from the facts when it quotes a number.
export type FactText = string | ((facts: Facts) => string);

let cached: Promise<Experiments> | null = null; // the facts are fetched once per visit

// Gives the facts, or a plain message saying why they could not be loaded.
// No parameters. While loading, both are null.
export function useFacts(): { facts: Facts | null; problem: string | null } {
  const [state, setState] = useState<{ facts: Facts | null; problem: string | null }>({ facts: null, problem: null });

  useEffect(() => {
    let live = true;
    cached ??= getExperiments();
    cached
      .then((answer) => {
        if (live) setState({ facts: answer, problem: null });
      })
      .catch((error: Error) => {
        cached = null;
        if (live) setState({ facts: null, problem: error.message });
      });
    return () => {
      live = false;
    };
  }, []);

  return state;
}

// The error thrown when a text needs numbers from a results.json file that is missing.
class MissingResults extends Error {}

// Turns a FactText into plain text. If it needs numbers that are missing, it says so instead.
// text: the text. facts: the facts, or null when they could not be loaded.
export function fillText(text: FactText, facts: Facts | null): string {
  if (typeof text === "string") return text;
  if (!facts) return "(This text quotes the results, which could not be loaded.)";
  try {
    return text(facts);
  } catch (error) {
    if (error instanceof MissingResults) return "(This text quotes the results, but results.json is not available.)";
    throw error;
  }
}

// Finds one coursework in the facts.
// facts: the facts. id: "assignment" or "project".
export function courseworkOf(facts: Facts, id: CourseworkId): Coursework {
  return facts.courseworks.find((item) => item.id === id)!;
}

// Finds one saved run.
// facts: the facts. coursework: "assignment" or "project". name: the run's name.
export function runOf(facts: Facts, coursework: CourseworkId, name: string): SavedRun {
  const run = courseworkOf(facts, coursework).runs.find((item) => item.name === name);
  if (!run) throw new MissingResults(`There is no run ${name}.`);
  return run;
}

// The numbers of one run from results.json. Throws MissingResults (shown as a plain note by fillText)
// if the file is missing. facts: the facts. coursework: "assignment" or "project". name: the run's name.
export function numbersOf(facts: Facts, coursework: CourseworkId, name: string): RunNumbers {
  const numbers = runOf(facts, coursework, name).numbers;
  if (!numbers) throw new MissingResults(`${coursework}/results/results.json is not available.`);
  return numbers;
}

// How results are shown. The values come from results.json unchanged; only the display is rounded.
// Shows an average (of sugar or of population) with one decimal, for example 266.9 or 1,221.8.
// value: the number.
export function average(value: number): string {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Shows a Gini coefficient or a share between 0 and 1 with three decimals, for example 0.335 or 0.320.
// value: the number.
export function fraction(value: number): string {
  return value.toLocaleString("en-GB", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

// Shows a count as a whole number with a thousands separator, for example 1,265.
// value: the number.
export function count(value: number): string {
  return Math.round(value).toLocaleString("en-GB");
}

// Shows a share between 0 and 1 as a percentage.
// value: the share. decimals: digits after the point (none by default).
export function percent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
