// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/pages/HowItWorksPage.tsx
// Purpose:    The How it works page: one card per rule of the model and per part of the project, each
//             with the function it lives in, and an honest list of limits.

import { CircleSlash } from "lucide-react";
import StepCards from "../components/how-it-works/StepCards";
import FadeIn from "../components/motion/FadeIn";
import PageHeading from "../components/PageHeading";
import SectionHeading from "../components/SectionHeading";
import { LIMITS } from "../content/limits";
import { fillText, useFacts } from "../lib/results";

// The How it works page. No props.
export default function HowItWorksPage() {
  const { facts } = useFacts();

  return (
    <section>
      <PageHeading eyebrow="How it works" title="The rules, one card each.">
        Every rule of the model lives in one function of sugarscape.py, and saving the data and the analysis live in the other
        two Python files. Click a function to read its code.
      </PageHeading>

      <StepCards facts={facts} />

      <SectionHeading eyebrow="Limits" title="What it does not do." />
      <FadeIn data-tour="limits">
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {LIMITS.map((limit) => (
            <li key={limit.title} className="card flex gap-3 p-5">
              <CircleSlash size={18} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <p className="text-sm font-semibold">{limit.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{fillText(limit.text, facts)}</p>
              </div>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  );
}
