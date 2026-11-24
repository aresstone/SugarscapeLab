// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/colours.ts
// Purpose:    Gives each run its colour and line style, and the world its sugar and agent colours. The
//             colours themselves are set once, in the palette at the top of src/index.css.

import type { CourseworkId } from "./api";
import { courseworkOf, type Facts } from "./results";

// Line styles in the same order as LINE_STYLES in analyse_results.py: solid, dashed, dotted, dash-dot.
// Each is an SVG dash pattern ("" means a solid line).
const DASHES = ["", "6 4", "2 3", "8 3 2 3"];

// The colour and line style of one run: the same as in the figures, so a run looks the same everywhere.
export type RunStyle = { colour: string; dash: string };

// The colour of a run with settings of one's own.
export const CUSTOM_STYLE: RunStyle = { colour: "var(--run-custom)", dash: "" };

// Gives the style of a saved run from its place in RUNS, as analyse_results.py does.
// facts: the runs. coursework: "assignment" or "project". name: the run's name.
export function runStyle(facts: Facts, coursework: CourseworkId, name: string): RunStyle {
  const index = courseworkOf(facts, coursework).runs.findIndex((run) => run.name === name);
  if (index < 0) return CUSTOM_STYLE;
  return { colour: `var(--run-${(index % 10) + 1})`, dash: DASHES[index % DASHES.length] };
}

// The world's colours, read from the palette: sugar levels 1 to 4 (level 0 shows the background),
// the agents, the ring round each agent, the ring round the chosen agent and the patches that never regrow.
export type WorldColours = { sugar: string[]; agent: string; edge: string; picked: string; noRegrow: string };

// Reads the world's colours for the theme now in use. The canvas cannot use CSS variables directly.
// No parameters.
export function readWorldColours(): WorldColours {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();
  return {
    sugar: ["", read("--sugar-1"), read("--sugar-2"), read("--sugar-3"), read("--sugar-4")],
    agent: read("--agent"),
    edge: read("--agent-edge"),
    picked: read("--agent-picked"),
    noRegrow: read("--no-regrow"),
  };
}
