# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence - Project
# File:       analyse_results.py
# Purpose:    Reads the CSV files in the data folder and writes results/results.json,
#             results/comparison_table.csv and the figures in the figures folder.
# Run with:   python analyse_results.py
#
# Keys of results/results.json (one entry per run, keyed by the run name):
#   title, steps, settings, compare_with, reference_seed   what the run was
#   start_population, lowest_population, highest_population   reference seed, over all steps
#   total_births, deaths_starved, deaths_old_age   reference seed, totals over the run
#   extinction_step   first step with 0 living agents, or null
#   final_<column>, last50_<column>   reference seed: value at the last step, and the average over
#       the last 50 steps, for population, mean_sugar, median_sugar, gini, sugar_on_grid and
#       share_on_rich_cells
#   start_/final_ mean_vision and mean_metabolism, founders_alive_final   reference seed
#   final_share_poor, final_share_middle, final_share_rich   reference seed, last step: share of
#       living agents with sugar below half the median, between, and above twice the median
#   final_largest_lineage_share, final_top5_lineage_share   reference seed, last step: share of
#       living agents whose founder_id is the most common one, or one of the five most common
#   across_seeds   for each column of repeats.csv: {mean, lowest, highest} over the five seeds
#   difference_from_compare_with   this run minus the run it is compared with, for the main numbers

import csv
import json
import os
import statistics

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

from run_simulations import RUNS, REPEAT_SEEDS
from sugarscape import Sugarscape

# Folder that holds this file, and the folders read from and written to.
BASE_FOLDER = os.path.dirname(os.path.abspath(__file__))
DATA_FOLDER = os.path.join(BASE_FOLDER, "data")
RESULTS_FOLDER = os.path.join(BASE_FOLDER, "results")
FIGURES_FOLDER = os.path.join(BASE_FOLDER, "figures")

# The run names in order, and the short title of each run.
RUN_NAMES = [run["name"] for run in RUNS]
RUN_TITLES = {run["name"]: run["title"] for run in RUNS}

# One colour-blind-safe colour per run (same order as RUNS) and a line style cycle.
COLOURS = ["#0072B2", "#D55E00", "#009E73", "#E69F00", "#CC79A7",
           "#56B4E9", "#000000", "#7F7F7F", "#8C510A", "#1B7F7F"]
LINE_STYLES = ["-", "--", ":", "-."]

# Axis label (with unit) for every plotted column.
COLUMN_LABELS = {"population": "Population\n(agents)", "mean_sugar": "Mean sugar\n(units per agent)",
                 "sugar_on_grid": "Sugar on the grid\n(units)", "gini": "Gini coefficient\n(0 to 1)",
                 "sugar_collected": "Sugar collected\n(units per step)",
                 "mean_vision": "Mean vision\n(cells)", "mean_metabolism": "Mean metabolism\n(sugar per step)",
                 "founders_alive": "Founders alive\n(count)"}

# Columns reported both at the last step and as an average over the last 50 steps.
LAST50_COLUMNS = ["population", "mean_sugar", "median_sugar", "gini", "sugar_on_grid",
                  "share_on_rich_cells"]

# Numbers compared with the run named in compare_with.
MAIN_NUMBERS = ["final_population", "last50_population", "last50_mean_sugar", "last50_gini",
                "total_births", "deaths_starved", "deaths_old_age"]

# Columns of comparison_table.csv.
TABLE_COLUMNS = ["run", "title", "compared_with", "final_population", "last50_population",
                 "last50_mean_sugar", "last50_gini", "total_births", "deaths_starved",
                 "deaths_old_age", "seeds_population_last50_mean", "seeds_population_last50_lowest",
                 "seeds_population_last50_highest", "seeds_gini_last50_mean"]


# The line figures: (file name, columns to plot, figure height in inches); all runs are drawn.
LINE_FIGURES = [
    ("fig01_population.png", ["population"], 4),
    ("fig02_resources.png", ["sugar_on_grid", "sugar_collected"], 5.5),
]


# Reads a CSV file into a list of dicts (column name to text).
# path: the file to read.
def read_table(path):
    with open(path, encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


# Loads the steps CSV of a run as a dict: column name to list of numbers.
# name: the run name.
def load_steps(name):
    rows = read_table(os.path.join(DATA_FOLDER, name + "_steps.csv"))
    return {column: [float(row[column]) for row in rows] for column in rows[0]}


# Loads the agents of a run at one step as a dict with lists "x", "y", "sugar" and "founder_id".
# name: the run name; step: which time step to keep.
def load_agents_at(name, step):
    agents = {"x": [], "y": [], "sugar": [], "founder_id": []}
    for row in read_table(os.path.join(DATA_FOLDER, name + "_agents.csv")):
        if int(row["step"]) == step:
            for key in agents:
                agents[key].append(float(row[key]))
    return agents


# Rounds a number for the output files: whole numbers become ints, others get 4 decimals.
# value: a number.
def clean(value):
    if value == int(value):
        return int(value)
    return round(value, 4)


# Shares of poor (below half the median), middle and rich (above twice the median) agents.
# sugars: the sugar held by each living agent (may be empty).
def wealth_class_shares(sugars):
    if len(sugars) == 0:
        return 0, 0, 0
    median = statistics.median(sugars)
    poor = len([value for value in sugars if value < 0.5 * median])
    rich = len([value for value in sugars if value > 2 * median])
    count = len(sugars)
    return poor / count, (count - poor - rich) / count, rich / count


# Shares of living agents whose founder is the most common one, and among the five most common.
# founder_ids: the founder_id of each living agent (may be empty).
def lineage_shares(founder_ids):
    if len(founder_ids) == 0:
        return 0, 0
    counts = {}
    for founder_id in founder_ids:
        counts[founder_id] = counts.get(founder_id, 0) + 1
    biggest = sorted(counts.values(), reverse=True)
    return biggest[0] / len(founder_ids), sum(biggest[:5]) / len(founder_ids)


# Wealth-class and lineage numbers of one run at one step, taken from its agents CSV.
# name: the run name; step: the time step.
def distribution_numbers(name, step):
    agents = load_agents_at(name, step)
    poor, middle, rich = wealth_class_shares(agents["sugar"])
    largest, top5 = lineage_shares(agents["founder_id"])
    return {"final_share_poor": clean(poor), "final_share_middle": clean(middle),
            "final_share_rich": clean(rich), "final_largest_lineage_share": clean(largest),
            "final_top5_lineage_share": clean(top5)}


# The first step at which the population is 0, or None.
# population: list of population values by step.
def extinction_step(population):
    for step, value in enumerate(population):
        if value == 0:
            return step
    return None


# The numbers of one run taken from its reference-seed steps.
# run: entry of RUNS; steps: its loaded steps CSV.
def reference_numbers(run, steps):
    population = steps["population"]
    result = {"title": run["title"], "steps": run["steps"], "settings": run["settings"],
              "compare_with": run["compare_with"], "reference_seed": REPEAT_SEEDS[0],
              "start_population": clean(population[0]), "lowest_population": clean(min(population)),
              "highest_population": clean(max(population)),
              "total_births": clean(sum(steps["births"])),
              "deaths_starved": clean(sum(steps["deaths_starved"])),
              "deaths_old_age": clean(sum(steps["deaths_old_age"])),
              "extinction_step": extinction_step(population)}
    for column in LAST50_COLUMNS:
        result["final_" + column] = clean(steps[column][-1])
        result["last50_" + column] = clean(statistics.mean(steps[column][-50:]))
    for column in ["mean_vision", "mean_metabolism"]:
        result["start_" + column] = clean(steps[column][0])
        result["final_" + column] = clean(steps[column][-1])
    result["founders_alive_final"] = clean(steps["founders_alive"][-1])
    result.update(distribution_numbers(run["name"], int(steps["step"][-1])))
    return result


# Mean, lowest and highest of every repeats.csv number for one run.
# run_name: the run; repeat_rows: all rows of repeats.csv.
def across_seeds(run_name, repeat_rows):
    own_rows = [row for row in repeat_rows if row["run"] == run_name]
    summary = {}
    for column in own_rows[0]:
        if column not in ("run", "seed", "steps"):
            values = [float(row[column]) for row in own_rows]
            summary[column] = {"mean": clean(statistics.mean(values)), "lowest": clean(min(values)),
                               "highest": clean(max(values))}
    return summary


# Adds, to every run that has compare_with, its difference from that run.
# results: dict of run name to numbers (changed in place).
def add_differences(results):
    for name, entry in results.items():
        other_name = entry["compare_with"]
        if other_name is None:
            continue
        other = results[other_name]
        differences = {}
        for key in MAIN_NUMBERS:
            differences[key] = clean(entry[key] - other[key])
        for key in ["population_last50", "mean_sugar_last50", "gini_last50"]:
            differences["seeds_mean_" + key] = clean(entry["across_seeds"][key]["mean"] -
                                                     other["across_seeds"][key]["mean"])
        entry["difference_from_compare_with"] = differences


# Builds the full results dict for every run.
# data: dict of run name to loaded steps CSV.
def build_results(data):
    repeat_rows = read_table(os.path.join(DATA_FOLDER, "repeats.csv"))
    results = {}
    for run in RUNS:
        results[run["name"]] = reference_numbers(run, data[run["name"]])
        results[run["name"]]["across_seeds"] = across_seeds(run["name"], repeat_rows)
    add_differences(results)
    return results


# Writes results.json and comparison_table.csv.
# results: the dict made by build_results.
def write_results(results):
    with open(os.path.join(RESULTS_FOLDER, "results.json"), "w", encoding="utf-8") as handle:
        json.dump(results, handle, indent=2)
        handle.write("\n")
    path = os.path.join(RESULTS_FOLDER, "comparison_table.csv")
    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(TABLE_COLUMNS)
        for name, entry in results.items():
            seeds = entry["across_seeds"]
            writer.writerow([name, entry["title"], entry["compare_with"] or "",
                             entry["final_population"], entry["last50_population"],
                             entry["last50_mean_sugar"], entry["last50_gini"],
                             entry["total_births"], entry["deaths_starved"], entry["deaths_old_age"],
                             seeds["population_last50"]["mean"], seeds["population_last50"]["lowest"],
                             seeds["population_last50"]["highest"], seeds["gini_last50"]["mean"]])


# Colour and line style of a run, the same in every figure.
# name: the run name.
def style_of(name):
    index = RUN_NAMES.index(name)
    return COLOURS[index % len(COLOURS)], LINE_STYLES[index % len(LINE_STYLES)]


# Saves a figure at 200 dpi on white and closes it.
# fig: the matplotlib figure; filename: file name inside the figures folder.
def save_figure(fig, filename):
    fig.savefig(os.path.join(FIGURES_FOLDER, filename), dpi=200, facecolor="white", bbox_inches="tight")
    plt.close(fig)


# Legend handles: one dot in the run's colour for each run.
# names: the run names.
def run_dot_handles(names):
    handles = []
    for name in names:
        handles.append(Line2D([], [], marker="o", linestyle="", color=style_of(name)[0],
                              label=RUN_TITLES[name]))
    return handles


# The values of a series before the first step with no living agents (all of them if none).
# values: the series; population: the population at each step.
def living_part(values, population):
    for step, count in enumerate(population):
        if count == 0:
            return values[:step]
    return values


# Draws lines over time, one panel per column and one line per run.
# data: loaded steps; filename: output file; names: run names; columns: columns to plot;
# height: figure height in inches.
def time_panels(data, filename, names, columns, height):
    fig, grid = plt.subplots(len(columns), 1, sharex=True, squeeze=False, figsize=(6.5, height))
    for row, column in enumerate(columns):
        ax = grid[row][0]
        for name in names:
            colour, style = style_of(name)
            values = data[name][column]
            if column != "population":
                values = living_part(values, data[name]["population"])
            ax.plot(values, color=colour, linestyle=style, linewidth=1.6,
                    label=RUN_TITLES[name])
        ax.set_ylabel(COLUMN_LABELS[column])
        ax.grid(alpha=0.3)
    grid[-1][0].set_xlabel("Time step")
    handles, labels = grid[0][0].get_legend_handles_labels()
    fig.legend(handles, labels, loc="upper center", bbox_to_anchor=(0.5, 0.0), ncol=2, fontsize=8)
    save_figure(fig, filename)


# Draws the grid as a pale capacity background, then the agents of one run at one step.
# ax: the axes; name: run name; step: time step; extra_label: text under the x label.
def draw_map(ax, name, step, extra_label):
    agents = load_agents_at(name, step)
    ax.imshow(Sugarscape(num_agents=0).capacity, cmap="Greys", vmin=0, vmax=8)
    ax.scatter(agents["x"], agents["y"], s=5, color=style_of(name)[0])
    ax.set_xlim(-0.5, 49.5)
    ax.set_ylim(49.5, -0.5)
    ax.set_xlabel("x (column)\n" + extra_label + ", %d agents" % len(agents["x"]), fontsize=8)
    ax.set_ylabel("y (row)")


# Points of the Lorenz curve: share of agents (poorest first) against their share of the sugar.
# sugars: the sugar held by each living agent (at least one agent).
def lorenz_points(sugars):
    ordered = sorted(sugars)
    total = sum(ordered)
    agent_shares = [0]
    sugar_shares = [0]
    running = 0
    for position, value in enumerate(ordered, start=1):
        running += value
        agent_shares.append(position / len(ordered))
        sugar_shares.append(running / total)
    return agent_shares, sugar_shares


# Figure 3: Gini coefficient over time, and the Lorenz curve of each run at the last step.
# data: loaded steps.
def figure_inequality(data):
    fig, (top, bottom) = plt.subplots(2, 1, figsize=(6.5, 8))
    for name in RUN_NAMES:
        colour, style = style_of(name)
        top.plot(data[name]["gini"], color=colour, linestyle=style, label=RUN_TITLES[name])
        sugars = load_agents_at(name, int(data[name]["step"][-1]))["sugar"]
        if len(sugars) > 0:
            agent_shares, sugar_shares = lorenz_points(sugars)
            bottom.plot(agent_shares, sugar_shares, color=colour, linestyle=style, label=RUN_TITLES[name])
    bottom.plot([0, 1], [0, 1], color="grey", linestyle=":", label="Perfect equality")
    top.set_xlabel("Time step")
    top.set_ylabel(COLUMN_LABELS["gini"])
    bottom.set_xlabel("Share of agents, poorest first (fraction)")
    bottom.set_ylabel("Share of all sugar held (fraction)")
    for ax in (top, bottom):
        ax.grid(alpha=0.3)
    bottom.legend(fontsize=8, loc="upper left")
    top.legend(fontsize=8, loc="upper right")
    save_figure(fig, "fig03_inequality.png")


# Figure 4: each agent's sugar relative to the run's median at the last step, with the class limits.
# data: loaded steps.
def figure_wealth_classes(data):
    fig, ax = plt.subplots(figsize=(6.5, 4.5))
    for name in RUN_NAMES:
        sugars = load_agents_at(name, int(data[name]["step"][-1]))["sugar"]
        if len(sugars) == 0:
            continue
        median = statistics.median(sugars)
        poor, middle, rich = wealth_class_shares(sugars)
        label = "%s: %d%% poor, %d%% middle, %d%% rich" % (
            RUN_TITLES[name], round(100 * poor), round(100 * middle), round(100 * rich))
        colour, style = style_of(name)
        ax.hist([value / median for value in sugars], bins=25, range=(0, 2.5),
                weights=[1 / len(sugars)] * len(sugars), histtype="step", linewidth=1.8,
                color=colour, linestyle=style, label=label)
    for limit, text in [(0.5, "Poor limit (0.5)"), (2, "Rich limit (2)")]:
        ax.axvline(limit, color="grey", linestyle="--")
        ax.text(limit, 0.98, text + " ", rotation=90, ha="right", va="top", fontsize=8,
                transform=ax.get_xaxis_transform())
    ax.set_xlabel("Sugar of an agent divided by the run's median sugar (ratio)")
    ax.set_ylabel("Share of living agents (fraction)")
    ax.grid(alpha=0.3)
    ax.legend(fontsize=8, loc="upper center", bbox_to_anchor=(0.5, -0.2))
    save_figure(fig, "fig04_wealth_classes.png")


# Figure 5: where the agents stand at the last step of each run.
# data: loaded steps.
def figure_maps(data):
    fig, grid = plt.subplots(1, len(RUN_NAMES), figsize=(6.5, 3.4))
    for column, name in enumerate(RUN_NAMES):
        last = int(data[name]["step"][-1])
        draw_map(grid[column], name, last, "Step %d" % last)
    fig.tight_layout(rect=[0, 0.1, 1, 1])
    fig.legend(handles=run_dot_handles(RUN_NAMES), loc="lower center", ncol=3, fontsize=8)
    save_figure(fig, "fig05_maps.png")


# Reads the CSV files and writes the results files and the figures.
def main():
    os.makedirs(RESULTS_FOLDER, exist_ok=True)
    os.makedirs(FIGURES_FOLDER, exist_ok=True)
    data = {run["name"]: load_steps(run["name"]) for run in RUNS}
    write_results(build_results(data))
    for filename, columns, height in LINE_FIGURES:
        time_panels(data, filename, RUN_NAMES, columns, height)
    figure_inequality(data)
    figure_wealth_classes(data)
    figure_maps(data)


if __name__ == "__main__":
    main()
