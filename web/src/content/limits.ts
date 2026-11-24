// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/limits.ts
// Purpose:    The honest list of limits on the How it works page. Points that quote a number are
//             small functions of the results, so the numbers always match results.json.

import { average, courseworkOf, numbersOf, runOf, type FactText } from "../lib/results";

export type Limit = { title: string; text: FactText };

export const LIMITS: Limit[] = [
  {
    title: "A model, not a forecast",
    text: "The rules are deliberately simple. The runs show what these rules produce on this landscape, not what a real population or economy would do.",
  },
  {
    title: "Agents do not plan or remember",
    text: "An agent sees only along its row and column, keeps no memory of where sugar was, and never plans ahead or cooperates. Each choice is greedy: the most sugar in sight now.",
  },
  {
    title: "One resource, and no trade",
    text: "There is only sugar. The original Sugarscape also has a second resource, spice, which makes trade worth while; neither spice nor trade is built here, so prices and exchange cannot be studied.",
  },
  {
    title: "Wealth has no ceiling",
    text: (f) =>
      "An agent keeps every unit it does not burn, and nothing caps it, so in the base runs the average sugar keeps rising to the " +
      `last step (the Assignment's run "${runOf(f, "assignment", "01_base_100").title}" averages ` +
      `${average(numbersOf(f, "assignment", "01_base_100").last50_mean_sugar)} sugar per agent over its last 50 steps). ` +
      "Real wealth also decays, is spent, taxed or inherited.",
  },
  {
    title: "Reproduction is simpler than the book's",
    text: "A child needs only one parent with enough sugar and an empty neighbouring cell. There are no partners, no age at which agents become fertile, and no inheritance when a parent dies: its sugar is lost.",
  },
  {
    title: "One landscape, short runs",
    text: (f) =>
      "Every run uses the same two hills and the same grid. The Assignment's runs stop at step " +
      `${courseworkOf(f, "assignment").runs[0].steps} and the Project's at step ${courseworkOf(f, "project").runs[0].steps}, ` +
      "so slower changes beyond that are not seen.",
  },
  {
    title: "Full detail for one seed only",
    text: (f) =>
      `Each run was repeated with ${courseworkOf(f, "assignment").repeat_seeds.length} seeds, but only the reference seed's agents and ` +
      "steps are saved in full. The other seeds give summary numbers in repeats.csv, which show how much a result varies, not why.",
  },
  {
    title: "The interface shows the same runs, sometimes thinned",
    text: "The web app adds no rules: it runs the same Python files. For the largest runs it plays back only every few steps so the answer fits in one response; the charts and counters still use every step.",
  },
];
