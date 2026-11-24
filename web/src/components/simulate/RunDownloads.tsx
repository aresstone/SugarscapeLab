// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/simulate/RunDownloads.tsx
// Purpose:    Under a finished run: whether it is identical to its saved files (for a saved run), and the
//             buttons that download the run as CSV files in the same format as the saved ones. A table
//             too large to send gets a plain sentence instead, pointing to the saved file if there is one.

import { useState } from "react";
import { CircleCheck, CircleX, Download, LoaderCircle } from "lucide-react";
import { runCsv, type RunRequest, type RunResult, type SavedCheck } from "../../lib/api";
import FileLink from "../FileLink";

// Says whether a fresh run is identical to its saved CSV files, one line per file.
// saved: the comparison sent by the server.
export function SavedMatch({ saved }: { saved: SavedCheck }) {
  const files: [string, boolean | null][] = [
    [saved.agents_file, saved.agents_identical],
    [saved.steps_file, saved.steps_identical],
  ];
  return (
    <ul className="space-y-1.5" data-match={files.every(([, same]) => same === true) ? "identical" : "different"}>
      {files.map(([path, same]) => (
        <li key={path} className="flex flex-wrap items-center gap-2 text-sm">
          {same ? <CircleCheck size={16} className="text-action" /> : <CircleX size={16} className="text-muted" />}
          <span>{same ? "Identical, byte for byte, to" : same === null ? "No saved file to compare with:" : "Different from"}</span>
          <FileLink path={path} />
        </li>
      ))}
    </ul>
  );
}

// Saves text as a file in the browser's downloads.
// fileName: the name of the file. text: its content.
function saveText(fileName: string, text: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Shows a size in bytes as megabytes with one decimal. bytes: the size.
function megabytes(bytes: number): string {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

// The comparison (for a saved run) and the download buttons.
// request: what was run, sent again to make the CSV. result: the finished run (its table sizes and,
// for a saved run, the comparison with the saved files).
export default function RunDownloads({ request, result }: { request: RunRequest; result: RunResult }) {
  const saved = result.saved;
  const tables = (["steps", "agents"] as const).filter((table) => result.tables[table].sendable);
  const tooLarge = (["steps", "agents"] as const).filter((table) => !result.tables[table].sendable);
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  // Asks the server for one table of the run and saves it. table: "agents" or "steps".
  const download = (table: "agents" | "steps") => {
    setBusy(table);
    setProblem(null);
    runCsv(request, table)
      .then((answer) => saveText(answer.file_name, answer.csv))
      .catch((error: Error) => setProblem(error.message))
      .finally(() => setBusy(null));
  };

  return (
    <div className="card mt-6 space-y-4 p-5" data-tour="downloads">
      {saved && <SavedMatch saved={saved} />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Download this run, in the format of the saved files:</span>
        {tables.map((table) => (
          <button key={table} type="button" className="btn-secondary" disabled={busy !== null} onClick={() => download(table)}>
            {busy === table ? <LoaderCircle size={15} className="animate-spin" /> : <Download size={15} />}
            {table === "steps" ? "Steps CSV" : "Agents CSV"}
          </button>
        ))}
      </div>
      {tooLarge.map((table) => (
        <p key={table} className="text-sm text-muted" data-too-large={table}>
          The {table} table of this run is {megabytes(result.tables[table].bytes)}, more than the{" "}
          {megabytes(result.max_bytes)} the server sends at once, so it is not offered for download here.{" "}
          {saved ? (
            <>
              The same table is saved in the data folder, and its first rows can be read in the viewer:{" "}
              <FileLink path={table === "agents" ? saved.agents_file : saved.steps_file} />
            </>
          ) : (
            "A run with fewer agents or fewer steps can be downloaded."
          )}
        </p>
      ))}
      {problem && <p className="text-sm text-muted">{problem}</p>}
    </div>
  );
}
