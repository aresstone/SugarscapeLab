# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       app/simulation.py
# Purpose:    Runs simulations for the web app by calling the coursework's own Python files, checks the
#             settings it is sent, and compares fresh runs with the saved files. It holds no simulation
#             rules: every rule is in assignment/sugarscape.py. Packing the playback is in playback.py.

import importlib.util
import os
import sys

import playback
from file_viewer import PROJECT_DIR

# The two pieces of coursework: folder name and title. Each folder has its own run_simulations.py.
COURSEWORKS = {"assignment": "Assignment", "project": "Project"}

# Limits for one request, so a run stays quick and its answer fits in one response.
MAX_AGENTS = 800
MAX_STEPS = 500
MAX_VISION = 25  # half the grid: a longer vision would see the same cells twice round the wrapping edges
MAX_REGROWTH = 4  # the highest capacity: a faster rate refills every cell in one step all the same
MAX_THRESHOLD = 1000
MAX_RESPONSE_BYTES = 4_000_000  # the hosting allows 4.5 MB; this leaves room to spare

# The settings the Simulate page may change. Every other setting keeps its default from
# DEFAULT_SETTINGS in sugarscape.py.
EDITABLE_SETTINGS = ["num_agents", "seed", "regrowth_rate", "vision_min", "vision_max",
                     "no_regrow_patches", "lifespan", "reproduction", "reproduction_threshold"]

# The name of each setting (and of the number of steps) as it is written in messages.
LABELS = {"num_agents": "Number of agents", "seed": "Seed", "regrowth_rate": "Regrowth rate",
          "vision_min": "Shortest vision", "vision_max": "Longest vision",
          "no_regrow_patches": "Patches that never regrow", "lifespan": "Lifespan",
          "reproduction": "Reproduction", "reproduction_threshold": "Reproduction threshold",
          "steps": "Number of steps"}


# Loads a Python file of the project as a module, by its path.
# module_name: the name to register it under. relative_path: the file's path inside the project.
def load_module(module_name, relative_path):
    spec = importlib.util.spec_from_file_location(module_name, os.path.join(PROJECT_DIR, relative_path))
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


# The model. Both run_simulations.py files import it by the name "sugarscape", so it is registered
# under that name first. project/sugarscape.py is the same file byte for byte (tests/test_rules.py).
model = load_module("sugarscape", "assignment/sugarscape.py")

# The run_simulations.py of each coursework. Both files have the same name, so each is registered
# under its own module name.
RUN_FILES = {}
for folder in COURSEWORKS:
    RUN_FILES[folder] = load_module(folder + "_run_simulations", folder + "/run_simulations.py")


# Lists the cells that hold sugar and, of those, the ones that never regrow, as [x, y] pairs.
# world: a Sugarscape object.
def sugary_cells(world):
    sugary, no_regrow = [], []
    for y in range(world.height):
        for x in range(world.width):
            if world.capacity[y][x] > 0:
                sugary.append([x, y])
                if not world.regrows[y][x]:
                    no_regrow.append([x, y])
    return sugary, no_regrow


# How many cells hold sugar: the most patches that can be made never to regrow.
SUGARY_CELLS = len(sugary_cells(model.Sugarscape(num_agents=0))[0])


# Finds one saved run. Raises LookupError with a plain message if there is no such run.
# coursework: "assignment" or "project". run_name: the run's name, for example "01_base_100".
def find_run(coursework, run_name):
    if coursework not in RUN_FILES:
        raise LookupError("There is no coursework called '%s'." % coursework)
    for run in RUN_FILES[coursework].RUNS:
        if run["name"] == run_name:
            return run
    raise LookupError("The %s has no run called '%s'." % (COURSEWORKS[coursework], run_name))


# Checks that a setting is a whole number within limits, and gives it back as an int.
# name: the setting's name (its label goes in the message). value: the value sent. low, high: limits.
def whole_number(name, value, low, high):
    label = LABELS[name]
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value != int(value):
        raise ValueError("%s must be a whole number." % label)
    if not low <= value <= high:
        raise ValueError("%s must be from %d to %d." % (label, low, high))
    return int(value)


# Checks the settings sent by the Simulate page and fills in the defaults.
# given: dict of setting name to value. Returns the settings to pass to Sugarscape.
def check_settings(given):
    if not isinstance(given, dict):
        raise ValueError("The settings must be sent as a list of names and values.")
    for name in given:
        if name not in EDITABLE_SETTINGS:
            raise ValueError("The setting '%s' cannot be changed here." % name)
    settings = {}
    for name in EDITABLE_SETTINGS:
        settings[name] = given.get(name, model.DEFAULT_SETTINGS[name])
    settings["num_agents"] = whole_number("num_agents", settings["num_agents"], 1, MAX_AGENTS)
    settings["seed"] = whole_number("seed", settings["seed"], 0, 2_147_483_647)
    settings["vision_min"] = whole_number("vision_min", settings["vision_min"], 1, MAX_VISION)
    settings["vision_max"] = whole_number("vision_max", settings["vision_max"],
                                          settings["vision_min"], MAX_VISION)
    settings["no_regrow_patches"] = whole_number("no_regrow_patches", settings["no_regrow_patches"],
                                                 0, SUGARY_CELLS)
    settings["reproduction_threshold"] = whole_number("reproduction_threshold",
                                                      settings["reproduction_threshold"], 1, MAX_THRESHOLD)
    rate = settings["regrowth_rate"]
    if isinstance(rate, bool) or not isinstance(rate, (int, float)) or not 0 <= rate <= MAX_REGROWTH:
        raise ValueError("Regrowth rate must be a number from 0 to %d." % MAX_REGROWTH)
    for name in ["lifespan", "reproduction"]:
        if not isinstance(settings[name], bool):
            raise ValueError("%s must be on or off." % LABELS[name])
    return settings


# Works out what to run from a request: a saved run named by its coursework and name, or settings and
# a number of steps. request: the dict sent by the web app.
# Returns (coursework, run, settings, steps); coursework and run are None for settings of one's own.
def read_request(request):
    if not isinstance(request, dict):
        raise ValueError("The request must name a saved run, or give settings and a number of steps.")
    if request.get("run") is not None:
        coursework = request.get("coursework")
        run = find_run(coursework, request["run"])
        settings = dict(run["settings"])
        settings["seed"] = RUN_FILES[coursework].REPEAT_SEEDS[0]  # as run_simulations.py does
        return coursework, run, settings, run["steps"]
    steps = whole_number("steps", request.get("steps"), 1, MAX_STEPS)
    return None, None, check_settings(request.get("settings")), steps


# Runs one simulation through the model's own step(), keeping what the CSV files hold and, for
# playback, the sugar on every cell at every step. It repeats the loop of simulate() in
# run_simulations.py, which does not return the sugar on the cells.
# settings: Sugarscape settings, including "seed". steps: number of time steps.
# Returns (world, agent_rows, step_rows, frames), with step 0 included.
def run_world(settings, steps):
    world = model.Sugarscape(**settings)
    agent_rows, step_rows, frames = [], [], []
    for step in range(steps + 1):
        if step > 0:
            world.step()
        rows = world.agent_rows()
        summary = world.summary()
        agent_rows.extend(rows)
        step_rows.append([summary[name] for name in model.STEP_COLUMNS])
        sugar = playback.sugar_text(world)
        frames.append(playback.make_frame(world.time, rows, model.AGENT_COLUMNS, sugar))
    return world, agent_rows, step_rows, frames


# Reads one saved CSV file of a run exactly as written, or gives None if it is missing.
# coursework: the folder. run_name: the run. table: "agents" or "steps".
def saved_text(coursework, run_name, table):
    path = os.path.join(PROJECT_DIR, coursework, "data", "%s_%s.csv" % (run_name, table))
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8", newline="") as handle:
        return handle.read()


# Compares a fresh run with its saved CSV files, byte for byte.
# coursework, run_name: the saved run. texts: the fresh CSV text of each table ("agents", "steps").
def compare_with_saved(coursework, run_name, texts):
    answer = {"coursework": coursework, "run": run_name}
    for table in ("agents", "steps"):
        saved = saved_text(coursework, run_name, table)
        answer[table + "_file"] = "%s/data/%s_%s.csv" % (coursework, run_name, table)
        answer[table + "_identical"] = None if saved is None else saved == texts[table]
    return answer


# Runs a simulation for the Simulate and Experiments pages and gives everything playback needs.
# request: {"coursework", "run"} for a saved run, or {"settings", "steps"}. Returns JSON text.
def run_for_playback(request):
    coursework, run, settings, steps = read_request(request)
    world, agent_rows, step_rows, frames = run_world(settings, steps)
    shown = {}
    for name in EDITABLE_SETTINGS:
        shown[name] = world.settings[name]
    no_regrow = sugary_cells(world)[1]  # these marks are set at step 0 and never change
    to_text = RUN_FILES[coursework or "assignment"].rows_to_csv_text  # the same function in both files
    texts = {"agents": to_text(model.AGENT_COLUMNS, agent_rows),
             "steps": to_text(model.STEP_COLUMNS, step_rows)}
    tables = {}
    for table, text in texts.items():
        size = len(text.encode("utf-8"))
        tables[table] = {"bytes": size, "sendable": size <= MAX_RESPONSE_BYTES}
    answer = {"settings": shown, "steps": steps, "width": world.width, "height": world.height,
              "step_columns": model.STEP_COLUMNS,
              "step_rows": [[playback.short_number(value) for value in row] for row in step_rows],
              "traits": playback.agent_traits(agent_rows, model.AGENT_COLUMNS), "no_regrow": no_regrow,
              "tables": tables, "max_bytes": MAX_RESPONSE_BYTES, "saved": None}
    if run is not None:
        answer["saved"] = compare_with_saved(coursework, run["name"], texts)
    return playback.fit_frames(answer, frames, MAX_RESPONSE_BYTES)


# Runs a simulation with the coursework's own simulate() and gives one of its tables as CSV text,
# exactly as run_simulations.py would write it.
# request: as for run_for_playback. table: "agents" or "steps". Returns {"file_name", "csv"}.
def run_as_csv(request, table):
    if table not in ("agents", "steps"):
        raise ValueError("The table must be 'agents' or 'steps'.")
    coursework, run, settings, steps = read_request(request)
    run_file = RUN_FILES[coursework or "assignment"]  # both files hold the same simulate()
    agent_rows, step_rows = run_file.simulate(settings, steps)
    if table == "agents":
        text = run_file.rows_to_csv_text(model.AGENT_COLUMNS, agent_rows)
    else:
        text = run_file.rows_to_csv_text(model.STEP_COLUMNS, step_rows)
    if len(text.encode("utf-8")) > MAX_RESPONSE_BYTES:
        raise ValueError("This table is %.1f MB, more than the %d MB the server sends at once. Download "
                         "the steps table instead, or run fewer agents or steps."
                         % (len(text) / 1e6, MAX_RESPONSE_BYTES // 1_000_000))
    name = run["name"] if run else "custom_run"
    return {"file_name": "%s_%s.csv" % (name, table), "csv": text}
