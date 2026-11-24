<!--
Name:       Nikita Devi Gurumayum
Student ID: SCSJ2400109
Module:     6COM2012 Social and Collective Artificial Intelligence
File:       README.md
Purpose:    What the project is, the three ways to use it, how to start the app, how to run the
            simulations from a terminal, what to do if a step fails, and where everything lives.
-->
 
# Sugarscape Lab

A Sugarscape simulation for the module 6COM2012 Social and Collective Artificial Intelligence: a grid
world where simple agents look for sugar, move to it and burn it to stay alive. It holds two pieces of
coursework, the **Assignment** and the **Project**, which share the same model.

There are three ways to use it, from the simplest:

1. **The coursework files run with Python alone.** Each coursework is three Python files and the CSV
   files they write. They need only Python (and matplotlib to redraw the figures). They are complete
   without the web app.
2. **The interface starts on any computer with one command** (see "Start the app" below). It is an
   extra: a web page that runs the same Python files, adds no rules of its own, and shows the world
   running, every required run and an explanation of the code.
3. **A hosted copy can be tried without installing anything.**

## Start the app

You need **Python 3.9 or newer**. The first start also needs the internet, to install three packages
(FastAPI, uvicorn and matplotlib). After that the app works offline.

**On a Mac (or Linux)**

1. Open the Terminal app.
2. Type `cd ` (with a space after it), drag the `sugarscape-lab` folder onto the Terminal window, and press Enter.
3. Type `sh start.sh` and press Enter.

**On Windows:** double-click `start.bat`.

The first time, the script makes a Python environment in a folder called `.venv` and installs the
packages. Then the browser opens at <http://127.0.0.1:8000>. Keep the Terminal (or Command Prompt)
window open while you use the app. To stop it, press Ctrl+C in that window, or close it.

## Run the simulations from a terminal

Open a terminal in the `assignment` folder (or the `project` folder). On Windows, open the folder in
File Explorer, click the address bar, type `cmd` and press Enter. On a Mac, open Terminal, type `cd `
and drag the folder onto the window. Then:

```
python run_simulations.py      # runs every simulation and writes the data folder
python analyse_results.py      # reads the CSV files and writes results/ and figures/
```

On a Mac type `python3` in place of `python`; on Windows, if `python` is not found, type `py`.
`run_simulations.py` needs nothing but Python. `analyse_results.py` also needs matplotlib, installed
once with `python -m pip install matplotlib`. Each coursework folder has the same steps in `HOW_TO_RUN.txt`. The
checks of the rules and of the saved files run with `python tests/test_rules.py` from the
`sugarscape-lab` folder, and the checks of the web server with `python tests/test_server.py`.

## If something goes wrong

- **"Python 3.9 or newer was not found."** Install Python from <https://www.python.org/downloads/>
  (on Windows, tick "Add python.exe to PATH"), then run the script again. On a Mac, if a window asks to
  install the "command line developer tools", click Install, wait for it to finish, and run the script again.
- **"The packages could not be installed."** Check the internet connection, then run the script again.
  If it still fails, delete the `.venv` folder and run the script again.
- **"Address already in use."** The app (or another program) is already using port 8000. Try
  <http://127.0.0.1:8000> in the browser. To use another port: `SUGARSCAPE_PORT=8001 sh start.sh`
  (on Windows, in a Command Prompt: `set SUGARSCAPE_PORT=8001`, then `start.bat`).
- **The page says a results file is missing.** Run the two scripts above in that coursework's folder.
- **The page says the web app has not been built.** See "Rebuild the web app" below.
- **Starting by hand**, from the `sugarscape-lab` folder:
  `python3 -m venv .venv`, then `.venv/bin/python -m pip install -r requirements.txt -r requirements-analysis.txt`,
  then `.venv/bin/python app/server.py` (on Windows, use `.venv\Scripts\python` instead of `.venv/bin/python`).

## Rebuild the web app

Only needed after changing the files in `web/src`. It needs Node.js:

```
cd web
npm install
npm run build
```

The built app is in `web/dist`, which the server sends to the browser, so Node.js is not needed to run
the app.

## Put it online

The app is ready to host on Vercel. Vercel finds the FastAPI app in `app/server.py` by itself, runs it
as one Python function (Python 3.12 by default) and installs only the packages in `requirements.txt`;
matplotlib, in `requirements-analysis.txt`, is not installed there. `.vercelignore` keeps
`web/node_modules` and Python's caches out of the upload. No other file is needed.

To put it online, from the `sugarscape-lab` folder, with Node.js installed and a Vercel account:

```
npx vercel deploy
```

Or import the project's repository on the Vercel website. Vercel sets the `VERCEL` environment variable,
which `app/server.py` checks: in the hosted copy the folder buttons of the Project map are hidden and
nothing is written to disk. A hosted answer may be at most 4.5 MB and take at most 300 seconds; the
server keeps every answer under 4 MB, and the largest run takes a few seconds.

## Where everything lives

```
sugarscape-lab/
  assignment/          the Assignment
    sugarscape.py        the model: the world, the agents and every rule
    run_simulations.py   the ten runs; writes data/
    analyse_results.py   reads data/; writes results/ and figures/
    data/                one _agents.csv and one _steps.csv per run, repeats.csv, README.txt
    results/             results.json and comparison_table.csv
    figures/             the figures
  project/             the Project, in the same layout, with its three runs
  tests/               test_rules.py (the model and the saved files), test_server.py (the web server)
  app/                 the web server: server.py; simulation.py, which calls the coursework's files;
                       playback.py, which packs a run for playback
  web/                 the web app: source in src/, built app in dist/
  requirements.txt     the packages of the web server
  requirements-analysis.txt   matplotlib, for analyse_results.py
  start.sh, start.bat  start the app
  .vercelignore        what is left out of the upload to Vercel
```

**What belongs to which coursework.** The Assignment is `assignment/sugarscape.py`,
`assignment/run_simulations.py` and `assignment/analyse_results.py`, with the CSV files in
`assignment/data/`. The Project is `project/sugarscape.py`, `project/run_simulations.py` and
`project/analyse_results.py`, with the CSV files in `project/data/`. The two `sugarscape.py` files are
the same file. The interface's own files (`app/`, `web/`, `tests/test_server.py`, the start scripts,
the requirements files, `.vercelignore` and this README) are part of neither.

The app's **Project map** page lists every folder and file with one line about each, and opens any
code file in a read-only viewer.
