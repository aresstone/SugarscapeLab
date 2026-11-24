// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/experiments/RunNumbers.tsx
// Purpose:    The main numbers of one run, read from results.json: the reference seed's value and the
//             mean, lowest and highest over all the seeds. Only the display is rounded.

import type { RunNumbers as Numbers } from "../../lib/api";
import { average, count, fraction } from "../../lib/results";

// How a row's values are shown: a count (whole number, and its mean over the seeds as an average),
// an average (one decimal) or a Gini coefficient (at most three decimals).
type Kind = "count" | "average" | "gini";
const SHOW: Record<Kind, { value: (n: number) => string; mean: (n: number) => string }> = {
  count: { value: count, mean: average },
  average: { value: average, mean: average },
  gini: { value: fraction, mean: fraction },
};

// Each row: its label, the key in results.json for the reference seed, the key under across_seeds,
// and how its values are shown.
const ROWS: [string, string, string, Kind][] = [
  ["Final population", "final_population", "final_population", "count"],
  ["Population, average of the last 50 steps", "last50_population", "population_last50", "average"],
  ["Sugar per agent, average of the last 50 steps", "last50_mean_sugar", "mean_sugar_last50", "average"],
  ["Gini coefficient, average of the last 50 steps", "last50_gini", "gini_last50", "gini"],
  ["Births", "total_births", "total_births", "count"],
  ["Deaths from starvation", "deaths_starved", "deaths_starved", "count"],
  ["Deaths from old age", "deaths_old_age", "deaths_old_age", "count"],
];

// The table. numbers: the run's entry in results.json. seeds: how many seeds the run was repeated with.
export default function RunNumbers({ numbers, seeds }: { numbers: Numbers; seeds: number }) {
  return (
    <div className="mt-5" data-tour="run-numbers">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-1.5 pr-3 font-medium">From results.json</th>
            <th className="py-1.5 pr-3 text-right font-medium">Seed {numbers.reference_seed}</th>
            <th className="py-1.5 text-right font-medium">
              {seeds} seeds: mean (lowest to highest)
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([label, key, seedsKey, kind]) => {
            const range = numbers.across_seeds[seedsKey];
            const show = SHOW[kind];
            return (
              <tr key={key} className="border-b border-line/60 last:border-0">
                <td className="py-1.5 pr-3 text-muted">{label}</td>
                <td className="py-1.5 pr-3 text-right font-medium tabular-nums" data-key={key}>
                  {show.value(numbers[key] as number)}
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  <span data-key={`across_seeds.${seedsKey}.mean`}>{show.mean(range.mean)}</span>{" "}
                  <span className="text-muted">
                    (<span data-key={`across_seeds.${seedsKey}.lowest`}>{show.value(range.lowest)}</span> to{" "}
                    <span data-key={`across_seeds.${seedsKey}.highest`}>{show.value(range.highest)}</span>)
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {numbers.extinction_step !== null && (
        <p className="mt-2 text-sm text-muted">
          With seed {numbers.reference_seed} the population reached 0 at step{" "}
          <span data-key="extinction_step">{count(numbers.extinction_step)}</span>.
        </p>
      )}
    </div>
  );
}
