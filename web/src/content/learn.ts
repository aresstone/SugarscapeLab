// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/learn.ts
// Purpose:    The Learn pages, written for a reader with no background. Pages 1 to 5 are here (the code walk
//             of page 5 is in learn-code.ts); pages 6 to 10 are in learn-results.ts, the glossary terms in glossary.ts.

import { count, fraction, numbersOf, percent, runOf, type FactText } from "../lib/results";
import { CODE_WALKS, type CodeWalk } from "./learn-code";
import { RESULTS_TOPICS } from "./learn-results";

export type DiagramId = "abm" | "landscape" | "turn" | "emergence" | "files" | "lorenz" | "method";

// One study page: short paragraphs, optional diagrams, an optional walk through code, and a
// "say it in one sentence" line. glossary: true for the glossary page, whose terms come from glossary.ts.
export type LearnTopic = {
  id: string;
  title: string;
  paragraphs: FactText[];
  diagrams?: DiagramId[];
  walkthrough?: CodeWalk[];
  oneSentence: string;
  glossary?: boolean;
};

const BASICS: LearnTopic[] = [
  {
    id: "abm",
    title: "What an agent-based model is",
    paragraphs: [
      "An agent-based model is a computer program made of many small actors, called agents. Each agent follows a few simple rules about what it can see around it. No rule describes the group as a whole.",
      "The computer applies the rules to every agent, one step at a time. Afterwards the modeller looks at the whole population: how many survive, where they gather, how rich or poor they become.",
      "This is different from a single equation for an average. Every agent here is an individual with its own position, sugar, vision and metabolism, so differences between individuals, and plain luck, can change what the group does.",
      "Models like this are used to study traffic jams, the spread of a disease, markets and animal populations. In this project the agents are simple creatures on a grid, and their whole world is sugar.",
    ],
    diagrams: ["abm"],
    oneSentence: "An agent-based model gives many simple actors their own rules, runs them step by step, and watches what the whole group does.",
  },
  {
    id: "world",
    title: "The Sugarscape world",
    paragraphs: [
      (f) =>
        `The world is a grid of ${f.defaults.width} by ${f.defaults.height} cells. Its edges wrap round: an agent walking off the right edge comes back on the left, and the same for top and bottom, so the world has no walls.`,
      "Each cell can hold some sugar, up to its capacity, from 0 to 4. The capacity is highest on two hills and falls away with the distance from their peaks, so the grid has two rich regions and wide empty ground. At the start every cell is full.",
      (f) =>
        `Each step, every cell grows back ${f.defaults.regrowth_rate} sugar by default, never above its capacity. An agent that eats a cell empties it, and the cell then refills slowly.`,
      (f) =>
        `At most one agent stands on a cell. By default ${f.defaults.num_agents} agents start on random cells, each with ${f.defaults.initial_sugar_min} ` +
        `to ${f.defaults.initial_sugar_max} sugar, a vision of ${f.defaults.vision_min} to ${f.defaults.vision_max} cells and a metabolism of ` +
        `${f.defaults.metabolism_min} to ${f.defaults.metabolism_max} sugar per step. On the Simulate page the deepest amber cells hold the most sugar and the blue dots are agents.`,
    ],
    diagrams: ["landscape"],
    oneSentence: "Sugarscape is a wrapping grid with two hills of sugar that grows back, on which agents live one to a cell.",
  },
  {
    id: "turn",
    title: "One agent's turn, step by step",
    paragraphs: [
      "The drawing below shows a made-up example: an agent in the middle with a vision of 2, a metabolism of 2 and 5 sugar. The number on each cell is the sugar on it; the cell with a grey dot is taken by another agent.",
      "1. Look. The agent sees its own cell and up to 2 cells up, down, left and right. The taken cell does not count as a choice, but the agent can see past it. Diagonal cells are never seen.",
      "2. Choose. Two cells hold the most sugar, 3. One is 1 cell away and the other 2 cells away, so the nearer one wins. Had they been equally near, one would have been picked at random.",
      "3. Move and eat. The agent moves there and eats all 3 sugar; the cell drops to 0 and will grow back over the next steps.",
      "4. Burn. Its sugar becomes 5 + 3 − 2 = 6, and it is one step older.",
      "5. Die or not. It still has sugar, so it lives. With 0 or less it would have starved and been removed. With lifespan on, it would also die on reaching its maximum age.",
      "6. Reproduce or not. With reproduction on and enough sugar, it would place a child on an empty neighbouring cell. With 6 sugar it is far below the threshold.",
    ],
    diagrams: ["turn"],
    oneSentence: "On its turn an agent looks along its row and column, moves to the richest free cell in sight, eats it all, burns its metabolism and dies if it has nothing left.",
  },
  {
    id: "emergence",
    title: "Emergence: patterns nobody programmed",
    paragraphs: [
      "Emergence is when many agents following simple rules produce a pattern of the whole group that no rule describes. Nothing in sugarscape.py says \"crowd on the hills\" or \"make some agents rich\", yet both happen.",
      (f) => {
        const run = numbersOf(f, "assignment", "02_base_500");
        return (
          `Crowding: in "${runOf(f, "assignment", "02_base_500").title}" the agents start anywhere, but over the last 50 steps ` +
          `${percent(run.last50_share_on_rich_cells as number)} of them stand on rich cells. Each one only moves to the best cell it can see; together they fill the hills.`
        );
      },
      (f) => {
        const run = numbersOf(f, "assignment", "02_base_500");
        return (
          `A stable population: the same run falls from ${count(run.start_population as number)} agents to about ` +
          `${count(run.last50_population)} and then holds steady. No rule fixes that number: it is how many the hills can feed.`
        );
      },
      (f) =>
        `Inequality: every agent follows the same rule, yet the Gini coefficient of their sugar is ${fraction(numbersOf(f, "assignment", "02_base_500").last50_gini)} ` +
        "over the last 50 steps. Luck in where an agent starts, and how far it sees and how much it burns, is enough.",
      "Selection: with reproduction on, agents that burn little sugar have more children, and those children burn little too. Over time the population is made almost only of them. No rule asks for this.",
    ],
    diagrams: ["emergence"],
    oneSentence: "Emergence is a pattern of the whole group, such as crowding or inequality, that comes from simple rules no one wrote it into.",
  },
  {
    id: "code",
    title: "A walk through the code",
    paragraphs: [
      "Each coursework folder holds three Python files. sugarscape.py is the model: the world, the agents and every rule. run_simulations.py builds a world for each run, calls its step() again and again, and writes what happened into CSV files. analyse_results.py reads only those CSV files and writes results.json, a comparison table and the figures.",
      "Inside sugarscape.py, each rule is one function of the Sugarscape class. One call to step() lets sugar grow back with regrow(), then gives every agent a turn: move_agent() (which calls choose_cell()), then check_death(), then reproduce().",
      "Below, the five main functions are explained line by line. Each line of code is copied exactly from sugarscape.py; the plain words beside it say what it does. A name followed by brackets, such as choose_cell(agent), runs that function. self is the world the function belongs to.",
    ],
    diagrams: ["files"],
    walkthrough: CODE_WALKS,
    oneSentence: "sugarscape.py holds the rules, run_simulations.py runs them and saves the CSV files, and analyse_results.py turns those files into numbers and figures.",
  },
];

export const LEARN_TOPICS: LearnTopic[] = [...BASICS, ...RESULTS_TOPICS];
