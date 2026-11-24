// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/FileViewer.tsx
// Purpose:    The read-only file viewer. Any part of the app can open a project file in it, optionally at
//             the first line containing a given text; the text comes from the server, which only allows
//             files inside the project. A figure is shown as a picture.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { FileCode, LoaderCircle, X } from "lucide-react";
import { figureUrl, getFile, type ViewedFile } from "../lib/api";

type Opener = { open: (path: string, find?: string) => void };

const ViewerContext = createContext<Opener>({ open: () => {} });

// Makes the viewer available to the app and shows it when a file is opened.
// children: the app itself.
export function FileViewerProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<{ path: string; find?: string } | null>(null);
  return (
    <ViewerContext.Provider value={{ open: (path, find) => setShown({ path, find }) }}>
      {children}
      {shown && <FileViewer path={shown.path} find={shown.find} onClose={() => setShown(null)} />}
    </ViewerContext.Provider>
  );
}

// Gives the function that opens a file in the viewer. No parameters.
export function useFileViewer() {
  return useContext(ViewerContext);
}

// The viewer window: the file's path, its text with line numbers (or the figure), and a close button.
// path: the file's path relative to the project. find: optional text; the first line containing it is
// scrolled into view and highlighted. onClose: called to close the viewer.
function FileViewer({ path, find, onClose }: { path: string; find?: string; onClose: () => void }) {
  const [file, setFile] = useState<ViewedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const foundRef = useRef<HTMLDivElement>(null);
  const isFigure = path.endsWith(".png");
  const lines = file ? file.text.split("\n") : [];
  const found = find ? lines.findIndex((line) => line.includes(find)) : -1;

  useEffect(() => {
    setFile(null);
    setError(null);
    if (isFigure) return;
    getFile(path)
      .then(setFile)
      .catch((problem: Error) => setError(problem.message));
  }, [path, isFigure]);

  // Once the text is shown, brings the found line to the middle of the viewer.
  useEffect(() => {
    foundRef.current?.scrollIntoView({ block: "center" });
  }, [file, found]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="dialog"
      aria-label={`File ${path}`}
    >
      <div
        className="card flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden shadow-lift"
        data-viewer-path={isFigure ? path : file?.path}
        data-viewer-line={found >= 0 ? found + 1 : undefined}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <FileCode size={18} className="shrink-0 text-action" />
          <span className="truncate font-mono text-sm font-medium">{path}</span>
          <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">read only</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the viewer"
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {isFigure ? (
          <div className="flex flex-1 items-center justify-center overflow-auto bg-white p-4">
            <img src={figureUrl(path)} alt={`Figure ${path}`} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-soft/40 py-3 font-mono text-[12.5px] leading-relaxed">
            {!file && !error && (
              <p className="flex items-center gap-2 px-5 text-muted">
                <LoaderCircle size={16} className="animate-spin" /> Opening the file…
              </p>
            )}
            {error && <p className="px-5 text-muted">{error}</p>}
            {lines.map((line, number) => (
              <div
                key={number}
                ref={number === found ? foundRef : undefined}
                className={`flex ${number === found ? "bg-action/15" : "hover:bg-soft"}`}
              >
                <span className="w-14 shrink-0 select-none pr-4 text-right text-muted/70">{number + 1}</span>
                <code className="whitespace-pre pr-5">{line || " "}</code>
              </div>
            ))}
          </div>
        )}

        {file?.truncated && (
          <p className="border-t border-line px-5 py-2 text-xs text-muted">
            Showing the first {file.lines_shown} of {file.total_lines} lines.
          </p>
        )}
        {find && file && found < 0 && (
          <p className="border-t border-line px-5 py-2 text-xs text-muted">"{find}" was not found in this file.</p>
        )}
      </div>
    </div>
  );
}
