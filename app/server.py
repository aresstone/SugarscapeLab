# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       app/server.py
# Purpose:    The web server: it answers the web app's requests under /api (simulation runs, the saved
#             runs and their results, the project map and the file viewer) and sends the built web app itself.

# Start it from the sugarscape-lab folder with either of:
#   python app/server.py              (then open http://127.0.0.1:8000)
#   uvicorn app.server:app --port 8000

import argparse
import csv
import io
import json
import os
import sys

sys.dont_write_bytecode = True  # the app writes nothing into the project, not even Python's cache files

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import file_viewer
import folder_opener
import project_map
import simulation
from file_viewer import PROJECT_DIR

WEB_DIST = os.path.join(PROJECT_DIR, "web", "dist")

# True when the app runs as the hosted copy. Vercel sets the VERCEL environment variable on its servers.
# When hosted, folders cannot be opened (there is no computer screen to open them on).
HOSTED = bool(os.environ.get("VERCEL"))

app = FastAPI(title="Sugarscape Lab")


# Reads the results.json of one coursework. coursework: "assignment" or "project".
# Returns (results, None), or (None, a plain message) if the file is missing or cannot be read.
def read_results(coursework):
    path = os.path.join(PROJECT_DIR, coursework, "results", "results.json")
    if not os.path.isfile(path):
        return None, (f"{coursework}/results/results.json is missing. Create it by running "
                      f"run_simulations.py and then analyse_results.py in the {coursework} folder.")
    try:
        with open(path, encoding="utf-8") as file:
            return json.load(file), None
    except (OSError, ValueError) as error:
        return None, f"{coursework}/results/results.json could not be read: {error}"


# Says whether the app is the hosted copy and whether each results file is there, so the app can
# explain what is missing. No parameters.
@app.get("/api/status")
def get_status():
    results = {}
    for coursework in simulation.COURSEWORKS:
        numbers, message = read_results(coursework)
        results[coursework] = {"available": numbers is not None, "message": message}
    return {"hosted": HOSTED, "results": results}


# Describes one coursework: its runs with their settings, their numbers from results.json (None if
# missing) and the paths of their files, and its figures.
# coursework: "assignment" or "project".
def describe_coursework(coursework):
    run_file = simulation.RUN_FILES[coursework]
    numbers, message = read_results(coursework)
    runs = []
    for run in run_file.RUNS:
        entry = dict(run)
        entry["numbers"] = numbers.get(run["name"]) if numbers else None
        entry["files"] = {"agents": f"{coursework}/data/{run['name']}_agents.csv",
                          "steps": f"{coursework}/data/{run['name']}_steps.csv"}
        runs.append(entry)
    figures = []
    figures_dir = os.path.join(PROJECT_DIR, coursework, "figures")
    if os.path.isdir(figures_dir):
        for name in sorted(os.listdir(figures_dir)):
            if name.endswith(".png"):
                figures.append(f"{coursework}/figures/{name}")
    return {"id": coursework, "title": simulation.COURSEWORKS[coursework],
            "run_file": f"{coursework}/run_simulations.py", "repeat_seeds": run_file.REPEAT_SEEDS,
            "results_available": numbers is not None, "results_message": message,
            "figures": figures, "runs": runs}


# Gives both pieces of coursework (see describe_coursework), the model's default settings, the
# settings the Simulate page may change and the limits of one run. No parameters.
@app.get("/api/experiments")
def get_experiments():
    return {"courseworks": [describe_coursework(name) for name in simulation.COURSEWORKS],
            "defaults": simulation.model.DEFAULT_SETTINGS, "editable": simulation.EDITABLE_SETTINGS,
            "limits": {"max_agents": simulation.MAX_AGENTS, "max_steps": simulation.MAX_STEPS,
                       "max_vision": simulation.MAX_VISION, "max_regrowth": simulation.MAX_REGROWTH,
                       "max_threshold": simulation.MAX_THRESHOLD, "sugary_cells": simulation.SUGARY_CELLS}}


# Gives the saved per-step rows of one run, read from its _steps.csv file, for the charts.
# coursework: "assignment" or "project". run: the run's name, for example "01_base_100".
@app.get("/api/steps")
def get_steps(coursework: str, run: str):
    try:
        simulation.find_run(coursework, run)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error))
    text = simulation.saved_text(coursework, run, "steps")
    if text is None:
        raise HTTPException(status_code=404, detail=f"{coursework}/data/{run}_steps.csv is missing. "
                            f"Create it by running run_simulations.py in the {coursework} folder.")
    table = list(csv.reader(io.StringIO(text)))
    rows = []
    for row in table[1:]:
        rows.append([float(value) if "." in value else int(value) for value in row])
    return {"columns": table[0], "rows": rows}


# Runs a simulation with the project's own Python files and returns what playback and the charts need.
# request: {"coursework": ..., "run": ...} to repeat a saved run (the answer then says whether the
#          result is identical to the saved CSV files), or {"settings": {...}, "steps": n}.
@app.post("/api/run")
def run_simulation(request: dict = Body(...)):
    try:
        return Response(simulation.run_for_playback(request), media_type="application/json")
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


# Runs the same simulation and gives one of its tables as CSV text, for download.
# request: as for /api/run. table: "agents" or "steps".
@app.post("/api/run-csv")
def run_csv(request: dict = Body(...), table: str = Query("steps")):
    try:
        return simulation.run_as_csv(request, table)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


# Gives the folder tree of the project with one line about each folder and file. No parameters.
@app.get("/api/project-map")
def get_project_map():
    return project_map.build_project_map()


# Gives the text of one project file for the read-only viewer.
# path: the file's path relative to the sugarscape-lab folder, for example "assignment/sugarscape.py".
@app.get("/api/file")
def get_file(path: str):
    try:
        return file_viewer.read_for_viewer(path)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error))
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))


# Opens a project folder in the computer's own file manager (Finder on a Mac, File Explorer on Windows).
# Refused in the hosted copy. path: the folder's path relative to the sugarscape-lab folder, for
#       example "assignment/data"; empty for the project folder itself.
@app.post("/api/open-folder")
def open_folder(path: str = ""):
    if HOSTED:
        raise HTTPException(status_code=403,
                            detail="Folders can only be opened when the app runs on this computer.")
    try:
        return folder_opener.open_in_file_manager(path)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error))
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error))


# Sends one figure drawn by analyse_results.py, for the viewer and the Experiments page.
# path: the figure's path relative to the project, for example "assignment/figures/fig01_landscape.png".
@app.get("/api/figure")
def get_figure(path: str):
    if not file_viewer.is_figure(path):
        raise HTTPException(status_code=403,
                            detail="Only the figures in assignment/figures and project/figures can be sent.")
    full_path = file_viewer.resolve_inside_project(path)
    return FileResponse(full_path, headers={"Cache-Control": "max-age=3600"})


# Sends the built web app. If it has not been built yet, a short page says how to build it.
if os.path.isdir(WEB_DIST):
    app.mount("/", StaticFiles(directory=WEB_DIST, html=True), name="web")
else:
    # Explains that the web app has not been built. No parameters.
    @app.get("/", response_class=HTMLResponse)
    def not_built():
        return ("<p style='font-family:sans-serif'>The web app has not been built yet. "
                "In the web folder run <code>npm install</code> and <code>npm run build</code>, "
                "then restart this server.</p>")


# Starts the server on this computer only (127.0.0.1). Reads --port from the command line.
# No parameters.
def main():
    import uvicorn
    parser = argparse.ArgumentParser(description="Start the Sugarscape Lab web server.")
    parser.add_argument("--port", type=int, default=8000, help="port number (default 8000)")
    args = parser.parse_args()
    uvicorn.run(app, host="127.0.0.1", port=args.port)


if __name__ == "__main__":
    main()
