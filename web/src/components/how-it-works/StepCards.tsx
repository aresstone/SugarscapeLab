// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/how-it-works/StepCards.tsx
// Purpose:    The step cards: number, the rule's name, title, one plain sentence (plus the longer
//             explanation when Detail is on) and the function the step lives in.

import { STEPS } from "../../content/steps";
import { fillText, type Facts } from "../../lib/results";
import { useDetail } from "../../lib/settings";
import FileLink from "../FileLink";
import FadeIn from "../motion/FadeIn";

// The grid of step cards. The last card, the analysis, gets the gradient ring.
// facts: the results, used by the longer texts that quote numbers (null if not available).
export default function StepCards({ facts }: { facts: Facts | null }) {
  const { detail } = useDetail();
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-tour="steps">
      {STEPS.map((step, index) => (
        <FadeIn key={step.title} delay={index * 0.06} className="flex">
          <article className={`card flex flex-1 flex-col p-6 ${index === STEPS.length - 1 ? "ai-glow ai-glow-soft" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="bg-ai flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--on-brand)] shadow-soft">
                {index + 1}
              </span>
              <span className="rounded-2xl bg-soft px-3 py-1 text-left text-xs font-medium">{step.rule}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.short}</p>
            {detail && <p className="mt-3 text-sm leading-relaxed text-muted">{fillText(step.long, facts)}</p>}
            <div className="mt-auto pt-5">
              <FileLink path={step.file} find={step.find} label={step.label ?? `${step.file.split("/").pop()}: ${step.find.replace(/^(def|class) /, "")}`} />
            </div>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}
