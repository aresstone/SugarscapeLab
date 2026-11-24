// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/learn/Diagrams.tsx
// Purpose:    The simple diagrams on the Learn pages. They illustrate ideas only and show no results; the
//             map of the landscape is the model's own world at step 0, asked of the server.

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { DiagramId } from "../../content/learn";
import { runSimulation } from "../../lib/api";

// A small rounded box with a title and an optional note, used in the flow diagrams.
// title: the main text. note: a smaller line under it. strong: draw it with the gradient ring.
function Box({ title, note, strong = false }: { title: ReactNode; note?: string; strong?: boolean }) {
  return (
    <div className={`card px-4 py-3 text-center ${strong ? "ai-glow ai-glow-soft" : ""}`}>
      <div className="text-sm font-semibold">{title}</div>
      {note && <div className="mt-0.5 text-xs text-muted">{note}</div>}
    </div>
  );
}

// Boxes in a row with arrows between them (wrapping on narrow screens).
// items: the boxes, each as [title, note]. strongLast: give the last box the gradient ring.
function Flow({ items, strongLast = true }: { items: [string, string?][]; strongLast?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {items.map(([title, note], i) => (
        <div key={title} className="flex items-center gap-2">
          {i > 0 && <ArrowRight size={16} className="shrink-0 text-muted" />}
          <Box title={title} note={note} strong={strongLast && i === items.length - 1} />
        </div>
      ))}
    </div>
  );
}

// The model's landscape: the sugar on every cell at step 0, which is each cell's capacity.
function Landscape() {
  const [sugar, setSugar] = useState<{ text: string; width: number } | null>(null);
  useEffect(() => {
    runSimulation({ settings: { num_agents: 1 }, steps: 1 })
      .then((run) => setSugar({ text: run.frames[0].sugar, width: run.width }))
      .catch(() => setSugar(null));
  }, []);
  if (!sugar) return <p className="text-center text-sm text-muted">The map is drawn from the model when the server answers.</p>;
  const cells = [...sugar.text];
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg viewBox={`0 0 ${sugar.width} ${cells.length / sugar.width}`} className="w-56 rounded-lg border border-line" role="img" aria-label="The capacity of every cell: two hills of sugar">
        <rect width="100%" height="100%" fill="var(--background)" />
        {cells.map((level, i) =>
          level === "0" ? null : (
            <rect key={i} x={i % sugar.width} y={Math.floor(i / sugar.width)} width="1.02" height="1.02" fill={`var(--sugar-${level})`} />
          ),
        )}
      </svg>
      <div className="space-y-1.5 text-xs text-muted">
        {[4, 3, 2, 1].map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-[3px] border border-line" style={{ backgroundColor: `var(--sugar-${level})` }} /> capacity {level}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-[3px] border border-line bg-page" /> no sugar
        </div>
      </div>
    </div>
  );
}

// The worked example of one turn: a 7 by 7 patch, the agent in the middle with a vision of 2.
// Each cell is [sugar, "seen" | "taken" | "chosen" | ""]. Cells the agent cannot see are faded.
const EXAMPLE: [number, string][][] = [
  [[2, ""], [3, ""], [4, ""], [1, ""], [4, ""], [2, ""], [1, ""]],
  [[1, ""], [4, ""], [2, ""], [3, "seen"], [2, ""], [4, ""], [0, ""]],
  [[0, ""], [2, ""], [4, ""], [2, "seen"], [4, ""], [1, ""], [2, ""]],
  [[0, ""], [1, "seen"], [2, "taken"], [1, "seen"], [3, "chosen"], [1, "seen"], [4, ""]],
  [[1, ""], [2, ""], [3, ""], [1, "seen"], [2, ""], [3, ""], [1, ""]],
  [[0, ""], [1, ""], [2, ""], [2, "seen"], [1, ""], [2, ""], [0, ""]],
  [[0, ""], [0, ""], [1, ""], [1, ""], [0, ""], [1, ""], [0, ""]],
];

// Draws the worked example of one agent's turn.
function Turn() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="grid grid-cols-7 gap-1">
        {EXAMPLE.flatMap((row, y) =>
          row.map(([sugar, kind], x) => {
            const self = x === 3 && y === 3;
            const visible = kind !== "" || self;
            return (
              <div
                key={`${x}-${y}`}
                className={`relative flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium ${
                  kind === "chosen" ? "border-2 border-action" : "border-line"
                } ${visible ? "" : "opacity-30"}`}
                style={{ backgroundColor: sugar ? `var(--sugar-${sugar})` : "var(--background)" }}
              >
                {self ? (
                  <span className="h-4 w-4 rounded-full border-2" style={{ backgroundColor: "var(--agent)", borderColor: "var(--agent-edge)" }} />
                ) : (
                  <span className="rounded bg-card/85 px-1 text-ink">{sugar}</span>
                )}
                {kind === "taken" && (
                  <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--muted-foreground)" }} />
                )}
              </div>
            );
          }),
        )}
      </div>
      <ul className="space-y-1.5 text-xs text-muted">
        <li><span className="font-semibold text-ink">Blue dot:</span> the agent (vision 2)</li>
        <li><span className="font-semibold text-ink">Bright cells:</span> what it can see</li>
        <li><span className="font-semibold text-ink">Faded cells:</span> out of sight, even with more sugar</li>
        <li><span className="font-semibold text-ink">Grey dot:</span> a cell taken by another agent</li>
        <li><span className="font-semibold text-ink">Thick border:</span> the cell it chooses</li>
      </ul>
    </div>
  );
}

// An illustration of a Lorenz curve: the diagonal of equality, a curve below it, and the gap between.
function Lorenz() {
  const curve = "M20 200 C 90 195, 150 175, 200 20";
  return (
    <svg viewBox="0 0 230 230" className="mx-auto w-64" role="img" aria-label="A Lorenz curve below the diagonal of equality">
      <path d="M20 200 L200 20 C 150 175, 90 195, 20 200 Z" fill="var(--sugar-2)" opacity="0.6" />
      <line x1="20" y1="200" x2="200" y2="20" stroke="var(--muted-foreground)" strokeDasharray="4 3" strokeWidth="1.5" />
      <path d={curve} fill="none" stroke="var(--action)" strokeWidth="2.5" />
      <line x1="20" y1="200" x2="200" y2="200" stroke="var(--foreground)" strokeWidth="1" />
      <line x1="20" y1="200" x2="20" y2="20" stroke="var(--foreground)" strokeWidth="1" />
      <text x="110" y="218" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">share of agents, poorest first</text>
      <text x="10" y="110" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" transform="rotate(-90 10 110)">share of all sugar</text>
      <text x="86" y="92" fontSize="9" fill="var(--muted-foreground)" transform="rotate(-45 86 92)">equality</text>
      <text x="128" y="150" fontSize="9" fill="var(--foreground)">gap</text>
      <text x="150" y="196" fontSize="9" fill="var(--action)">Lorenz curve</text>
    </svg>
  );
}

const DIAGRAMS: Record<DiagramId, () => ReactNode> = {
  abm: () => (
    <Flow items={[["Many agents", "each a little different"], ["A few simple rules", "look, move, eat, burn"], ["Step after step", "every agent acts"], ["Patterns of the group", "what is studied"]]} />
  ),
  landscape: Landscape,
  turn: Turn,
  emergence: () => (
    <Flow items={[["One rule for all", "go to the most sugar in sight"], ["Many agents, many steps", "each acting alone"], ["A pattern no rule names", "crowds on the hills, unequal sugar"]]} />
  ),
  files: () => (
    <Flow
      items={[["sugarscape.py", "the world and the rules"], ["run_simulations.py", "runs every simulation"], ["data/*.csv", "agents and steps"], ["analyse_results.py", "reads only the CSV files"], ["results and figures", "results.json, figures/"]]}
    />
  ),
  lorenz: Lorenz,
  method: () => (
    <Flow
      items={[["The question", "brief line, change"], ["Population", "first chart"], ["Sugar and Gini", "rich, equal?"], ["Compared run", "same axes"], ["All seeds", "do ranges overlap?"], ["The rule", "which setting or function"]]}
    />
  ),
};

// Draws one diagram by its id, in a soft panel.
// id: which diagram to draw.
export default function Diagram({ id }: { id: DiagramId }) {
  const Drawing = DIAGRAMS[id];
  return (
    <figure className="dot-grid my-6 rounded-card border border-line p-6" data-diagram={id}>
      <Drawing />
    </figure>
  );
}
