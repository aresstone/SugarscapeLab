// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/FileLink.tsx
// Purpose:    A file name that opens the file in the read-only viewer when clicked, optionally at the
//             first line that contains a given text (for example a function's name).

import { FileCode, Image } from "lucide-react";
import { useFileViewer } from "./FileViewer";

type Props = { path: string; find?: string; label?: string };

// A small button showing a project file's path (or a label).
// path: the file's path relative to the sugarscape-lab folder, for example "assignment/sugarscape.py".
// find: optional text; the viewer scrolls to the first line containing it and highlights that line.
// label: optional text shown instead of the path, for example "sugarscape.py: choose_cell".
export default function FileLink({ path, find, label }: Props) {
  const { open } = useFileViewer();
  const Icon = path.endsWith(".png") ? Image : FileCode;
  return (
    <button
      type="button"
      onClick={() => open(path, find)}
      data-file={path}
      data-find={find}
      title={find ? `${path}, at "${find}"` : path}
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-soft px-2 py-1 text-left font-mono text-xs text-ink transition-colors hover:bg-action/10 hover:text-action"
    >
      <Icon size={12} className="shrink-0" />
      <span className="truncate">{label ?? path}</span>
    </button>
  );
}
