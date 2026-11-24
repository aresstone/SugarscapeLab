// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/pages/QuestionsPage.tsx
// Purpose:    The Questions and answers page: questions about the project, grouped by topic, each with a
//             short answer, a longer one when Detail is on, and where the answer can be checked.

import FileLink from "../components/FileLink";
import FadeIn from "../components/motion/FadeIn";
import PageHeading from "../components/PageHeading";
import { QUESTION_GROUPS } from "../content/questions";
import { fillText, useFacts } from "../lib/results";
import { useDetail } from "../lib/settings";

// Scrolls the page to one group of questions.
// id: the group's id.
function jumpTo(id: string) {
  document.getElementById(`group-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// The Questions page. No props.
export default function QuestionsPage() {
  const { facts } = useFacts();
  const { detail } = useDetail();
  const total = QUESTION_GROUPS.reduce((sum, group) => sum + group.questions.length, 0);

  return (
    <section>
      <PageHeading eyebrow="Questions and answers" title="Questions about the project.">
        {total} questions in {QUESTION_GROUPS.length} groups. Each has a short answer and the place where it can be checked.
        {detail ? " Detail is on, so the longer explanations are shown too." : " Turn Detail on in the settings for longer explanations."}
      </PageHeading>

      <FadeIn className="mt-8 flex flex-wrap gap-2" delay={0.05} data-tour="question-groups">
        {QUESTION_GROUPS.map((group) => (
          <button key={group.id} type="button" onClick={() => jumpTo(group.id)} className="btn-secondary !py-1.5">
            {group.title}
            <span className="text-xs text-muted">{group.questions.length}</span>
          </button>
        ))}
      </FadeIn>

      <div className="mt-10 space-y-14" data-tour="questions">
        {QUESTION_GROUPS.map((group, groupIndex) => (
          <div key={group.id} id={`group-${group.id}`} className="scroll-mt-24">
            <FadeIn>
              <h2 className="text-2xl font-semibold tracking-tight">{group.title}</h2>
            </FadeIn>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {group.questions.map((item, index) => (
                <FadeIn key={item.q} delay={(index % 2) * 0.06} className="flex">
                  <article
                    className="card flex flex-1 flex-col p-6"
                    data-tour={groupIndex === 0 && index === 0 ? "question-card" : undefined} // the card the guide points at
                  >
                    <h3 className="font-semibold tracking-tight">{item.q}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{fillText(item.short, facts)}</p>
                    {detail && <p className="mt-3 text-sm leading-relaxed text-muted">{fillText(item.long, facts)}</p>}
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                      <span className="text-xs text-muted">Where to find it:</span>
                      {item.files.map((file) => (
                        <FileLink key={file.path + (file.find ?? "")} path={file.path} find={file.find} />
                      ))}
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
