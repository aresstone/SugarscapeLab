// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/Notice.tsx
// Purpose:    A plain box that tells the reader about a problem, such as a missing results file.

import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

// A notice box with a short title and an explanation.
// title: one short line. children: the explanation.
export default function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-100"
    >
      <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
