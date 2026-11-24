// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/learn-results.ts
// Purpose:    Learn pages 6 to 10: reading the charts, the scenarios and the additions, the real world,
//             how to read a run, and the glossary page. Numbers and settings are read at run time.

import type { CourseworkId } from "../lib/api";
import { fraction, numbersOf, runOf, type Facts } from "../lib/results";
import type { LearnTopic } from "./learn";

// Names a run and says what it changes, from its settings: for example "Slow regrowth (0.25): regrowth_rate 0.25".
// f: the facts. coursework: the coursework. name: the run's name.
function changes(f: Facts, coursework: CourseworkId, name: string): string {
  const run = runOf(f, coursework, name);
  const settings = Object.entries(run.settings)
    .filter(([key]) => key !== "num_agents")
    .map(([key, value]) => `${key} ${value === true ? "on" : value}`)
    .join(", ");
  return `"${run.title}" (${settings})`;
}

export const RESULTS_TOPICS: LearnTopic[] = [
  {
    id: "charts",
    title: "Reading the charts",
    paragraphs: [
      "Population is the number of living agents at each step. It falls when agents starve or die of old age faster than children are born, rises when births win, and a flat line means the two balance or nobody dies at all.",
      "Average sugar is the sugar held by the living agents divided by their number. A rising line means the survivors are piling up sugar; a falling one that they burn more than they find. When the population reaches 0, the line stops, because there is nobody to average.",
      "The Gini coefficient measures how unevenly the sugar is shared, from 0 (everyone holds the same) towards 1 (one agent holds almost all). It says nothing about how much sugar there is in total: a group of poor agents can be very equal.",
      "The Lorenz curve draws the same idea as a line. Put the agents in order from poorest to richest; then, for each share of the agents along the bottom, plot the share of all the sugar they hold together. If everyone held the same, the curve would be the straight diagonal. The further it sags below the diagonal, the more unequal the sugar; the Gini coefficient is the gap between the diagonal and the curve, as a share of the whole triangle under the diagonal.",
      "Every chart in this app draws one colour per run, the same on every chart, and also gives each run its own line style, so the runs can be told apart without colour.",
    ],
    diagrams: ["lorenz"],
    oneSentence: "Population shows how many survive, average sugar how rich they are, and the Gini coefficient and the Lorenz curve how evenly the sugar is shared.",
  },
  {
    id: "scenarios",
    title: "The scenarios and the additions",
    paragraphs: [
      (f) =>
        `Every scenario is the same model with one setting changed, compared with "${runOf(f, "assignment", "02_base_500").title}". ` +
        "Any difference from that run comes from the one change, which is the point of the comparison.",
      (f) =>
        `Scenario 1 changes how fast sugar grows back: ${changes(f, "assignment", "03_scenario1_regrowth_slow")} and ` +
        `${changes(f, "assignment", "04_scenario1_regrowth_fast")}. It asks how much the amount of food renewed each step limits the population and its wealth.`,
      (f) =>
        `Scenario 2 makes part of the land useless once it is eaten: ${changes(f, "assignment", "05_scenario2_no_regrow_patches")}. ` +
        "It is like soil that is exhausted, or a resource that is used up for good.",
      (f) =>
        `Scenario 3 changes how far agents see: ${changes(f, "assignment", "06_scenario3_vision_short")} and ` +
        `${changes(f, "assignment", "07_scenario3_vision_long")}. It asks how much information is worth when food is patchy.`,
      (f) =>
        `The additions add a rule instead of changing a setting, and are compared with "${runOf(f, "assignment", "01_base_100").title}": ` +
        `${changes(f, "assignment", "08_modification_lifespan")} adds death of old age, ${changes(f, "assignment", "09_modification_reproduction")} ` +
        `adds births, and ${changes(f, "assignment", "10_modification_lifespan_reproduction")} has both, so the population can renew itself.`,
      (f) =>
        `The Project runs a base run, then ${changes(f, "project", "02_reproduction_death")}, then ` +
        `${changes(f, "project", "03_reproduction_death_scarce")}, to compare a renewing population with plenty and with scarce sugar.`,
    ],
    oneSentence: "Each scenario changes one setting of the same model, and each addition adds one rule, so any difference from the original run comes from that change.",
  },
  {
    id: "real-world",
    title: "The real world",
    paragraphs: [
      "The model can show how a pattern can arise. Wealth becomes unequal even when everyone follows the same rule. A place feeds only as many as its food renews. Being born near the resources matters. Traits that waste less are passed on more often.",
      (f) =>
        `It can compare those mechanisms under controlled changes. For example, the Gini coefficient of the Project's last 50 steps is ` +
        `${fraction(numbersOf(f, "project", "01_base_100").last50_gini)} in its base run and ` +
        `${fraction(numbersOf(f, "project", "02_reproduction_death").last50_gini)} with reproduction and death: splitting wealth between generations evens it out.`,
      "It cannot predict anything about a real society or ecosystem. Its agents do not work, trade, save, cooperate, form families or make plans; there are no prices, laws or institutions; the landscape and every setting are invented; and its numbers have no real units.",
      "So it is best used to test an idea of the form \"if only this were true, would that follow?\", not to say what will happen in a real city or economy.",
    ],
    oneSentence: "The model shows how simple mechanisms can produce crowding, limits and inequality, but it cannot forecast any real place.",
  },
  {
    id: "method",
    title: "How to read a run",
    paragraphs: [
      "A method, step by step, to apply to any run on the Experiments page or the Simulate page.",
      "1. Start from the question. Read the line of the brief the run answers, what it changes from the original, and which run it is compared with.",
      "2. Look at the population chart first. Does it fall, rise, level off, swing or end? Note the step where it changes.",
      "3. Then look at average sugar and the Gini coefficient: are the agents richer or poorer than in the compared run, and is the sugar shared more or less evenly?",
      "4. Compare on the same axes. The Experiments chart draws the compared run as well; look for where the two lines part and whether they stay apart.",
      "5. Decide whether a difference is real. The numbers table gives the mean, lowest and highest over all the seeds. If the two runs' ranges do not overlap, the change explains the difference; if they overlap, the difference may be chance and should be called uncertain.",
      "6. Choose the number that fits the statement. The average of the last 50 steps describes where a run settles; the final value describes the last step; totals describe births and deaths over the whole run; the step at which the population reached 0 describes an ending.",
      "7. Link the difference to a rule. Name the setting or the function that caused it (the How it works page links each one), and say what the model leaves out.",
    ],
    diagrams: ["method"],
    oneSentence: "Read a run by asking what it changes, looking at population and then sugar and inequality, comparing with its original across all seeds, and quoting the numbers that show it.",
  },
  {
    id: "glossary",
    title: "Glossary",
    paragraphs: ["The words used in this project, each in a sentence or two."],
    oneSentence: "Each term here names one part of the model or of the way its results are read.",
    glossary: true,
  },
];
