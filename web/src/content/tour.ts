// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/tour.ts
// Purpose:    The steps of the guided tour, as data. The guide can walk through every page in order, or
//             explain only the page being shown. Each step names its page, what it points at (a
//             data-tour="..." mark in the code), a short text, and a longer text that is added when
//             Detail is on.

import { GUIDE_NAME } from "../components/tour/Guide";
import type { PageId } from "../lib/navigation";

export type TourStep = {
  page?: PageId; // the page to open first (none: stay where we are)
  target?: string; // the data-tour mark to point at (none: the card sits in the middle)
  title: string;
  short: string;
  long: string;
  only?: "whole tour" | "page tour"; // played only in the whole tour, or only when one page is explained (none: both)
};

export const TOUR_STEPS: TourStep[] = [
  {
    page: "simulate",
    only: "whole tour",
    title: `Hello, I'm ${GUIDE_NAME}`,
    short: "I'll walk you through Sugarscape Lab, one page at a time. It runs the Sugarscape model in this project's Python files and shows what happens.",
    long: "Sugarscape is a grid world where simple agents look for sugar, move to it and burn it to stay alive. Use Back and Next to move, or Skip to stop at any time.",
  },
  {
    page: "simulate",
    target: "about-app",
    title: "What this app is",
    short: "The coursework is the Python files, the CSV files and the reports. This app is an extra: it runs those same Python files and adds no rules of its own.",
    long: "It starts on any computer with one command, and a hosted copy can be tried without installing anything. Every number it shows is read from the results files or computed by the model as it runs.",
  },
  {
    page: "simulate",
    target: "presets",
    title: "Load a required run",
    short: "Each button loads the settings of one run the briefs ask for, with its reference seed.",
    long: "Run a loaded run unchanged and the server also compares the result with its saved CSV files, byte for byte. Changing any field makes the settings custom.",
  },
  {
    page: "simulate",
    target: "settings-form",
    only: "page tour",
    title: "The settings",
    short: "Agents, steps, regrowth rate, vision range, patches that never regrow, lifespan, reproduction with its threshold, and the seed.",
    long: "The server checks every value and answers in plain words when one is out of range. The same settings and seed always give the same run.",
  },
  {
    page: "simulate",
    target: "run-button",
    title: "Run it on the server",
    short: "Run sends the settings to the server, which runs the model in sugarscape.py and sends back every step.",
    long: "Nothing is simulated in the browser: the page only draws what the Python model returned.",
  },
  {
    page: "simulate",
    target: "world",
    title: "The world",
    short: "Each cell is shaded by its sugar, from none to the deepest amber, and each blue dot is an agent. Click an agent to see its vision, metabolism, sugar and age.",
    long: "Small grey marks show the patches that never regrow, when the settings have any. The edges wrap round: an agent leaving one side appears on the other.",
  },
  {
    page: "simulate",
    target: "playback",
    title: "Playback",
    short: "Play and pause, one step back or forward, three speeds, and a slider over the steps.",
    long: "For the largest runs only every few steps are sent, so the answer stays small enough; a note under the slider then says so.",
  },
  {
    page: "simulate",
    target: "run-charts",
    title: "Charts that follow the playback",
    short: "Population, average sugar and the Gini coefficient, drawn up to the step shown. The counters above them say how many agents are alive, were born, starved or died of old age.",
    long: "The charts use every step's numbers, the same as the run's steps CSV. The Learn page 'Reading the charts' explains each one.",
  },
  {
    page: "simulate",
    target: "downloads",
    only: "page tour",
    title: "The same as the saved files?",
    short: "For a saved run, this says whether the fresh result is identical to the saved CSV files. The run can be downloaded in the same format.",
    long: "A table too large to send says so in a sentence and points to the saved file in the data folder instead.",
  },
  {
    target: "navigation",
    only: "whole tour",
    title: "The pages",
    short: "Simulate, Experiments, How it works, Questions and answers, Project map and Learn.",
    long: "Any page can also be explained on its own: choose 'Explain this page' in the tour menu.",
  },
  {
    page: "experiments",
    target: "run-card",
    title: "Every required run",
    short: "One card for each run of the two briefs, grouped as the briefs group them: its title, the line of the brief it answers and what it changes.",
    long: "What a run changes is written from its own settings in run_simulations.py, so it always matches the code.",
  },
  {
    page: "experiments",
    target: "run-numbers",
    title: "Its numbers",
    short: "The main numbers from results.json: the reference seed's value, and the mean, lowest and highest over all the seeds.",
    long: "When the ranges of two runs over the seeds do not overlap, the difference between them is not down to chance. Averages are shown with one decimal and Gini coefficients with three; the files hold more.",
  },
  {
    page: "experiments",
    target: "run-chart",
    title: "A chart from the saved steps",
    short: "Population, average sugar or the Gini coefficient, step by step, with the run it is compared against on the same axes.",
    long: "Each run keeps its colour and line style on every chart, so the lines can be told apart without colour.",
  },
  {
    page: "experiments",
    target: "rerun",
    title: "Run it again",
    short: "Runs the saved run afresh on the server and says whether the result is identical to the saved files.",
    long: "Then 'Watch the playback' opens the fresh run on the Simulate page.",
  },
  {
    page: "experiments",
    target: "run-files",
    only: "page tour",
    title: "Its files",
    short: "Open the run's CSV files and its entry in run_simulations.py in the read-only viewer.",
    long: "The viewer jumps to the run's line in run_simulations.py and highlights it. A CSV file shows its first rows.",
  },
  {
    page: "experiments",
    target: "figures",
    only: "page tour",
    title: "The figures",
    short: "Every figure drawn by analyse_results.py, opened as a picture.",
    long: "They are drawn from the same CSV files as the charts on this page.",
  },
  {
    page: "how-it-works",
    target: "steps",
    title: "The rules, one card each",
    short: "Each card names a rule of the model, says it in one sentence and links to the function it lives in.",
    long: "With Detail on, each card also explains its rule in more depth, with the settings it uses.",
  },
  {
    page: "how-it-works",
    target: "limits",
    title: "What it does not do",
    short: "An honest list of what the model and the app leave out.",
    long: "These limits matter when the results are compared with the real world.",
  },
  {
    page: "questions",
    target: "question-groups",
    title: "Questions and answers",
    short: "Questions a reader of the project could have, in groups, each with a short answer and a link to where it can be checked.",
    long: "With Detail on, every answer has a longer explanation too. Answers that quote a number read it from results.json.",
  },
  {
    page: "questions",
    target: "question-card",
    only: "page tour",
    title: "One question",
    short: "The short answer, then the place in the code or the data where it can be checked.",
    long: "A link to code opens the file at the line it names.",
  },
  {
    page: "project-map",
    target: "project-map",
    title: "Where everything lives",
    short: "Every folder and file of the project, with one line about each. Click a file to read it, or a figure to see it.",
    long: "Code files describe themselves in the Purpose line at their top. On the computer running the app, the arrow beside a folder opens it in the file manager.",
  },
  {
    page: "project-map",
    target: "map-folder",
    only: "page tour",
    title: "A coursework folder",
    short: "assignment/ holds the Assignment: its three Python files and the data, results and figures they write. project/ is laid out the same way.",
    long: "app/, web/ and tests/test_server.py belong to the interface and are part of neither piece of coursework.",
  },
  {
    page: "project-map",
    target: "map-file",
    only: "page tour",
    title: "A file",
    short: "Click a file to open it in the read-only viewer.",
    long: "A CSV file shows only its first rows, since an agents file has a row for every agent at every step.",
  },
  {
    page: "project-map",
    target: "settings",
    only: "whole tour",
    title: "Settings",
    short: "Detail adds the longer explanations everywhere. The theme can be light or dark.",
    long: "Both are remembered in this browser for the next visit.",
  },
  {
    page: "learn",
    target: "learn-topics",
    title: "Learn",
    short: "Short pages for a reader new to the subject, from what an agent-based model is to a walk through the code and a glossary.",
    long: "Each page ends with a 'Say it in one sentence' line.",
  },
  {
    page: "learn",
    target: "learn-page",
    only: "page tour",
    title: "One idea per page",
    short: "Each page explains one idea in plain words, with a drawing where it helps. Previous and Next move through the pages in order.",
    long: "The page on the code explains the main functions of sugarscape.py line by line.",
  },
  {
    page: "learn",
    target: "learn-sentence",
    only: "page tour",
    title: "Say it in one sentence",
    short: "Every page ends with its main point in one sentence.",
    long: "If only one thing from a page is kept, it should be this line.",
  },
  {
    title: "That's the tour",
    only: "whole tour",
    short: "The button at the top starts the tour again, or explains only the page you are on.",
    long: "To go deeper, open the Learn pages, or turn Detail on in the settings for every longer explanation.",
  },
];

// Picks the steps to play.
// onlyPage: the page to explain on its own, or null for the whole tour.
export function tourSteps(onlyPage: PageId | null): TourStep[] {
  return TOUR_STEPS.filter((step) => {
    if (onlyPage) return step.page === onlyPage && step.only !== "whole tour";
    return step.only !== "page tour";
  });
}
