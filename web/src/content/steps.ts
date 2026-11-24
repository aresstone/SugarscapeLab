// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/steps.ts
// Purpose:    The step cards on the How it works page: the name of the rule, one plain sentence, the file
//             and function it lives in, and a longer explanation shown when Detail is on.

import { count, courseworkOf, numbersOf, type FactText } from "../lib/results";

// One step card. rule: the name of the rule. file and find: where it lives (find is the line the viewer
// jumps to, such as the function's first line). label: the link's text, when the function's name alone
// would not say it. long: shown when Detail is on.
export type Step = { title: string; rule: string; file: string; find: string; label?: string; short: string; long: FactText };

const MODEL = "assignment/sugarscape.py";

export const STEPS: Step[] = [
  {
    title: "The world and its sugar",
    rule: "Two sugar hills",
    file: MODEL,
    find: "def capacity_at",
    short: "A square grid whose edges wrap round. Each cell can hold some sugar, most on two hills, and starts full.",
    long: (f) =>
      `The grid is ${f.defaults.width} cells wide and ${f.defaults.height} high; an agent leaving one edge comes back on the ` +
      "opposite one. Each cell's capacity, from 0 to 4, depends on its straight-line distance to the nearer of two peaks " +
      "(the list PEAKS at the top of the file): the closer, the more sugar. At step 0 every cell holds as much sugar as " +
      `its capacity allows; ${count(f.limits.sugary_cells)} cells can hold any sugar at all.`,
  },
  {
    title: "An agent",
    rule: "class Agent",
    file: MODEL,
    find: "class Agent",
    short: "Each agent has a place on the grid, some sugar, a vision, a metabolism, an age and the starting agent it descends from.",
    long: (f) =>
      "The Agent class only stores values; every rule lives in the Sugarscape class. Starting agents get random values " +
      `in fixed ranges: sugar from ${f.defaults.initial_sugar_min} to ${f.defaults.initial_sugar_max}, metabolism from ` +
      `${f.defaults.metabolism_min} to ${f.defaults.metabolism_max} and vision from ${f.defaults.vision_min} to ` +
      `${f.defaults.vision_max}. They are drawn in a fixed order, so the same seed gives the same agents in every scenario.`,
  },
  {
    title: "Looking and choosing",
    rule: "Look and choose",
    file: MODEL,
    find: "def choose_cell",
    short: "An agent looks along its row and column as far as its vision and picks the empty cell with the most sugar.",
    long:
      "cells_in_view lists the agent's own cell and every empty cell up to its vision in the four directions, up, down, left " +
      "and right, wrapping at the edges; occupied cells are skipped but do not block the view. choose_cell keeps the cell " +
      "with the most sugar. If several hold the same amount, the nearest wins; if they are also equally near, one is " +
      "picked at random with the run's own random number generator.",
  },
  {
    title: "Moving and eating",
    rule: "Move and eat",
    file: MODEL,
    find: "def move_agent",
    short: "The agent moves to the chosen cell and eats all the sugar on it, which drops to 0.",
    long:
      "move_agent calls choose_cell, frees the old cell, takes the new one and adds all of that cell's sugar to the agent. " +
      "In the same function the agent then burns its metabolism and grows one step older. The sugar collected by every " +
      "agent in a step is added up for the sugar_collected column.",
  },
  {
    title: "Burning sugar and dying",
    rule: "Metabolism and starvation",
    file: MODEL,
    find: "def check_death",
    short: "Every step an agent burns as much sugar as its metabolism. One with no sugar left dies and is removed.",
    long:
      "Burning happens in move_agent: the agent's sugar becomes its old sugar plus what it ate, minus its metabolism. " +
      "check_death then removes an agent whose sugar is 0 or less, frees its cell and counts it as starved. Its sugar is " +
      "lost. Starvation applies in every run.",
  },
  {
    title: "Sugar growing back",
    rule: "Regrowth",
    file: MODEL,
    find: "def regrow",
    short: "At the start of every step each cell gains sugar at the regrowth rate, never above its capacity.",
    long: (f) =>
      `The rate is ${f.defaults.regrowth_rate} by default. A patch marked as never regrowing (the no_regrow_patches setting) ` +
      "keeps whatever is left on it, so once eaten it stays empty. These patches are chosen at random among the cells that " +
      "hold sugar, after the agents are made.",
  },
  {
    title: "Saving the data",
    rule: "CSV files",
    file: "assignment/run_simulations.py",
    find: "def rows_to_csv_text",
    short: "run_simulations.py runs each simulation and writes its agents and its per-step numbers as CSV files.",
    long: (f) =>
      `Every run is repeated with ${courseworkOf(f, "assignment").repeat_seeds.length} seeds. For the first, the reference seed, ` +
      "it writes <run>_agents.csv (every living agent at every step) and <run>_steps.csv (one row of totals and averages " +
      "per step). For all seeds it writes one summary row in repeats.csv. Numbers are written the same way every time, so " +
      "the same settings and seed always give the same text.",
  },
  {
    title: "The scenarios",
    rule: "Settings, not new rules",
    file: "assignment/run_simulations.py",
    find: "RUNS = [",
    label: "run_simulations.py: RUNS",
    short: "Each scenario is a run of the same model with a few settings changed: regrowth, patches that never regrow, or vision.",
    long:
      "The list RUNS names every run, the line of the brief it answers, the run it is compared with and the settings that " +
      "differ from the defaults. The model file itself has no scenario code: Sugarscape(**settings) builds a world from " +
      "whatever settings it is given.",
  },
  {
    title: "Lifespan",
    rule: "Death of old age",
    file: MODEL,
    find: 'elif self.settings["lifespan"]',
    label: "sugarscape.py: check_death, old age",
    short: "With lifespan on, an agent also dies when its age reaches its maximum age.",
    long: (f) =>
      `Each agent's maximum age is drawn from ${f.defaults.max_age_min} to ${f.defaults.max_age_max} when it is made, even ` +
      "when lifespan is off, so switching it on does not change the other random draws. If an agent starves and reaches " +
      "its maximum age on the same turn, it counts as starved.",
  },
  {
    title: "Reproduction",
    rule: "A child on a free neighbour",
    file: MODEL,
    find: "def reproduce",
    short: "With reproduction on, a living agent with enough sugar and an empty neighbouring cell places a child there.",
    long: (f) =>
      `The threshold is ${f.defaults.reproduction_threshold} sugar by default. The child gets half the parent's sugar, rounded ` +
      "down, and the parent keeps the rest, so no sugar is made or lost. The child copies the parent's vision, metabolism " +
      "and founder, starts at age 0 with its own maximum age, and does not act until the next step.",
  },
  {
    title: "The analysis",
    rule: "From CSV to results",
    file: "assignment/analyse_results.py",
    find: "def build_results",
    short: "analyse_results.py reads only the CSV files and writes results.json, a comparison table and the figures.",
    long: (f) => {
      const base = numbersOf(f, "assignment", "01_base_100");
      return (
        "It runs no simulation of its own (it only rebuilds the world at step 0 to draw the maps). For each run it takes " +
        "the reference seed's numbers, the average of the last 50 steps, and the mean, lowest and highest over all seeds. " +
        `For example, the base run of the Assignment ends with ${count(base.final_population)} agents with its reference seed.`
      );
    },
  },
];
