// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/pages/SimulatePage.tsx
// Purpose:    The Simulate page: the world running live. The settings are sent to the server, which runs
//             the project's own Python model; the page plays the run back with its charts and counters.

import { useEffect, useRef, useState } from "react";
import FileLink from "../components/FileLink";
import FadeIn from "../components/motion/FadeIn";
import Notice from "../components/Notice";
import PageHeading from "../components/PageHeading";
import AgentInfo from "../components/simulate/AgentInfo";
import Playback, { FRAMES_PER_SECOND, type Speed } from "../components/simulate/Playback";
import RunCharts from "../components/simulate/RunCharts";
import RunDownloads from "../components/simulate/RunDownloads";
import SettingsForm, { presetForm } from "../components/simulate/SettingsForm";
import WorldCanvas, { WorldKey } from "../components/simulate/WorldCanvas";
import { getStatus, runSimulation, type RunRequest } from "../lib/api";
import { CUSTOM_STYLE, runStyle } from "../lib/colours";
import { useFacts } from "../lib/results";
import { useRunStore, type CurrentRun, type RunForm } from "../lib/run-store";

// What to send the server for a set of settings: the saved run's name if they are a saved run's,
// otherwise the settings themselves. form: the settings on the page.
function requestFor(form: RunForm | CurrentRun): RunRequest {
  if (form.source) return { coursework: form.source.coursework, run: form.source.run };
  if ("result" in form) return { settings: form.result.settings, steps: form.result.steps };
  return { settings: form.settings, steps: form.steps };
}

// Writes a whole number as an ordinal: 2nd, 3rd, 4th, 21st and so on.
// n: the number.
function ordinal(n: number): string {
  const ending = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${ending}`;
}

// The Simulate page. No props.
export default function SimulatePage() {
  const { facts, problem } = useFacts();
  const { form, setForm, current, setCurrent } = useRunStore();
  const [running, setRunning] = useState(false);
  const [runProblem, setRunProblem] = useState<string | null>(null);
  const [hosted, setHosted] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [pickedId, setPickedId] = useState<number | null>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const ranOnOpen = useRef(false); // the page runs the loaded settings once when it first opens
  const frames = current?.result.frames ?? [];

  useEffect(() => {
    getStatus()
      .then((status) => setHosted(status.hosted))
      .catch(() => setHosted(false));
  }, []);

  // The first time, the page starts with the Assignment's first run loaded.
  useEffect(() => {
    if (facts && !form) setForm(presetForm(facts, facts.courseworks[0], facts.courseworks[0].runs[0].name));
  }, [facts, form, setForm]);

  // When the page first opens with nothing run yet, the loaded settings are run, so the world shows at once.
  useEffect(() => {
    if (form && !current && !ranOnOpen.current) {
      ranOnOpen.current = true;
      run(false);
    }
  });

  // A new run starts from its first step and plays (unless less motion is asked for).
  useEffect(() => {
    setIndex(0);
    setPickedId(null);
    setPlaying(current !== null && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [current]);

  // While playing, moves one frame on at the chosen speed, and stops at the last frame.
  useEffect(() => {
    if (!playing) return;
    if (index >= frames.length - 1) return void setPlaying(false);
    const timer = setTimeout(() => setIndex(index + 1), 1000 / FRAMES_PER_SECOND[speed]);
    return () => clearTimeout(timer);
  }, [playing, index, speed, frames.length]);

  // Sends the settings to the server and keeps the finished run.
  // scroll: bring the world into view when the run arrives (not for the run made when the page opens).
  const run = (scroll = true) => {
    if (!form) return;
    setRunning(true);
    setRunProblem(null);
    runSimulation(requestFor(form))
      .then((result) => {
        setCurrent({ result, source: form.source });
        if (scroll) setTimeout(() => worldRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      })
      .catch((error: Error) => setRunProblem(error.message))
      .finally(() => setRunning(false));
  };

  const frame = frames[Math.min(index, frames.length - 1)];
  const style = facts && current?.source ? runStyle(facts, current.source.coursework, current.source.run) : CUSTOM_STYLE;

  return (
    <section>
      <PageHeading eyebrow="Simulate" title="Watch the sugar world run.">
        This is an interface to the Sugarscape model in this project's Python files, <FileLink path="assignment/sugarscape.py" />.
        It runs those same files and adds no rules of its own.
      </PageHeading>
      <FadeIn delay={0.05}>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted" data-tour="about-app">
          The coursework itself is the Python files, the CSV files and the reports, and it is complete without this app. The
          app is an extra in two forms: it starts on any computer with one command (see README.md), and a hosted copy can be
          tried without installing anything.{hosted && " This is the hosted copy."}
        </p>
      </FadeIn>

      <div className="mt-8 space-y-4">
        {problem && <Notice title="The runs could not be loaded">{problem}</Notice>}
        {facts && form && <SettingsForm facts={facts} form={form} onChange={setForm} onRun={() => run()} running={running} />}
        {runProblem && <Notice title="The run could not be done">{runProblem}</Notice>}
      </div>

      {current && frame ? (
        <>
          <div ref={worldRef} className="mt-6 grid scroll-mt-20 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="card p-5">
              <p className="text-sm font-semibold">
                {current.source ? current.source.title : "Custom settings"}
                <span className="font-normal text-muted"> · seed {current.result.settings.seed}</span>
              </p>
              <div className="mt-3">
                <WorldCanvas
                  frame={frame}
                  width={current.result.width}
                  height={current.result.height}
                  noRegrow={current.result.no_regrow}
                  pickedId={pickedId}
                  onPick={setPickedId}
                />
              </div>
              <WorldKey />
              <Playback
                index={index}
                count={frames.length}
                step={frame.step}
                lastStep={current.result.steps}
                playing={playing}
                speed={speed}
                onIndex={(next) => setIndex(Math.max(0, Math.min(frames.length - 1, next)))}
                onPlaying={setPlaying}
                onSpeed={setSpeed}
              />
              {current.result.frame_every > 1 && (
                <p className="mt-2 text-xs text-muted">
                  To keep the server's answer small enough to send, playback shows every {ordinal(current.result.frame_every)} step. The
                  counters and charts use every step.
                </p>
              )}
              <AgentInfo agentId={pickedId} frame={frame} traits={current.result.traits} />
            </div>
            <div className="card p-5">
              <RunCharts result={current.result} step={frame.step} style={style} label={current.source?.title ?? "Custom settings"} />
            </div>
          </div>
          <RunDownloads request={requestFor(current)} result={current.result} />
        </>
      ) : (
        !running && (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
            Choose the settings, or load a required run, and press Run. The world appears here.
          </p>
        )
      )}
    </section>
  );
}
