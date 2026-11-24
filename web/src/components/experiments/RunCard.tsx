// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/experiments/RunCard.tsx
// Purpose:    The card of one required run on the Experiments page: its title and the line of the brief it
//             answers, what it changes, its numbers, its chart, "Run it again", and links to its files.

import type { Coursework, SavedRun } from "../../lib/api";
import { runOf, type Facts } from "../../lib/results";
import { describeChanges } from "../../content/experiments";
import FileLink from "../FileLink";
import FadeIn from "../motion/FadeIn";
import CompareChart from "./CompareChart";
import Rerun from "./Rerun";
import RunNumbers from "./RunNumbers";

type Props = { facts: Facts; coursework: Coursework; run: SavedRun; first: boolean };

// One run's card. facts: the runs and defaults. coursework: the coursework the run belongs to.
// run: the run. first: true for the first card on the page, which the guided tour points at.
export default function RunCard({ facts, coursework, run, first }: Props) {
  const compared = run.compare_with ? runOf(facts, coursework.id, run.compare_with) : null;
  return (
    <FadeIn>
      <article className="card p-5 sm:p-6" data-run={`${coursework.id}/${run.name}`} data-tour={first ? "run-card" : undefined}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <p className="font-mono text-xs text-muted">{run.name}</p>
            <h4 className="mt-1 text-xl font-semibold tracking-tight">{run.title}</h4>
            <p className="mt-2 text-sm" data-tour={first ? "run-brief" : undefined}>
              <span className="text-muted">Brief: </span>
              {run.brief}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Changed from the original</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {describeChanges(run.settings, facts.defaults).map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
            {compared && (
              <p className="mt-3 text-sm">
                <span className="text-muted">Compared with: </span>
                {compared.title}
              </p>
            )}
            {run.numbers ? (
              <RunNumbers numbers={run.numbers} seeds={coursework.repeat_seeds.length} />
            ) : (
              <p className="mt-5 text-sm text-muted">No numbers: {coursework.id}/results/results.json is not available.</p>
            )}
          </div>
          <div>
            <CompareChart facts={facts} coursework={coursework.id} run={run.name} compareWith={run.compare_with} steps={run.steps} />
            <Rerun facts={facts} coursework={coursework} run={run.name} />
            <div className="mt-4 flex flex-wrap items-center gap-2" data-tour={first ? "run-files" : undefined}>
              <span className="text-xs text-muted">Files:</span>
              <FileLink path={run.files.agents} label={run.files.agents.split("/").pop()} />
              <FileLink path={run.files.steps} label={run.files.steps.split("/").pop()} />
              <FileLink path={coursework.run_file} find={`make_run("${run.name}"`} label={`run_simulations.py: ${run.name}`} />
            </div>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}
