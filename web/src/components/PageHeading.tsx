// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/PageHeading.tsx
// Purpose:    The heading at the top of each page: a small coloured line, a large title and a short text.

import type { ReactNode } from "react";
import FadeIn from "./motion/FadeIn";

type Props = { eyebrow: string; title: string; children?: ReactNode };

// The page heading, which fades in when the page opens.
// eyebrow: the small line above the title. title: the large title. children: the text under it.
export default function PageHeading({ eyebrow, title, children }: Props) {
  return (
    <FadeIn className="max-w-3xl pt-12">
      <p className="text-ai inline-block text-sm font-semibold">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">{title}</h1>
      {children && <div className="mt-5 text-lg leading-relaxed text-muted">{children}</div>}
    </FadeIn>
  );
}
