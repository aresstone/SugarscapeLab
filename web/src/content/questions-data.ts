// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/questions-data.ts
// Purpose:    Questions about the runs and the data, the results, and lifespan and reproduction, each with
//             a short answer, a longer one (shown when Detail is on) and where the answer can be checked.
//             Every number is read from results.json.

import { average, count, courseworkOf, fraction, numbersOf, percent, runOf, type Facts } from "../lib/results";
import type { Question } from "./questions";

const MODEL = "assignment/sugarscape.py";

// The numbers and the title of one Assignment run. f: the facts. run: the run's name.
const assignment = (f: Facts, run: string) => numbersOf(f, "assignment", run);
const title = (f: Facts, run: string) => runOf(f, "assignment", run).title;

// "lowest to highest" over the seeds of one Assignment run, for one column of repeats.csv.
// f: the facts. run: the run's name. column: the column, such as "population_last50".
function seedRange(f: Facts, run: string, column: string): string {
  const range = assignment(f, run).across_seeds[column];
  return `${average(range.lowest)} to ${average(range.highest)}`;
}

export const DATA_QUESTIONS: Question[] = [
  {
    q: "What does each CSV file hold?",
    short: "For each run, <run>_agents.csv has one row per living agent per step, and <run>_steps.csv one row of totals and averages per step. repeats.csv has one summary row per run and seed.",
    long: "Agent columns: step, agent_id, x and y, sugar, vision, metabolism, age and founder_id. Step columns include the population, the births and both kinds of death during the step, mean and median sugar, the Gini coefficient, the sugar left on the grid and collected, mean vision and metabolism, the share of agents on rich cells and the number of founders still alive. README.txt in each data folder lists every column.",
    files: [
      { path: "assignment/data/README.txt" },
      { path: "assignment/run_simulations.py", find: "def readme_text" },
    ],
  },
  {
    q: "Why is every run repeated with several seeds?",
    short: (f) =>
      `One seed is one possible history. Each run is repeated with ${courseworkOf(f, "assignment").repeat_seeds.length} seeds to show how ` +
      "much a result depends on chance; the first, the reference seed, is saved in full.",
    long: (f) => {
      const base = assignment(f, "02_base_500").across_seeds.population_last50;
      const slow = assignment(f, "03_scenario1_regrowth_slow").across_seeds.population_last50;
      const apart = slow.highest < base.lowest || base.highest < slow.lowest;
      return (
        `For example, over its last 50 steps the run "${title(f, "02_base_500")}" holds between ` +
        `${seedRange(f, "02_base_500", "population_last50")} agents depending on the seed, and ` +
        `"${title(f, "03_scenario1_regrowth_slow")}" between ${seedRange(f, "03_scenario1_regrowth_slow", "population_last50")}. ` +
        (apart
          ? "These ranges do not overlap, so the difference comes from the change in regrowth, not from luck."
          : "These ranges overlap, so part of the difference may be luck.") +
        " Where the ranges of two runs overlap, a difference between them may be chance."
      );
    },
    files: [{ path: "assignment/run_simulations.py", find: "REPEAT_SEEDS =" }, { path: "assignment/data/repeats.csv" }],
  },
  {
    q: "How can anyone tell the saved files came from this code?",
    short: "By running it again: the same settings and seed give the same CSV text, byte for byte. The Experiments page does this for every saved run.",
    long: "Every random choice comes from the run's own generator, and the numbers are always written the same way (rows_to_csv_text), so a fresh run can be compared with the saved file character by character. Check 10 of tests/test_rules.py does this for every run of both pieces of coursework, and so does tests/test_server.py through the web server.",
    files: [
      { path: "tests/test_rules.py", find: "def check_csv_match_fresh_run" },
      { path: "app/simulation.py", find: "def compare_with_saved" },
    ],
  },
  {
    q: "Why do the Assignment's runs have fewer steps than the Project's?",
    short: (f) =>
      `To keep the data folder small enough to hand in. With more steps the agents files of the runs with reproduction grow ` +
      `very large, so the Assignment's runs stop at step ${courseworkOf(f, "assignment").runs[0].steps}.`,
    long: (f) =>
      `The Project has only ${courseworkOf(f, "project").runs.length} runs, so its runs can go on to step ` +
      `${courseworkOf(f, "project").runs[0].steps}. The number of steps is the STEPS setting at the top of each run_simulations.py.`,
    files: [{ path: "assignment/run_simulations.py", find: "STEPS =" }],
  },
];

export const RESULT_QUESTIONS: Question[] = [
  {
    q: "How is the Gini coefficient computed?",
    short: "The agents' sugar is sorted from poorest to richest and combined in one weighted sum. The result is 0 when everyone holds the same, and close to 1 when one agent holds almost everything.",
    long: "gini() sorts the values and gives the i-th smallest a weight of 2i − n − 1, where n is the number of agents, so the poorest count negatively and the richest positively. The weighted sum is divided by n times the total sugar. This equals the average difference between every pair of agents, divided by twice the average sugar. With fewer than two agents, or no sugar at all, it is 0.",
    files: [{ path: MODEL, find: "def gini" }],
  },
  {
    q: "Why does the population fall at the start and then level off?",
    short: "Agents that start far from the hills, see little or burn a lot starve in the first steps. The survivors settle where sugar grows back faster than they burn it.",
    long: (f) => {
      const run = assignment(f, "02_base_500");
      return (
        `In "${title(f, "02_base_500")}" the population falls from ${count(run.start_population as number)} to ` +
        `${count(run.final_population)}. Over the last 50 steps ${percent(run.last50_share_on_rich_cells as number)} of the agents ` +
        "stand on rich cells (capacity 3 or 4), and the survivors' mean metabolism is lower than at the start " +
        `(${average(run.start_mean_metabolism as number)} against ${average(run.final_mean_metabolism as number)}).`
      );
    },
    files: [{ path: "assignment/figures/fig03_base_population_sugar.png" }],
  },
  {
    q: "Why does the average sugar keep rising in the base runs?",
    short: "On the hills an agent usually eats more than it burns, and nothing takes sugar away from it, so the surplus piles up step after step.",
    long: (f) =>
      `In "${title(f, "01_base_100")}" the average agent holds ${average(assignment(f, "01_base_100").final_mean_sugar as number)} ` +
      "sugar at the last step, and the line is still rising. There is no upper limit on what an agent holds, no spending and no " +
      "decay: only cells have a capacity.",
    files: [{ path: MODEL, find: "agent.sugar = agent.sugar + collected - agent.metabolism" }],
  },
  {
    q: "How did the three scenarios change the result?",
    short: (f) => {
      const pop = (run: string) => count(assignment(f, run).final_population);
      return (
        `Final population with the reference seed: original ${pop("02_base_500")}; slow regrowth ${pop("03_scenario1_regrowth_slow")}, ` +
        `fast regrowth ${pop("04_scenario1_regrowth_fast")}; patches that never regrow ${pop("05_scenario2_no_regrow_patches")}; ` +
        `short vision ${pop("06_scenario3_vision_short")}, long vision ${pop("07_scenario3_vision_long")}.`
      );
    },
    long: (f) => {
      const gini = (run: string) => fraction(assignment(f, run).last50_gini);
      return (
        "Less food supports fewer agents and more food supports more: the grid can only feed so many. Vision matters " +
        "because an agent that sees further finds the rich cells sooner. The Gini coefficient over the last 50 steps is " +
        `${gini("02_base_500")} for the original, ${gini("04_scenario1_regrowth_fast")} with fast regrowth and ` +
        `${gini("07_scenario3_vision_long")} with long vision: when sugar returns quickly the best placed agents pull further ahead, ` +
        "while long vision lets more agents reach the rich cells."
      );
    },
    files: [{ path: "assignment/results/comparison_table.csv" }],
  },
];

export const ADDITION_QUESTIONS: Question[] = [
  {
    q: "Why does the population die out with lifespan alone?",
    short: "Agents die of old age, and with reproduction off nobody is born to replace them.",
    long: (f) => {
      const run = assignment(f, "08_modification_lifespan");
      return (
        `Every maximum age is at most ${f.defaults.max_age_max} steps, so every starting agent is dead by then. With its reference seed ` +
        `the run "${title(f, "08_modification_lifespan")}" reaches 0 agents at step ${count(run.extinction_step ?? 0)}: ` +
        `${count(run.deaths_old_age)} died of old age and ${count(run.deaths_starved)} starved. After that the averages and the ` +
        "Gini coefficient are written as 0, so the charts stop their lines there."
      );
    },
    files: [{ path: MODEL, find: 'elif self.settings["lifespan"]' }],
  },
  {
    q: "Why does reproduction make sugar more equal?",
    short: "An agent that reaches the threshold gives half its sugar to a child, so no agent stays far above the threshold for long.",
    long: (f) =>
      `The Gini coefficient over the last 50 steps falls from ${fraction(assignment(f, "01_base_100").last50_gini)} in ` +
      `"${title(f, "01_base_100")}" to ${fraction(assignment(f, "09_modification_reproduction").last50_gini)} with reproduction, ` +
      `and the average sugar from ${average(assignment(f, "01_base_100").last50_mean_sugar)} to ` +
      `${average(assignment(f, "09_modification_reproduction").last50_mean_sugar)}. The population also grows until the free ` +
      `cells near the sugar run out (${count(assignment(f, "09_modification_reproduction").final_population)} agents at the last step).`,
    files: [{ path: MODEL, find: "def reproduce" }],
  },
  {
    q: "What do founders alive and the lineage shares show?",
    short: "Every child carries the founder_id of its starting ancestor. Counting them shows how many family lines survive and how much of the population the biggest ones make up.",
    long: (f) => {
      const run = assignment(f, "09_modification_reproduction");
      return (
        `In "${title(f, "09_modification_reproduction")}" ${count(run.founders_alive_final as number)} founders still have living ` +
        `descendants at the last step, and the five largest lines hold ${percent(run.final_top5_lineage_share as number)} of the ` +
        `agents. Mean metabolism falls from ${average(run.start_mean_metabolism as number)} to ` +
        `${average(run.final_mean_metabolism as number)}: agents that burn little get rich, have children, and pass their ` +
        "metabolism on, while those that burn a lot die out. Nothing in the code favours them: it is selection."
      );
    },
    files: [{ path: "assignment/figures/fig10_modifications_traits.png" }, { path: MODEL, find: "agent.metabolism, max_age, agent.founder_id" }],
  },
];
