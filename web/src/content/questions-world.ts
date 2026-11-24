// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/questions-world.ts
// Purpose:    Questions about the real world, the interface and running the project, each with a short
//             answer, a longer one (shown when Detail is on) and the places where the answer can be checked.

import { count, fraction, numbersOf, percent, runOf, type Facts } from "../lib/results";
import type { Question } from "./questions";

// The numbers and the title of one Project run. f: the facts. run: the run's name.
const project = (f: Facts, run: string) => numbersOf(f, "project", run);
const title = (f: Facts, run: string) => runOf(f, "project", run).title;

export const WORLD_QUESTIONS: Question[] = [
  {
    q: "What can this model say about wealth inequality?",
    short: "That unequal wealth can come out of equal rules: agents differ only in luck, place and two traits, yet their sugar ends up very unequal. It cannot say why any real society is unequal.",
    long: (f) => {
      const base = project(f, "01_base_100");
      return (
        `In the Project's "${title(f, "01_base_100")}" the Gini coefficient of the last 50 steps is ${fraction(base.last50_gini)}, ` +
        `and ${percent(base.final_share_poor as number)} of the agents hold less than half the median sugar at the end. ` +
        `With reproduction and death it is ${fraction(project(f, "02_reproduction_death").last50_gini)}, because wealth is split ` +
        "between parent and child. Real inequality also comes from inheritance, trade, work, prices and institutions, none of which are in the model."
      );
    },
    files: [{ path: "project/figures/fig03_inequality.png" }, { path: "project/figures/fig04_wealth_classes.png" }],
  },
  {
    q: "What can it say about resources in an ecosystem or a city?",
    short: "That a place with a given rate of renewal can feed only so many: when sugar grows back more slowly, fewer agents live on the same land.",
    long: (f) =>
      `With reproduction and death the Project's population levels off near ${count(project(f, "02_reproduction_death").last50_population)} ` +
      `agents; when sugar grows back at a lower rate ("${title(f, "03_reproduction_death_scarce")}") it levels off near ` +
      `${count(project(f, "03_reproduction_death_scarce").last50_population)}. This is the idea of a carrying capacity. The model ` +
      "has no movement of goods, no building and no planning, so it says nothing about how a real city shares its resources.",
    files: [{ path: "project/figures/fig01_population.png" }, { path: "project/figures/fig02_resources.png" }],
  },
  {
    q: "Why was trade not built?",
    short: "The brief offers trade as one of three possible additions and asks for at least two. Lifespan and reproduction were built; trade is discussed as an extension.",
    long: "Trade needs a second resource, such as the spice of the original Sugarscape, a rule for when two agents trade and a rule for the price. That would change most of the model, not add one rule to it. Lifespan and reproduction each add one rule, so their effect can be compared with the original run directly.",
    files: [{ path: "assignment/run_simulations.py", find: "Modification Exploration: lifespan and reproduction together" }],
  },
];

export const INTERFACE_QUESTIONS: Question[] = [
  {
    q: "How does the interface work?",
    short: "A small Python server runs the model in the project's own Python files, and the page draws what it sends back.",
    long: "app/simulation.py loads assignment/sugarscape.py and both run_simulations.py files by their paths. For a run it builds Sugarscape(**settings), calls step() for every step, and keeps the agents, the per-step numbers and the sugar on every cell. app/playback.py packs that into frames. The page plays them back on a canvas and draws the charts with the recharts library.",
    files: [
      { path: "app/simulation.py", find: "def run_world" },
      { path: "app/server.py", find: '@app.post("/api/run")' },
    ],
  },
  {
    q: "Does the interface change the results?",
    short: "No. It adds no rules and changes no file: it runs the same Python files, and a re-run of any saved run gives text identical to the saved CSV files.",
    long: "The CSV download calls simulate() and rows_to_csv_text() from run_simulations.py itself. tests/test_server.py re-runs every saved run of both pieces of coursework through the server and checks the text is identical. The server writes nothing to disk, not even Python's cache files.",
    files: [{ path: "tests/test_server.py", find: "def check_saved_runs" }],
  },
];

export const RUNNING_QUESTIONS: Question[] = [
  {
    q: "How is the app started?",
    short: "On a Mac or Linux with sh start.sh, on Windows by double-clicking start.bat. The first start makes a Python environment and installs the packages it needs; then the browser opens.",
    long: "The scripts need Python 3.9 or newer. To start by hand: python app/server.py from the sugarscape-lab folder, then open http://127.0.0.1:8000. A hosted copy can also be tried without installing anything; there the buttons that open folders are hidden.",
    files: [{ path: "start.sh" }, { path: "README.md", find: "## Start the app" }],
  },
  {
    q: "How are the simulations run without the app?",
    short: "In the assignment or project folder: python run_simulations.py writes the data folder, then python analyse_results.py writes results and figures.",
    long: "run_simulations.py needs only Python; analyse_results.py also needs matplotlib. python tests/test_rules.py checks the rules and that every saved file matches a fresh run, and python tests/test_server.py checks the web server.",
    files: [{ path: "README.md", find: "## Run the simulations from a terminal" }],
  },
];
