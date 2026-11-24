// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/run-data.ts
// Purpose:    Small helpers that read columns out of a run's per-step rows (from a _steps.csv file or from
//             a fresh run), for the charts and the counters.

// The measures drawn on the charts: the column of the steps table, its title and how a value is shown.
export type Measure = { column: string; title: string; format: (value: number) => string };

export const MEASURES: Measure[] = [
  { column: "population", title: "Population (agents)", format: (value) => Math.round(value).toLocaleString("en-GB") },
  { column: "mean_sugar", title: "Average sugar per agent", format: (value) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 }) },
  { column: "gini", title: "Gini coefficient (0 = equal)", format: (value) => value.toFixed(2) },
];

// The values of one column, in step order.
// columns: the column names. rows: the rows, one per step. name: the column wanted.
export function column(columns: string[], rows: number[][], name: string): number[] {
  const index = columns.indexOf(name);
  return rows.map((row) => row[index]);
}

// The values of a measure while any agent is alive. After the population reaches 0 the averages and
// the Gini coefficient are written as 0, which would read as perfect equality, so the line stops there
// (as in the figures drawn by analyse_results.py). The population itself is kept whole.
// columns, rows: the steps table. name: the column wanted.
export function livingValues(columns: string[], rows: number[][], name: string): number[] {
  const values = column(columns, rows, name);
  if (name === "population") return values;
  const extinct = column(columns, rows, "population").indexOf(0);
  return extinct < 0 ? values : values.slice(0, extinct);
}

// Running totals: the sum of the values up to and including each step.
// values: one value per step.
export function runningTotals(values: number[]): number[] {
  let total = 0;
  return values.map((value) => (total += value));
}
