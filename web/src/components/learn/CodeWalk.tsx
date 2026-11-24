// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/learn/CodeWalk.tsx
// Purpose:    The line-by-line walk through one function of sugarscape.py: each line of code beside what
//             it does in plain words, and a link that opens the function in the viewer.

import type { CodeWalk as Walk } from "../../content/learn-code";
import FileLink from "../FileLink";

// One function, line by line. walk: the function's name, its job and its lines.
export default function CodeWalk({ walk }: { walk: Walk }) {
  return (
    <section className="mt-8" data-walk={walk.name}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-lg font-semibold">{walk.name}</h3>
        <FileLink path="assignment/sugarscape.py" find={`def ${walk.name}(`} label={`sugarscape.py: ${walk.name}`} />
      </div>
      <p className="mt-1 text-sm text-muted">{walk.job}</p>
      <ol className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {walk.lines.map(([code, meaning], i) => (
          <li key={i} className="grid gap-x-4 gap-y-1 px-3 py-2 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <code className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-ink" data-code={code}>
              {code}
            </code>
            <span className="text-sm leading-relaxed text-muted">{meaning}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
