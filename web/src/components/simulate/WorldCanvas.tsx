// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/simulate/WorldCanvas.tsx
// Purpose:    Draws the world at one step on a canvas: the sugar on every cell on a five-step scale, the
//             patches that never regrow, and the agents as dots. Clicking an agent chooses it.

import { useEffect, useRef } from "react";
import type { Frame } from "../../lib/api";
import { readWorldColours } from "../../lib/colours";
import { useTheme } from "../../lib/settings";

// Size of one cell on the canvas, in canvas pixels (the canvas is then scaled to fit the page).
const CELL = 12;

// The key under the world: the five sugar levels, an agent, and the mark of a patch that never regrows.
// No props.
export function WorldKey() {
  const swatch = "inline-block h-3.5 w-3.5 rounded-[3px] border border-line";
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
      <span className="inline-flex items-center gap-1.5">
        Sugar on a cell: none
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={swatch} style={{ backgroundColor: level ? `var(--sugar-${level})` : "var(--background)" }} />
        ))}
        most
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: "var(--agent)", borderColor: "var(--agent-edge)" }} />
        an agent
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-1 w-1" style={{ backgroundColor: "var(--no-regrow)" }} />
        a patch that never regrows
      </span>
    </div>
  );
}

type Props = {
  frame: Frame;
  width: number;
  height: number;
  noRegrow: [number, number][];
  pickedId: number | null;
  onPick: (agentId: number | null) => void;
};

// The world. frame: the step to draw. width, height: the grid size in cells. noRegrow: the cells that
// never regrow. pickedId: the agent drawn with a ring (or null). onPick: called with the clicked
// agent's id, or null when the click is not on an agent.
export default function WorldCanvas({ frame, width, height, noRegrow, pickedId, onPick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  // Draws the frame again whenever it, the chosen agent or the theme changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const colours = readWorldColours();
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const level = Number(frame.sugar[y * width + x]);
        if (level > 0) {
          context.fillStyle = colours.sugar[level];
          context.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
    }
    context.fillStyle = colours.noRegrow;
    for (const [x, y] of noRegrow) context.fillRect(x * CELL + CELL / 2 - 1.5, y * CELL + CELL / 2 - 1.5, 3, 3);
    for (const [id, x, y] of frame.agents) {
      context.beginPath();
      context.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, id === pickedId ? CELL * 0.5 : CELL * 0.36, 0, 2 * Math.PI);
      context.fillStyle = colours.agent;
      context.fill();
      context.lineWidth = id === pickedId ? 3 : 1.5;
      context.strokeStyle = id === pickedId ? colours.picked : colours.edge;
      context.stroke();
    }
  }, [frame, width, height, noRegrow, pickedId, theme]);

  // Finds the agent nearest the click, within one cell, and chooses it.
  // event: the mouse click on the canvas.
  const pick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * width - 0.5;
    const y = ((event.clientY - box.top) / box.height) * height - 0.5;
    let best: number | null = null;
    let bestDistance = 1;
    for (const [id, agentX, agentY] of frame.agents) {
      const distance = Math.hypot(agentX - x, agentY - y);
      if (distance < bestDistance) {
        best = id;
        bestDistance = distance;
      }
    }
    onPick(best);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width * CELL}
      height={height * CELL}
      onClick={pick}
      className="aspect-square w-full cursor-crosshair rounded-xl border border-line bg-page"
      role="img"
      aria-label={`The world at step ${frame.step}: ${frame.agents.length} agents on a ${width} by ${height} grid`}
      data-tour="world"
    />
  );
}
