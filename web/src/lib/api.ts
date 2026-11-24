// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/api.ts
// Purpose:    Talks to the Python server (app/server.py). Each function calls one /api address and
//             returns its answer, or throws an error with a plain message.

export type CourseworkId = "assignment" | "project";

// The settings the Simulate page can change (the names of DEFAULT_SETTINGS in sugarscape.py).
export type Settings = {
  num_agents: number;
  seed: number;
  regrowth_rate: number;
  vision_min: number;
  vision_max: number;
  no_regrow_patches: number;
  lifespan: boolean;
  reproduction: boolean;
  reproduction_threshold: number;
};

export type Status = {
  hosted: boolean;
  results: Record<CourseworkId, { available: boolean; message: string | null }>;
};

// A low, mean and high value over the five seeds, as in results.json.
export type AcrossSeeds = { mean: number; lowest: number; highest: number };

// The numbers of one run in results.json. Only the keys the app reads are listed.
export type RunNumbers = {
  reference_seed: number;
  final_population: number;
  last50_population: number;
  last50_mean_sugar: number;
  last50_gini: number;
  total_births: number;
  deaths_starved: number;
  deaths_old_age: number;
  extinction_step: number | null;
  across_seeds: Record<string, AcrossSeeds>;
  [key: string]: unknown;
};

// One saved run from RUNS in run_simulations.py, with its numbers (null if results.json is missing)
// and the paths of its two CSV files.
export type SavedRun = {
  name: string;
  title: string;
  brief: string;
  compare_with: string | null;
  steps: number;
  settings: Partial<Settings>;
  numbers: RunNumbers | null;
  files: { agents: string; steps: string };
};

export type Coursework = {
  id: CourseworkId;
  title: string;
  run_file: string;
  repeat_seeds: number[];
  results_available: boolean;
  results_message: string | null;
  figures: string[];
  runs: SavedRun[];
};

export type Experiments = {
  courseworks: Coursework[];
  defaults: Settings & Record<string, number | boolean>;
  editable: (keyof Settings)[];
  limits: {
    max_agents: number;
    max_steps: number;
    max_vision: number;
    max_regrowth: number;
    max_threshold: number;
    sugary_cells: number;
  };
};

// The rows of a saved _steps.csv file, as numbers.
export type StepTable = { columns: string[]; rows: number[][] };

// One step of playback: its number, the sugar on every cell (one digit per cell, row by row) and,
// for every living agent, [agent_id, x, y, sugar, age].
export type Frame = { step: number; sugar: string; agents: [number, number, number, number, number][] };

// Whether a fresh run is identical to its saved CSV files (null when a file is missing).
export type SavedCheck = {
  coursework: CourseworkId;
  run: string;
  agents_file: string;
  agents_identical: boolean | null;
  steps_file: string;
  steps_identical: boolean | null;
};

// A finished run as sent by the server: the settings used, every step's numbers (step_rows, in
// step_columns order), the playback frames (every frame_every-th step), each agent's
// [vision, metabolism], the patches that never regrow, the size of each CSV table and whether it can
// be sent (max_bytes is the largest answer the server sends) and, for a saved run, the comparison.
export type RunResult = {
  settings: Settings;
  steps: number;
  width: number;
  height: number;
  step_columns: string[];
  step_rows: number[][];
  frame_every: number;
  frames: Frame[];
  traits: Record<string, [number, number]>;
  no_regrow: [number, number][];
  tables: Record<"agents" | "steps", { bytes: number; sendable: boolean }>;
  max_bytes: number;
  saved: SavedCheck | null;
};

// What to run: a saved run by its coursework and name, or settings of one's own (any setting left out
// keeps its default).
export type RunRequest = { coursework: CourseworkId; run: string } | { settings: Partial<Settings>; steps: number };

export type MapEntry = {
  name: string;
  path: string;
  description: string;
  type: "file" | "folder";
  viewable?: boolean;
  collapsed?: boolean;
  children?: MapEntry[];
};

export type ViewedFile = { path: string; text: string; lines_shown: number; total_lines: number; truncated: boolean };

// Gets the folder tree of the project, with one line about each folder and file. No parameters.
export function getProjectMap(): Promise<MapEntry> {
  return request<MapEntry>("/api/project-map");
}

// Asks the server to open a project folder in the computer's file manager (Finder, File Explorer).
// path: the folder's path relative to the project; an empty path means the project folder itself.
export function openFolder(path: string): Promise<{ opened: string }> {
  return request(`/api/open-folder?path=${encodeURIComponent(path)}`, { method: "POST" });
}

// Gets the text of one project file for the read-only viewer.
// path: the file's path relative to the sugarscape-lab folder.
export function getFile(path: string): Promise<ViewedFile> {
  return request<ViewedFile>(`/api/file?path=${encodeURIComponent(path)}`);
}

const NOT_ANSWERING = "The Sugarscape Lab server is not answering. Start it with: python app/server.py";

// Sends one request to the server and returns its JSON answer.
// url: the address, starting with /api. options: fetch options such as the method and the body.
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(NOT_ANSWERING);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (typeof body?.detail === "string") throw new Error(body.detail);
    if ([502, 503, 504].includes(response.status)) throw new Error(NOT_ANSWERING);
    throw new Error(`The server answered with an error (${response.status}).`);
  }
  return (await response.json()) as T;
}

// Asks whether this is the hosted copy and whether the results files are there. No parameters.
export function getStatus(): Promise<Status> {
  return request<Status>("/api/status");
}

// Gets both pieces of coursework with their runs, numbers and files, and the model's defaults. No parameters.
export function getExperiments(): Promise<Experiments> {
  return request<Experiments>("/api/experiments");
}

// Gets the saved per-step rows of one run.
// coursework: "assignment" or "project". run: the run's name, for example "01_base_100".
export function getSteps(coursework: CourseworkId, run: string): Promise<StepTable> {
  return request<StepTable>(`/api/steps?coursework=${coursework}&run=${encodeURIComponent(run)}`);
}

// Runs a simulation on the server, with the project's own Python files.
// what: a saved run by name, or settings and a number of steps.
export function runSimulation(what: RunRequest): Promise<RunResult> {
  return request<RunResult>("/api/run", jsonPost(what));
}

// Runs a simulation and gets one of its tables as CSV text, in the same format as the saved files.
// what: as for runSimulation. table: "agents" or "steps".
export function runCsv(what: RunRequest, table: "agents" | "steps"): Promise<{ file_name: string; csv: string }> {
  return request(`/api/run-csv?table=${table}`, jsonPost(what));
}

// The fetch options of a POST request with a JSON body.
// body: what to send.
function jsonPost(body: unknown): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

// Gives the address of a figure drawn by analyse_results.py, for an <img> tag.
// path: the figure's path relative to the project, for example "assignment/figures/fig01_landscape.png".
export function figureUrl(path: string): string {
  return `/api/figure?path=${encodeURIComponent(path)}`;
}
