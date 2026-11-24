// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/simulate/RunCharts.tsx
// Purpose:    Beside the world: the counters (alive, born, starved, died of old age) and the three charts
//             (population, average sugar, Gini coefficient), all following the step being shown.

import type { RunResult } from "../../lib/api";
import type { RunStyle } from "../../lib/colours";
import { MEASURES, column, livingValues, runningTotals } from "../../lib/run-data";
import StepChart from "../charts/StepChart";

type Props = { result: RunResult; step: number; style: RunStyle; label: string };

// The counters and charts. result: the run. step: the step shown. style: the run's colour and dash.
// label: the run's name in the tooltip.
export default function RunCharts({ result, step, style, label }: Props) {
  const columns = result.step_columns;
  const rows = result.step_rows;
  const counters: [string, number][] = [
    ["Alive", column(columns, rows, "population")[step]],
    ["Born", runningTotals(column(columns, rows, "births"))[step]],
    ["Starved", runningTotals(column(columns, rows, "deaths_starved"))[step]],
    ["Died of old age", runningTotals(column(columns, rows, "deaths_old_age"))[step]],
  ];

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-tour="counters">
        {counters.map(([name, value]) => (
          <div key={name} className="rounded-2xl bg-soft px-4 py-3">
            <dt className="text-xs text-muted">{name}</dt>
            <dd className="text-2xl font-semibold tabular-nums" data-counter={name}>
              {value.toLocaleString("en-GB")}
            </dd>
          </div>
        ))}
      </dl>
      <div className="space-y-5" data-tour="run-charts">
        {MEASURES.map((measure) => {
          const values = livingValues(columns, rows, measure.column);
          return (
            <StepChart
              key={measure.column}
              title={measure.title}
              series={[{ label, style, values: values.slice(0, step + 1) }]}
              lastStep={result.steps}
              yMax={Math.max(0, ...values)}
              format={measure.format}
              height={150}
            />
          );
        })}
      </div>
    </div>
  );
}
