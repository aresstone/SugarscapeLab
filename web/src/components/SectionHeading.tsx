// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/SectionHeading.tsx
// Purpose:    The heading of a section within a page: a small coloured line, a title and a short text.

import type { ReactNode } from "react";
import FadeIn from "./motion/FadeIn";

type Props = { eyebrow: string; title: string; children?: ReactNode };

// A section heading that fades in when it scrolls into view.
// eyebrow: the small line above the title. title: the section title. children: the text under it.
export default function SectionHeading({ eyebrow, title, children }: Props) {
  return (
    <FadeIn className="mt-24 max-w-3xl">
      <p className="text-ai inline-block text-sm font-semibold">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2>
      {children && <div className="mt-3 leading-relaxed text-muted">{children}</div>}
    </FadeIn>
  );
}
