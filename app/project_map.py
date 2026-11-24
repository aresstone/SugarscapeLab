# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       app/project_map.py
# Purpose:    Builds the project map: the folder tree with one plain line about each folder and file.
#             Code files describe themselves in the "Purpose" line of their header; the rest are described here.

import os
import re

from file_viewer import PROJECT_DIR, is_viewable

# One line for each folder and for each file that has no header to read it from.
DESCRIPTIONS = {
    "": "The whole project: the model, the runs and the analysis of the Assignment and of the Project, "
        "the tests and the web app.",
    "app": "The Python server behind the web app. It runs the coursework's own Python files and reads their results.",
    "assignment": "The Assignment: its three Python files and the data, results and figures they write.",
    "project": "The Project: its three Python files and the data, results and figures they write.",
    "tests": "Plain checks of the model's rules, of the saved data and of the web server.",
    "web": "The web app's source code (React, TypeScript and Tailwind).",
    "web/src": "The code of the web app's pages and their parts.",
    "web/src/pages": "One file per page of the web app.",
    "web/src/components": "Parts used by the pages, such as the header and the file viewer.",
    "web/src/components/simulate": "Parts of the Simulate page: the world, the settings, the playback and the counters.",
    "web/src/components/experiments": "Parts of the Experiments page: one card per run, and the figures.",
    "web/src/components/charts": "The line chart shared by the Simulate and Experiments pages.",
    "web/src/components/how-it-works": "The step cards of the How it works page.",
    "web/src/components/learn": "The simple diagrams on the Learn pages.",
    "web/src/components/motion": "The background glows and the fade-in and count-up effects.",
    "web/src/components/tour": "The guided tour and its guide, Sugi.",
    "web/src/lib": "Shared helpers: talking to the server, the results, colours, the current run, page "
                   "navigation, settings and menus.",
    "web/src/content": "The text of the tour, the step cards, the limits, the questions and the Learn pages.",
    "web/public": "Files copied into the built app unchanged, such as the tab icon.",
    "web/dist": "The built web app, which the Python server sends to the browser.",
    "web/node_modules": "Installed JavaScript packages. Only needed to rebuild the web app.",
    "web/package.json": "The web app's packages and its build command.",
    "web/package-lock.json": "The exact versions of the installed JavaScript packages.",
    "web/tsconfig.json": "TypeScript settings for the web app.",
    "requirements.txt": "The Python packages the web server needs (FastAPI and uvicorn).",
    "requirements-analysis.txt": "The extra package analyse_results.py needs to draw the figures (matplotlib).",
}

# One line for each folder and file found in both assignment/ and project/ (the key leaves out the
# coursework folder).
COURSEWORK_DESCRIPTIONS = {
    "HOW_TO_RUN.txt": "The steps to run the three Python files on Windows and on a Mac.",
    "data": "The CSV files written by run_simulations.py.",
    "data/repeats.csv": "One row per run and seed: the summary numbers of the five repeats.",
    "results": "The numbers written by analyse_results.py from the CSV files.",
    "results/results.json": "Every number about the runs that the reports and the web app quote.",
    "results/comparison_table.csv": "One row per run with its main numbers, side by side.",
    "figures": "The figures drawn by analyse_results.py from the CSV files.",
}

# One line for each figure, by its path.
FIGURES = {
    "assignment/figures/fig01_landscape.png": "Figure: the sugar capacity of every cell, with its two hills.",
    "assignment/figures/fig02_base_maps.png": "Figure: where the agents stand at the first and last step, "
                                             "for 100 and for 500 agents.",
    "assignment/figures/fig03_base_population_sugar.png": "Figure: population and mean sugar over time, "
                                                         "100 against 500 agents.",
    "assignment/figures/fig04_base_wealth.png": "Figure: how sugar is spread among the agents at the last step "
                                               "of both base runs.",
    "assignment/figures/fig05_scenario1_regrowth.png": "Figure: population and sugar on the grid over time for "
                                                      "slow, original and fast regrowth.",
    "assignment/figures/fig06_scenario2_no_regrow.png": "Figure: population against the original, and the final "
                                                       "positions with the patches that never regrow.",
    "assignment/figures/fig07_scenario3_vision.png": "Figure: population and mean sugar over time for short, "
                                                    "original and long vision.",
    "assignment/figures/fig08_modifications_population.png": "Figure: population over time for the original "
                                                            "and the three modified runs.",
    "assignment/figures/fig09_modifications_wealth.png": "Figure: Gini coefficient and mean sugar over time "
                                                        "for the same four runs.",
    "assignment/figures/fig10_modifications_traits.png": "Figure: mean vision, mean metabolism and founders "
                                                        "alive over time for the runs with reproduction.",
    "project/figures/fig01_population.png": "Figure: population over time for the three runs.",
    "project/figures/fig02_resources.png": "Figure: sugar on the grid and sugar collected per step.",
    "project/figures/fig03_inequality.png": "Figure: Gini coefficient over time, and the Lorenz curve of each "
                                           "run at the last step.",
    "project/figures/fig04_wealth_classes.png": "Figure: each agent's sugar relative to the run's median at the "
                                               "last step, with the poor and rich limits.",
    "project/figures/fig05_maps.png": "Figure: where the agents stand at the last step of each run.",
}

# Folders shown without their contents, because they hold many installed or generated files.
COLLAPSED = {"web/dist", "web/node_modules"}

# Names that are left out of the map altogether.
SKIPPED = {"__pycache__", "venv", ".venv", ".git", ".DS_Store", ".vercel"}


# Removes comment marks from one header line, for example "# ", "// ", " * ", "<!--" or "REM ".
# line: one line of text from the top of a file.
def strip_comment_marks(line):
    line = re.sub(r"^\s*(#|//|/\*|\*|<!--|REM\b)?\s*", "", line)
    return re.sub(r"\s*(\*/|-->)\s*$", "", line).strip()


# Reads the first sentence of the "Purpose:" line in a file's header, or "" if there is none.
# full_path: the full path of the file.
def read_purpose(full_path):
    try:
        with open(full_path, encoding="utf-8", errors="replace") as file:
            head = [file.readline() for _ in range(15)]
    except OSError:
        return ""
    text = None
    for line in head:
        cleaned = strip_comment_marks(line)
        if text is None:
            if cleaned.startswith("Purpose:"):
                text = cleaned[len("Purpose:"):].strip()
        elif re.match(r"^[A-Z][a-z ]+:\s", cleaned):
            break   # the next header line, such as "Run with:"
        elif cleaned:
            text += " " + cleaned   # the Purpose continues on the next line
        else:
            break
    if not text:
        return ""
    end = re.search(r"(?<=[.!?])\s+(?=[A-Z])", text)
    return text[:end.start()] if end else text


# Gives the one-line description of a folder or file.
# relative_path: path relative to the project, with "/" between parts. full_path: the full path.
def describe(relative_path, full_path):
    if relative_path in DESCRIPTIONS:
        return DESCRIPTIONS[relative_path]
    if relative_path in FIGURES:
        return FIGURES[relative_path]
    parts = relative_path.split("/")
    inside = "/".join(parts[1:])
    if parts[0] in ("assignment", "project") and inside in COURSEWORK_DESCRIPTIONS:
        return COURSEWORK_DESCRIPTIONS[inside]
    if parts[0] in ("assignment", "project") and len(parts) == 3 and parts[1] == "data":
        if parts[2].endswith("_agents.csv"):
            return f"Run {parts[2][:-len('_agents.csv')]}, reference seed: every living agent at every step."
        if parts[2].endswith("_steps.csv"):
            return f"Run {parts[2][:-len('_steps.csv')]}, reference seed: one row of totals and averages per step."
        if parts[2] == "README.txt":
            return "What each data file holds and what each column means."
    if os.path.isfile(full_path) and os.path.splitext(full_path)[1].lower() != ".json":
        return read_purpose(full_path)
    return ""


# Builds the map entry for one folder or file, and for everything inside a folder.
# relative_path: path relative to the project ("" for the project folder itself).
def build_entry(relative_path):
    full_path = os.path.join(PROJECT_DIR, relative_path) if relative_path else PROJECT_DIR
    name = os.path.basename(full_path) if relative_path else "sugarscape-lab"
    entry = {"name": name, "path": relative_path, "description": describe(relative_path, full_path)}

    if not os.path.isdir(full_path):
        entry.update({"type": "file", "viewable": is_viewable(relative_path)})
        return entry

    entry.update({"type": "folder", "children": [], "collapsed": False})
    if relative_path in COLLAPSED:
        entry["collapsed"] = True
        return entry

    names = [n for n in os.listdir(full_path) if n not in SKIPPED and not n.startswith(".")]
    names.sort(key=lambda n: (not os.path.isdir(os.path.join(full_path, n)), n.lower()))
    entry["children"] = [build_entry(f"{relative_path}/{n}" if relative_path else n) for n in names]
    return entry


# Builds the whole project map, starting from the project folder. No parameters.
def build_project_map():
    return build_entry("")
