// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/pages/LearnPage.tsx
// Purpose:    The Learn page: short study pages, chosen from a list,
//             each with short paragraphs, a diagram where it helps (and, on the code page, a walk through
//             the main functions) and a "say it in one sentence" line.

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CodeWalk from "../components/learn/CodeWalk";
import Diagram from "../components/learn/Diagrams";
import FadeIn from "../components/motion/FadeIn";
import PageHeading from "../components/PageHeading";
import { GLOSSARY } from "../content/glossary";
import { LEARN_TOPICS } from "../content/learn";
import { fillText, useFacts } from "../lib/results";

// The Learn page. No props.
export default function LearnPage() {
  const [index, setIndex] = useState(0);
  const { facts } = useFacts();
  const topic = LEARN_TOPICS[index];

  // Opens another study page and scrolls back to its top.
  // next: the position of the page in the list.
  const open = (next: number) => {
    setIndex(next);
    document.getElementById("learn-topic")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section>
      <PageHeading eyebrow="Learn" title="The ideas behind Sugarscape.">
        {LEARN_TOPICS.length} short pages for a reader new to the subject. Read them in order, or pick one.
      </PageHeading>

      <div className="mt-10 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav className="h-fit lg:sticky lg:top-24" data-tour="learn-topics" aria-label="Study pages">
          <ol className="card space-y-1 p-2">
            {LEARN_TOPICS.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => open(i)}
                  aria-current={i === index ? "page" : undefined}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    i === index ? "bg-soft font-medium" : "text-muted hover:bg-soft hover:text-ink"
                  }`}
                >
                  <span className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${i === index ? "bg-ai text-[var(--on-colour)]" : "bg-soft"}`}>
                    {i + 1}
                  </span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <FadeIn key={topic.id}>
          <article id="learn-topic" className="card scroll-mt-24 p-6 sm:p-8" data-tour="learn-page">
            <p className="text-ai inline-block text-sm font-semibold">
              {index + 1} of {LEARN_TOPICS.length}
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{topic.title}</h2>

            <div className="mt-5 max-w-2xl space-y-4 leading-relaxed text-muted">
              {topic.paragraphs.map((paragraph, i) => (
                <p key={i}>{fillText(paragraph, facts)}</p>
              ))}
            </div>
            {topic.diagrams?.map((id) => <Diagram key={id} id={id} />)}
            {topic.walkthrough?.map((walk) => <CodeWalk key={walk.name} walk={walk} />)}

            {topic.glossary && (
              <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {GLOSSARY.map((entry) => (
                  <div key={entry.term} className="border-b border-line pb-3">
                    <dt className="text-sm font-semibold">{entry.term}</dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-muted">{entry.meaning}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div
              className="ai-glow ai-glow-soft mt-8 rounded-2xl bg-card p-5"
              style={{ ["--glow-radius" as string]: "1rem" }}
              data-tour="learn-sentence"
            >
              <p className="text-ai inline-block text-xs font-semibold uppercase tracking-wide">Say it in one sentence</p>
              <p className="mt-1 font-medium leading-relaxed">{topic.oneSentence}</p>
            </div>

            <div className="mt-8 flex justify-between gap-3">
              <button type="button" className="btn-secondary" disabled={index === 0} onClick={() => open(index - 1)}>
                <ArrowLeft size={16} /> Previous
              </button>
              <button type="button" className="btn-primary" disabled={index === LEARN_TOPICS.length - 1} onClick={() => open(index + 1)}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </article>
        </FadeIn>
      </div>
    </section>
  );
}
