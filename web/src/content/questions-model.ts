// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/questions-model.ts
// Purpose:    Questions about the model and about the code, each with a short answer, a longer one (shown
//             when Detail is on) and the places where the answer can be checked.

import { count, average, numbersOf, type Facts } from "../lib/results";
import type { Question } from "./questions";

const MODEL = "assignment/sugarscape.py";

// The numbers of one Assignment run. f: the facts. run: the run's name.
const assignment = (f: Facts, run: string) => numbersOf(f, "assignment", run);

export const MODEL_QUESTIONS: Question[] = [
  {
    q: "What is Sugarscape, and what does this project model?",
    short: "A grid world where simple agents look for sugar, move to it, eat it and burn it to stay alive. Patterns such as crowding on the hills and unequal wealth come out of these few rules.",
    long: "The rules follow the model published by Joshua Epstein and Robert Axtell in their book Growing Artificial Societies. Reproduction follows the wording of the coursework brief, which is simpler than the book's rule. Both pieces of coursework, the Assignment and the Project, use the same model file and differ only in the runs they make.",
    files: [{ path: MODEL, find: "class Sugarscape" }],
  },
  {
    q: "Why do agents look in only four directions?",
    short: "This is the vision rule of the original Sugarscape: an agent sees along its own row and column, up, down, left and right, as far as its vision reaches.",
    long: "The four directions are the list DIRECTIONS at the top of sugarscape.py. Cells on a diagonal are not seen. Distance is counted in cells along a line, and the view wraps round the edges like the grid itself. Looking along four lines keeps each choice small and easy to check by hand, which is what the rule tests in tests/test_rules.py do on a hand-built world.",
    files: [
      { path: MODEL, find: "DIRECTIONS = [" },
      { path: MODEL, find: "def cells_in_view" },
    ],
  },
  {
    q: "How are ties broken?",
    short: "Most sugar wins. If several cells hold the same amount, the nearest wins. If they are also equally near, one is chosen at random.",
    long: "choose_cell goes through every cell in view and keeps a list of the best ones so far. The agent's own cell is in the list at distance 0, so when it holds as much sugar as anything in view the agent stays put. The random pick uses the run's own random number generator, and only when more than one cell is left, so the same seed always makes the same choices.",
    files: [{ path: MODEL, find: "def choose_cell" }],
  },
  {
    q: "Why do agents die?",
    short: "They starve: when an agent's sugar falls to 0 or below after burning its metabolism, it is removed. With lifespan on, an agent also dies when it reaches its maximum age.",
    long: (f) => {
      const base = assignment(f, "01_base_100");
      return (
        `In the Assignment's base run ${count(base.deaths_starved)} of the ${count(base.start_population as number)} starting agents ` +
        "starve, most of them early in the run: those that start far from the hills, see little or burn a lot cannot find " +
        `enough sugar. The survivors burn less on average: mean metabolism falls from ${average(base.start_mean_metabolism as number)} ` +
        `at the start to ${average(base.final_mean_metabolism as number)} at the end. Nobody is killed by another agent.`
      );
    },
    files: [{ path: MODEL, find: "def check_death" }],
  },
];

export const CODE_QUESTIONS: Question[] = [
  {
    q: "How do the three Python files fit together?",
    short: "sugarscape.py is the model. run_simulations.py runs it and writes the CSV files. analyse_results.py reads only those CSV files and writes the results and the figures.",
    long: "Each coursework folder holds the same three files. run_simulations.py imports Sugarscape from sugarscape.py; analyse_results.py imports the list of runs from run_simulations.py but takes every number from the data folder. Nothing runs when a file is imported: each file that is run directly ends with if __name__ == \"__main__\": main().",
    files: [
      { path: "assignment/run_simulations.py", find: "from sugarscape import" },
      { path: "assignment/analyse_results.py", find: "from run_simulations import" },
    ],
  },
  {
    q: "What happens in one time step, in order?",
    short: "Sugar grows back first. Then every agent, in a new random order, moves and eats, burns sugar, may die, and may have a child. Then the step counter goes up by one.",
    long: "step() resets the counts of births and deaths, calls regrow(), then shuffles a copy of the list of living agents. A child born during the step is not in that copy, so it first acts in the next step. After every agent has acted, time rises by 1, and summary() describes the new state for the steps CSV.",
    files: [{ path: MODEL, find: "def step(self)" }],
  },
  {
    q: "Why is sugarscape.py the same file in both folders?",
    short: "Both pieces of coursework study the same model. The file was copied, not rewritten, and a test checks that the two copies are identical byte for byte.",
    long: "Only run_simulations.py and analyse_results.py differ between the folders: their headers, the runs, the seeds, the number of steps and the figures. Check 11 of tests/test_rules.py compares the two model files.",
    files: [{ path: "tests/test_rules.py", find: "def check_identical_model_files" }],
  },
  {
    q: "How is chance kept under control?",
    short: "Each simulation has its own random number generator, started from the run's seed. The same settings and seed always give the same run.",
    long: "The model uses only random.Random(seed), never the module-level random functions, and only randint, shuffle and choice from it. The starting agents are drawn in a fixed order (positions, sugar, metabolism, maximum age, vision, then the patches that never regrow), so a scenario that changes vision still starts with the same positions, sugar and metabolism. Checks 7 and 8 of tests/test_rules.py test both points.",
    files: [
      { path: MODEL, find: "self.rng = random.Random" },
      { path: "tests/test_rules.py", find: "def check_same_start" },
    ],
  },
];
