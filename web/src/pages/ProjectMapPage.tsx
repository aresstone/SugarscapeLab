// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/pages/ProjectMapPage.tsx
// Purpose:    The Project map page: the folder tree of the project with one line about each folder
//             and file (from app/project_map.py). Clicking a file opens it in the read-only viewer, and a
//             figure opens as a picture. On the computer running the app, folders can be opened too.

import { useEffect, useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  File,
  FileCode,
  Image,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useFileViewer } from "../components/FileViewer";
import FadeIn from "../components/motion/FadeIn";
import Notice from "../components/Notice";
import PageHeading from "../components/PageHeading";
import { getProjectMap, getStatus, openFolder, type MapEntry } from "../lib/api";

// The small button beside a folder that opens the real folder on the computer.
// path: the folder's path in the project. name: its name, for screen readers. onOpen: called with the path.
function OpenFolderButton({
  path,
  name,
  onOpen,
}: {
  path: string;
  name: string;
  onOpen: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(path)}
      title="Open this folder on the computer"
      aria-label={`Open the ${name} folder on the computer`}
      className="mt-0.5 shrink-0 rounded-lg p-1.5 text-muted hover:bg-soft hover:text-action"
    >
      <ExternalLink size={15} />
    </button>
  );
}

// The two rows the guide points at when it explains this page: one folder and one file.
const TOUR_MARKS: Record<string, string> = {
  assignment: "map-folder",
  "README.md": "map-file",
};

// One row of the tree, and the rows inside it when it is an open folder.
// entry: the folder or file. depth: how far it is indented (0 for the top level).
// onOpenFolder: called with a folder's path when its "open on the computer" button is clicked, or
// null when folders cannot be opened (in the hosted copy).
function TreeRow({
  entry,
  depth,
  onOpenFolder,
}: {
  entry: MapEntry;
  depth: number;
  onOpenFolder: ((path: string) => void) | null;
}) {
  const [open, setOpen] = useState(depth < 1);
  const viewer = useFileViewer();
  const folder = entry.type === "folder";
  const expandable =
    folder && !entry.collapsed && (entry.children?.length ?? 0) > 0;
  const action = expandable
    ? () => setOpen(!open)
    : !folder && entry.viewable
      ? () => viewer.open(entry.path)
      : undefined;
  const Icon = folder
    ? expandable && open
      ? FolderOpen
      : Folder
    : entry.path.endsWith(".png")
      ? Image
      : entry.viewable
        ? FileCode
        : File;

  return (
    <li>
      <div className="flex items-start gap-1" data-tour={TOUR_MARKS[entry.path]}>
        <button
          type="button"
          onClick={action}
          disabled={!action}
          data-file={!folder && entry.viewable ? entry.path : undefined}
          aria-expanded={expandable ? open : undefined}
          className="grid min-w-0 flex-1 items-start gap-x-4 rounded-xl px-2 py-1.5 text-left enabled:hover:bg-soft disabled:cursor-default sm:grid-cols-[minmax(0,20rem)_1fr]"
        >
          <span
            className="flex min-w-0 items-center gap-1.5"
            style={{ paddingLeft: depth * 20 }}
          >
            <ChevronRight
              size={14}
              className={`shrink-0 text-muted transition-transform ${expandable ? "" : "invisible"} ${open ? "rotate-90" : ""}`}
            />
            <Icon
              size={16}
              className={`shrink-0 ${folder ? "text-action" : entry.viewable ? "text-ink" : "text-muted"}`}
            />
            <span
              className={`truncate font-mono text-[13px] ${folder ? "font-semibold" : ""}`}
            >
              {entry.name}
              {folder ? "/" : ""}
            </span>
          </span>
          <span className="pl-9 text-sm text-muted sm:pl-0">
            {entry.description}
            {entry.collapsed && (
              <span className="ml-2 rounded-full bg-soft px-2 py-0.5 text-[11px]">
                contents not listed
              </span>
            )}
          </span>
        </button>
        {folder && onOpenFolder && (
          <OpenFolderButton
            path={entry.path}
            name={entry.name}
            onOpen={onOpenFolder}
          />
        )}
      </div>
      {expandable && open && (
        <ul>
          {entry.children!.map((child) => (
            <TreeRow
              key={child.path}
              entry={child}
              depth={depth + 1}
              onOpenFolder={onOpenFolder}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// The Project map page. No props.
export default function ProjectMapPage() {
  const [map, setMap] = useState<MapEntry | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [openProblem, setOpenProblem] = useState<string | null>(null);
  const [canOpen, setCanOpen] = useState(false); // false until the server says it is not the hosted copy

  // Asks the server to open a folder in the computer's file manager, and shows a note if it cannot.
  // path: the folder's path in the project; empty for the project folder itself.
  const openOnComputer = (path: string) => {
    setOpenProblem(null);
    openFolder(path).catch((error: Error) => setOpenProblem(error.message));
  };

  useEffect(() => {
    getProjectMap()
      .then(setMap)
      .catch((error: Error) => setProblem(error.message));
    getStatus()
      .then((status) => setCanOpen(!status.hosted))
      .catch(() => setCanOpen(false));
  }, []);

  return (
    <section>
      <PageHeading eyebrow="Project map" title="Where everything lives.">
        {map?.description ?? "The folders and files of the project."} Click a
        folder to open or close it, and a file to read it.
        {canOpen && " The arrow beside a folder opens that folder on this computer."}
      </PageHeading>
      {problem && (
        <div className="mt-8">
          <Notice title="The project map could not be loaded">{problem}</Notice>
        </div>
      )}
      {openProblem && (
        <div className="mt-8">
          <Notice title="The folder could not be opened">{openProblem}</Notice>
        </div>
      )}
      {map && (
        <FadeIn className="mt-10" data-tour="project-map">
          <div className="card p-3 sm:p-4">
            <div className="flex items-center gap-1 px-2 pb-2">
              <p className="font-mono text-sm font-semibold">{map.name}/</p>
              {canOpen && (
                <OpenFolderButton
                  path=""
                  name={map.name}
                  onOpen={openOnComputer}
                />
              )}
            </div>
            <ul>
              {map.children?.map((child) => (
                <TreeRow
                  key={child.path}
                  entry={child}
                  depth={0}
                  onOpenFolder={canOpen ? openOnComputer : null}
                />
              ))}
            </ul>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
