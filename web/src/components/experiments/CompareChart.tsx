// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/experiments/CompareChart.tsx
// Purpose:    The chart on a run's card: one measure over time from the run's saved _steps.csv, with the
//             run it is compared against drawn on the same axes.

import { useEffect, useState } from "react";
import { getSteps, type CourseworkId, type StepTable } from "../../lib/api";
import { runStyle } from "../../lib/colours";
import { runOf, type Facts } from "../../lib/results";
import { MEASURES, livingValues } from "../../lib/run-data";
import StepChart, { type Series } from "../charts/StepChart";
import Segmented from "../Segmented";

// The saved steps of each run, fetched once per visit, keyed by "coursework/run".
const loaded = new Map<string, Promise<StepTable>>();

// Gives the saved steps of a run, fetching them only the first time.
// coursework: the coursework. run: the run's name.
function savedSteps(coursework: CourseworkId, run: string): Promise<StepTable> {
  const key = `${coursework}/${run}`;
  if (!loaded.has(key)) {
    const request = getSteps(coursework, run);
    request.catch(() => loaded.delete(key)); // a failed request is tried again next time
    loaded.set(key, request);
  }
  return loaded.get(key)!;
}

type Props = { facts: Facts; coursework: CourseworkId; run: string; compareWith: string | null; steps: number };

// The chart and the switch between population, average sugar and the Gini coefficient.
// facts: the runs. coursework: the coursework. run: the run's name. compareWith: the run it is compared
// against, or null. steps: the number of steps of the run.
export default function CompareChart({ facts, coursework, run, compareWith, steps }: Props) {
  const [measure, setMeasure] = useState(MEASURES[0].column);
  const [tables, setTables] = useState<StepTable[] | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const names = compareWith ? [compareWith, run] : [run];

  useEffect(() => {
    const wanted = compareWith ? [compareWith, run] : [run];
    Promise.all(wanted.map((name) => savedSteps(coursework, name)))
      .then(setTables)
      .catch((error: Error) => setProblem(error.message));
  }, [coursework, run, compareWith]);

  const chosen = MEASURES.find((item) => item.column === measure)!;
  const series: Series[] = (tables ?? []).map((table, index) => ({
    label: runOf(facts, coursework, names[index]).title,
    style: runStyle(facts, coursework, names[index]),
    values: livingValues(table.columns, table.rows, measure),
  }));

  return (
    <div data-tour="run-chart">
      <Segmented
        options={MEASURES.map((item) => ({ id: item.column, title: item.title.split(" (")[0] }))}
        value={measure}
        onChange={setMeasure}
        label="Measure shown"
      />
      <div className="mt-3">
        {problem && <p className="text-sm text-muted">{problem}</p>}
        {!problem && !tables && <div className="h-[220px] animate-pulse-soft rounded-xl bg-soft" />}
        {tables && <StepChart title={chosen.title} series={series} lastStep={steps} format={chosen.format} height={220} />}
      </div>
      <p className="mt-1 text-xs text-muted">From the saved _steps.csv files (reference seed), step by step.</p>
    </div>
  );
}
