// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/pages/ExperimentsPage.tsx
// Purpose:    The Experiments page: every simulation the two briefs ask for, grouped as the briefs group
//             them, each with its numbers from results.json, a chart from its saved steps and a re-run.
//             The figures drawn by analyse_results.py can be opened here too.

import RunCard from "../components/experiments/RunCard";
import FileLink from "../components/FileLink";
import FadeIn from "../components/motion/FadeIn";
import Notice from "../components/Notice";
import PageHeading from "../components/PageHeading";
import SectionHeading from "../components/SectionHeading";
import { RUN_GROUPS } from "../content/experiments";
import type { Coursework } from "../lib/api";
import { useFacts, type Facts } from "../lib/results";

// One coursework: its groups of run cards, then its figures.
// facts: the runs and defaults. coursework: the coursework to show. first: true for the first one on the page.
function CourseworkSection({ facts, coursework, first }: { facts: Facts; coursework: Coursework; first: boolean }) {
  return (
    <div id={`coursework-${coursework.id}`} className="scroll-mt-4">
      <SectionHeading eyebrow={coursework.title} title={`The ${coursework.title}'s ${coursework.runs.length} runs.`}>
        Settings from <FileLink path={coursework.run_file} />, numbers from{" "}
        <FileLink path={`${coursework.id}/results/results.json`} />, charts from the saved _steps.csv files.
      </SectionHeading>
      {!coursework.results_available && (
        <div className="mt-6">
          <Notice title="The results are not available">{coursework.results_message}</Notice>
        </div>
      )}
      {RUN_GROUPS[coursework.id].map((group, groupIndex) => (
        <div key={group.title} className="mt-10">
          <FadeIn>
            <h3 className="text-2xl font-semibold tracking-tight">{group.title}</h3>
            <p className="mt-1 max-w-3xl text-sm text-muted">{group.text}</p>
          </FadeIn>
          <div className="mt-5 space-y-5">
            {group.runs.map((name, index) => {
              const run = coursework.runs.find((item) => item.name === name);
              return run ? (
                <RunCard key={name} facts={facts} coursework={coursework} run={run} first={first && groupIndex === 0 && index === 0} />
              ) : null;
            })}
          </div>
        </div>
      ))}
      <FadeIn className="mt-10" {...(first ? { "data-tour": "figures" } : {})}>
        <h3 className="text-lg font-semibold tracking-tight">The {coursework.title}'s figures</h3>
        <p className="mt-1 text-sm text-muted">Drawn by {coursework.id}/analyse_results.py from the CSV files. Click one to open it.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {coursework.figures.length === 0 && <span className="text-sm text-muted">No figures have been drawn yet.</span>}
          {coursework.figures.map((path) => (
            <FileLink key={path} path={path} label={path.split("/").pop()} />
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

// The Experiments page. No props.
export default function ExperimentsPage() {
  const { facts, problem } = useFacts();
  const seeds = facts?.courseworks[0].repeat_seeds.length;

  return (
    <section>
      <PageHeading eyebrow="Experiments" title="Every required run, ready to run again.">
        Every simulation the two briefs ask for, grouped as the briefs group them.
        {seeds !== undefined && ` Each run was repeated with ${seeds} seeds; the full data is saved for the first, the reference seed.`}
      </PageHeading>
      {facts && (
        <FadeIn className="mt-6 flex flex-wrap gap-2" delay={0.05}>
          {facts.courseworks.map((coursework) => (
            <a key={coursework.id} href={`#coursework-${coursework.id}`} onClick={(event) => {
              event.preventDefault();
              document.getElementById(`coursework-${coursework.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }} className="btn-secondary !py-1.5">
              {coursework.title}
              <span className="text-xs text-muted">{coursework.runs.length}</span>
            </a>
          ))}
        </FadeIn>
      )}
      {problem && (
        <div className="mt-8">
          <Notice title="The runs could not be loaded">{problem}</Notice>
        </div>
      )}
      {facts?.courseworks.map((coursework, index) => (
        <CourseworkSection key={coursework.id} facts={facts} coursework={coursework} first={index === 0} />
      ))}
    </section>
  );
}
