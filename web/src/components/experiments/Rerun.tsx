// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/experiments/Rerun.tsx
// Purpose:    "Run it again" on a run's card: the server runs the saved run afresh with the project's own
//             files and says whether the result is identical to the saved CSV files. The fresh run can
//             then be watched on the Simulate page.

import { useState } from "react";
import { LoaderCircle, MonitorPlay, RotateCcw } from "lucide-react";
import { runSimulation, type Coursework, type RunResult } from "../../lib/api";
import { openPage } from "../../lib/navigation";
import type { Facts } from "../../lib/results";
import { useRunStore } from "../../lib/run-store";
import { presetForm } from "../simulate/SettingsForm";
import { SavedMatch } from "../simulate/RunDownloads";

type Props = { facts: Facts; coursework: Coursework; run: string };

// The button, then the comparison and the playback button.
// facts: the runs. coursework: the coursework the run belongs to. run: the run's name.
export default function Rerun({ facts, coursework, run }: Props) {
  const { setForm, setCurrent } = useRunStore();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<{ result: RunResult; seconds: number } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  // Runs the saved run again on the server and keeps the result.
  const again = () => {
    setRunning(true);
    setProblem(null);
    const started = performance.now();
    runSimulation({ coursework: coursework.id, run })
      .then((result) => setDone({ result, seconds: (performance.now() - started) / 1000 }))
      .catch((error: Error) => setProblem(error.message))
      .finally(() => setRunning(false));
  };

  // Hands the fresh run to the Simulate page and opens it.
  const watch = () => {
    if (!done) return;
    const form = presetForm(facts, coursework, run);
    setForm(form);
    setCurrent({ result: done.result, source: form.source });
    openPage("simulate");
  };

  return (
    <div className="mt-5 rounded-2xl bg-soft/60 p-4" data-tour="rerun">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={again} disabled={running}>
          {running ? <LoaderCircle size={16} className="animate-spin" /> : <RotateCcw size={16} />}
          {running ? "Running on the server…" : "Run it again"}
        </button>
        {done && (
          <button type="button" className="btn-secondary" onClick={watch}>
            <MonitorPlay size={16} /> Watch the playback
          </button>
        )}
      </div>
      {!done && !problem && (
        <p className="mt-2 text-xs text-muted">Runs it afresh on the server and compares the result with the saved files.</p>
      )}
      {done && (
        <div className="mt-3 space-y-2" data-rerun-done>
          <p className="text-xs text-muted">Run again on the server in {done.seconds.toFixed(1)} s:</p>
          {done.result.saved && <SavedMatch saved={done.result.saved} />}
        </div>
      )}
      {problem && <p className="mt-2 text-sm text-muted">{problem}</p>}
    </div>
  );
}
