// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/charts/StepChart.tsx
// Purpose:    One line chart of a measure over the time steps, with one line per run. Used by the Simulate
//             page (one run, drawn up to the step being shown) and by the Experiments page (a run and the
//             run it is compared with). Every colour comes from the palette in src/index.css.

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RunStyle } from "../../lib/colours";

// One line: its label (for the legend and the tooltip), its colour and dash, and its value at each step.
export type Series = { label: string; style: RunStyle; values: number[] };

type Props = {
  title: string;
  series: Series[];
  lastStep: number;
  yMax?: number;
  format: (value: number) => string;
  height?: number;
};

// Rounds the top of the y axis up to a value that splits into four even steps (for example 0.4 or 400).
// value: the largest value shown.
function niceTop(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const multiple = [1, 1.2, 1.6, 2, 2.4, 3, 4, 6, 8, 10].find((m) => m * power >= value) ?? 10;
  return multiple * power;
}

// The legend: a short sample of each line (colour and dash) and its label. Shown for two or more lines.
// series: the lines.
function Legend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {series.map((line) => (
        <span key={line.label} className="inline-flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden>
            <line x1="1" y1="4" x2="21" y2="4" stroke={line.style.colour} strokeWidth="2" strokeDasharray={line.style.dash} />
          </svg>
          {line.label}
        </span>
      ))}
    </div>
  );
}

// The chart. title: the measure shown. series: the lines (values[i] is the value at step i).
// lastStep: the last step on the x axis, so the axis stays fixed while a line grows during playback.
// yMax: the largest value the axis must hold (worked out from the values if left out). format: turns a value into
// text for the axis and the tooltip. height: in pixels.
export default function StepChart({ title, series, lastStep, yMax, format, height = 180 }: Props) {
  const longest = Math.max(...series.map((line) => line.values.length));
  const rows = Array.from({ length: longest }, (_, step) => {
    const row: Record<string, number> = { step };
    series.forEach((line, index) => {
      if (step < line.values.length) row[`s${index}`] = line.values[step];
    });
    return row;
  });
  const top = niceTop(yMax ?? Math.max(0, ...series.flatMap((line) => line.values)));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        {series.length > 1 && <Legend series={series} />}
      </div>
      <div style={{ height }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="step"
              type="number"
              domain={[0, lastStep]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              domain={[0, top]}
              ticks={[0, top / 4, top / 2, (3 * top) / 4, top]}
              tickFormatter={format}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              isAnimationActive={false}
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              itemStyle={{ color: "var(--foreground)" }}
              labelFormatter={(step) => `Step ${step}`}
              formatter={(value, key) => [format(Number(value)), series[Number(String(key).slice(1))]?.label ?? ""]}
            />
            {series.map((line, index) => (
              <Line
                key={line.label}
                dataKey={`s${index}`}
                stroke={line.style.colour}
                strokeDasharray={line.style.dash}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
