# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence - Project
# File:       run_simulations.py
# Purpose:    Runs every simulation of the project and saves the results as CSV files in
#             the data folder: full data for one reference seed and a summary for all seeds.
# Run with:   python run_simulations.py

import os
import time

from sugarscape import Sugarscape, AGENT_COLUMNS, STEP_COLUMNS

# Seeds used for every run; the first one is the reference seed whose full data is saved.
REPEAT_SEEDS = [201, 202, 203, 204, 205]

# Number of time steps in every run.
STEPS = 500

# Folder (next to this file) that receives the CSV files.
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# Columns of repeats.csv: one row per run and seed.
REPEAT_COLUMNS = ["run", "seed", "steps", "final_population", "population_last50",
                  "mean_sugar_last50", "gini_last50", "total_births", "deaths_starved",
                  "deaths_old_age", "mean_vision_final", "mean_metabolism_final",
                  "founders_alive_final"]


# Builds one entry of RUNS.
# name: file-friendly name; title: short plain name; brief: line of the coursework brief it answers;
# compare_with: name of the run it is compared against (or None); settings: settings that differ
# from the defaults.
def make_run(name, title, brief, compare_with, settings):
    return {"name": name, "title": title, "brief": brief, "compare_with": compare_with,
            "steps": STEPS, "settings": settings}


# Every run of the project, in order.
RUNS = [
    make_run("01_base_100", "Base, 100 agents",
             "Simulation and Analysis: a base simulation with 100 agents",
             None, {}),
    make_run("02_reproduction_death", "Reproduction and death",
             "Simulation and Analysis: simulations with agent reproduction and death",
             "01_base_100", {"lifespan": True, "reproduction": True}),
    make_run("03_reproduction_death_scarce", "Reproduction and death, scarce sugar",
             "Simulation and Analysis: reproduction and death when sugar is scarce",
             "02_reproduction_death",
             {"lifespan": True, "reproduction": True, "regrowth_rate": 0.5}),
]


# Runs one simulation in memory.
# settings: dict of Sugarscape settings, including "seed"; steps: number of time steps.
# Returns (agent_rows, step_rows), both including step 0.
def simulate(settings, steps):
    world = Sugarscape(**settings)
    agent_rows = world.agent_rows()
    step_rows = []
    summary = world.summary()
    step_rows.append([summary[name] for name in STEP_COLUMNS])
    for _ in range(steps):
        world.step()
        agent_rows.extend(world.agent_rows())
        summary = world.summary()
        step_rows.append([summary[name] for name in STEP_COLUMNS])
    return agent_rows, step_rows


# Turns one number into CSV text: whole numbers without a decimal point, others with at most
# four decimals and no trailing zeros.
# value: the number to write.
def format_number(value):
    if isinstance(value, float) and value != int(value):
        text = ("%.4f" % value).rstrip("0").rstrip(".")
        if text in ("-0", ""):
            return "0"
        return text
    return str(int(value))


# The exact text of a CSV file.
# columns: list of column names; rows: list of rows, each a list of numbers or text.
def rows_to_csv_text(columns, rows):
    lines = [",".join(columns)]
    for row in rows:
        cells = []
        for value in row:
            if isinstance(value, str):
                cells.append(value)
            else:
                cells.append(format_number(value))
        lines.append(",".join(cells))
    return "\n".join(lines) + "\n"


# Average of one column over the last 50 step rows.
# step_rows: rows in STEP_COLUMNS order; column_name: which column to average.
def last50_mean(step_rows, column_name):
    index = STEP_COLUMNS.index(column_name)
    values = [row[index] for row in step_rows[-50:]]
    return sum(values) / len(values)


# All values of one column in the step rows.
# step_rows: rows in STEP_COLUMNS order; column_name: which column to take.
def column_values(step_rows, column_name):
    index = STEP_COLUMNS.index(column_name)
    return [row[index] for row in step_rows]


# One row of repeats.csv for a finished simulation.
# name: run name; seed: seed used; steps: number of steps; step_rows: its step rows.
def repeat_row(name, seed, steps, step_rows):
    final = step_rows[-1]
    return [name, seed, steps, final[STEP_COLUMNS.index("population")],
            last50_mean(step_rows, "population"), last50_mean(step_rows, "mean_sugar"),
            last50_mean(step_rows, "gini"), sum(column_values(step_rows, "births")),
            sum(column_values(step_rows, "deaths_starved")),
            sum(column_values(step_rows, "deaths_old_age")),
            final[STEP_COLUMNS.index("mean_vision")], final[STEP_COLUMNS.index("mean_metabolism")],
            final[STEP_COLUMNS.index("founders_alive")]]


# Writes a text file into the data folder.
# file_name: name of the file; text: its content.
def write_file(file_name, text):
    with open(os.path.join(DATA_FOLDER, file_name), "w", encoding="utf-8", newline="") as handle:
        handle.write(text)


# Text of README.txt: the files and the meaning of their columns.
def readme_text():
    lines = [
        "Files in this folder (all written by run_simulations.py)",
        "",
        "<name>_agents.csv  Reference seed: one row per living agent per step.",
        "<name>_steps.csv   Reference seed: one row per step.",
        "repeats.csv        One row per run and seed, with summary numbers.",
        "",
        "Agent columns: step; agent_id; x (column), y (row); sugar held; vision (cells seen);",
        "  metabolism (sugar burned per step); age (steps lived); founder_id (starting ancestor).",
        "Step columns: step (0 = start); population (living agents); births, deaths_starved,",
        "  deaths_old_age, sugar_collected (counted during that step); mean_sugar and",
        "  median_sugar (of living agents); gini (inequality of agent sugar); sugar_on_grid",
        "  (total sugar on the cells); mean_vision, mean_metabolism (of living agents);",
        "  share_on_rich_cells (share of agents on cells with capacity 3 or 4);",
        "  founders_alive (number of different founder_id among living agents).",
        "Repeats columns: run; seed; steps; final_population; population_last50, mean_sugar_last50",
        "  and gini_last50 (averages over the last 50 steps); total_births; deaths_starved and",
        "  deaths_old_age (totals over the run); mean_vision_final, mean_metabolism_final and",
        "  founders_alive_final (at the last step).",
        "",
        "Runs: " + ", ".join(run["name"] for run in RUNS),
    ]
    return "\n".join(lines) + "\n"


# Runs every simulation for every seed and writes the data folder.
def main():
    os.makedirs(DATA_FOLDER, exist_ok=True)
    repeat_rows = []
    for run in RUNS:
        started = time.time()
        for seed in REPEAT_SEEDS:
            settings = dict(run["settings"])
            settings["seed"] = seed
            agent_rows, step_rows = simulate(settings, run["steps"])
            repeat_rows.append(repeat_row(run["name"], seed, run["steps"], step_rows))
            if seed == REPEAT_SEEDS[0]:
                write_file(run["name"] + "_agents.csv", rows_to_csv_text(AGENT_COLUMNS, agent_rows))
                write_file(run["name"] + "_steps.csv", rows_to_csv_text(STEP_COLUMNS, step_rows))
                final_population = step_rows[-1][STEP_COLUMNS.index("population")]
        print("%s: final population %d (%.1f s)" % (run["name"], final_population,
                                                     time.time() - started))
    write_file("repeats.csv", rows_to_csv_text(REPEAT_COLUMNS, repeat_rows))
    write_file("README.txt", readme_text())


if __name__ == "__main__":
    main()
