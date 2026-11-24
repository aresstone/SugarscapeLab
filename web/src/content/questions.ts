// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/questions.ts
// Purpose:    Questions and answers about the project, in eight groups. The questions themselves are in
//             the three questions-*.ts files next to this one.

import type { FactText } from "../lib/results";
import { ADDITION_QUESTIONS, DATA_QUESTIONS, RESULT_QUESTIONS } from "./questions-data";
import { CODE_QUESTIONS, MODEL_QUESTIONS } from "./questions-model";
import { INTERFACE_QUESTIONS, RUNNING_QUESTIONS, WORLD_QUESTIONS } from "./questions-world";

// Where an answer can be checked: a file, and optionally the text of the line the viewer jumps to.
export type Source = { path: string; find?: string };

// One question: the short answer is always shown, the long one when Detail is on.
// files: where the answer can be checked (paths relative to sugarscape-lab/).
export type Question = { q: string; short: FactText; long: FactText; files: Source[] };

export const QUESTION_GROUPS: { id: string; title: string; questions: Question[] }[] = [
  { id: "model", title: "The model", questions: MODEL_QUESTIONS },
  { id: "code", title: "The code", questions: CODE_QUESTIONS },
  { id: "data", title: "The runs and the data", questions: DATA_QUESTIONS },
  { id: "results", title: "The results", questions: RESULT_QUESTIONS },
  { id: "additions", title: "Lifespan and reproduction", questions: ADDITION_QUESTIONS },
  { id: "world", title: "The real world", questions: WORLD_QUESTIONS },
  { id: "interface", title: "The interface", questions: INTERFACE_QUESTIONS },
  { id: "running", title: "Running it", questions: RUNNING_QUESTIONS },
];
