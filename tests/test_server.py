# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       tests/test_server.py
# Purpose:    Checks the web app's server: every saved run re-runs to identical CSV text, no answer is
#             larger than 4 MB, the limits are enforced, and the viewer refuses paths outside the project.
#             It starts the server on a free port of this computer and prints one PASS or FAIL line per check.
# Run with:   python tests/test_server.py

import json
import os
import socket
import sys
import threading
import time
import urllib.error
import urllib.request

# The folder that holds the "app", "assignment" and "project" folders.
LAB_FOLDER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(LAB_FOLDER, "app"))
import server  # noqa: E402
import simulation  # noqa: E402

# The largest answer the server may send, in bytes (the hosting allows 4.5 MB).
LIMIT = 4_000_000

# The address of the server started by start_server.
BASE = {"url": ""}


# Starts the server in the background on a free port and waits until it answers. No parameters.
def start_server():
    import uvicorn
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    running = uvicorn.Server(uvicorn.Config(server.app, host="127.0.0.1", port=port, log_level="warning"))
    threading.Thread(target=running.run, daemon=True).start()
    while not running.started:
        time.sleep(0.05)
    BASE["url"] = "http://127.0.0.1:%d" % port


# Sends one request and gives back (status code, body as bytes).
# path: the address after the host, such as "/api/status". body: a dict sent as JSON (POST), or None (GET).
def call(path, body=None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    method = "GET" if body is None else "POST"
    request = urllib.request.Request(BASE["url"] + path, data=data, method=method,
                                     headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=120) as answer:
            return answer.status, answer.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


# Raises AssertionError with a message when a condition is false.
# condition: what must be true; message: what to report if it is not.
def expect(condition, message):
    if not condition:
        raise AssertionError(message)


# Check 1: status, the list of runs with their numbers, and the saved steps of every run.
def check_lists():
    status, body = call("/api/status")
    answer = json.loads(body)
    expect(status == 200 and answer["hosted"] is False, "status: %s" % answer)
    status, body = call("/api/experiments")
    courseworks = json.loads(body)["courseworks"]
    expect([len(item["runs"]) for item in courseworks] == [10, 3], "expected 10 and 3 runs")
    for item in courseworks:
        with open(os.path.join(LAB_FOLDER, item["id"], "results", "results.json"), encoding="utf-8") as handle:
            saved = json.load(handle)
        for run in item["runs"]:
            expect(run["numbers"] == saved[run["name"]], "numbers of %s differ" % run["name"])
            status, body = call("/api/steps?coursework=%s&run=%s" % (item["id"], run["name"]))
            expect(status == 200 and len(json.loads(body)["rows"]) == run["steps"] + 1,
                   "steps of %s" % run["name"])


# Check 2: every saved run of both pieces of coursework re-runs to identical CSV text, in an
# answer smaller than the limit.
def check_saved_runs():
    for coursework, run_file in simulation.RUN_FILES.items():
        for run in run_file.RUNS:
            status, body = call("/api/run", {"coursework": coursework, "run": run["name"]})
            expect(status == 200, "%s %s: status %d" % (coursework, run["name"], status))
            expect(len(body) <= LIMIT, "%s %s: %d bytes" % (coursework, run["name"], len(body)))
            saved = json.loads(body)["saved"]
            expect(saved["agents_identical"] is True and saved["steps_identical"] is True,
                   "%s %s does not match its saved files" % (coursework, run["name"]))


# Check 3: the CSV download is the saved text; a table over the limit is refused with a message, and
# a run says beforehand which of its tables are too large to send.
def check_csv_download():
    downloads = [("assignment", "01_base_100", "agents"), ("project", "03_reproduction_death_scarce", "steps")]
    for coursework, name, table in downloads:
        status, body = call("/api/run-csv?table=" + table, {"coursework": coursework, "run": name})
        expect(status == 200, "run-csv status %d" % status)
        expect(json.loads(body)["csv"] == simulation.saved_text(coursework, name, table), name + " differs")
    status, body = call("/api/run-csv?table=agents", {"coursework": "project", "run": "02_reproduction_death"})
    expect(status == 400 and "MB" in json.loads(body)["detail"], "a large table must be refused")
    status, body = call("/api/run", {"coursework": "project", "run": "02_reproduction_death"})
    tables = json.loads(body)["tables"]
    expect(tables["agents"]["sendable"] is False and tables["steps"]["sendable"] is True,
           "the run must say which tables are too large to send: %s" % tables)


# Check 4: the limits on agents, steps and settings, and the largest run allowed stays under 4 MB
# with fewer frames but every step's numbers.
def check_limits():
    refused = [{"settings": {"num_agents": 801}, "steps": 10}, {"settings": {}, "steps": 501},
               {"settings": {"width": 20}, "steps": 10},
               {"settings": {"vision_min": 5, "vision_max": 2}, "steps": 10}]
    for body in refused:
        status, answer = call("/api/run", body)
        expect(status == 400 and json.loads(answer)["detail"], "not refused: %s" % body)
    largest = {"settings": {"num_agents": 800, "reproduction": True, "reproduction_threshold": 20}, "steps": 500}
    status, body = call("/api/run", largest)
    answer = json.loads(body)
    expect(status == 200 and len(body) <= LIMIT, "largest run: status %d, %d bytes" % (status, len(body)))
    expect(answer["frame_every"] > 1 and len(answer["step_rows"]) == 501, "frames were not thinned")
    expect(answer["frames"][-1]["step"] == 500, "the last step must be kept")


# Check 5: the viewer, the figures and the folder opener refuse paths outside the project.
def check_paths():
    for path in ["../plans/stage-2-app.md", "/etc/passwd", "assignment/../../README.md", "app/../../x"]:
        status, _ = call("/api/file?path=" + urllib.request.quote(path))
        expect(status == 403, "viewer gave %d for %s" % (status, path))
    status, body = call("/api/file?path=assignment/sugarscape.py")
    expect(status == 200 and "class Sugarscape" in json.loads(body)["text"], "viewer must show a project file")
    status, _ = call("/api/figure?path=" + urllib.request.quote("assignment/sugarscape.py"))
    expect(status == 403, "figure endpoint sent a non-figure")
    status, _ = call("/api/figure?path=assignment/figures/fig01_landscape.png")
    expect(status == 200, "figure endpoint must send a figure")
    status, _ = call("/api/open-folder?path=..", {})
    expect(status == 403, "open-folder accepted a path outside the project")


# Runs one check and prints PASS or FAIL. Returns True when it passed.
# label: the name printed; check: the function to run.
def run_check(label, check):
    try:
        check()
    except Exception as problem:
        print("FAIL  " + label + "  (" + type(problem).__name__ + ": " + str(problem) + ")")
        return False
    print("PASS  " + label)
    return True


# Starts the server, runs every check and exits with an error code if any fails.
def main():
    start_server()
    results = [
        run_check("1 status, runs with their numbers, saved steps", check_lists),
        run_check("2 every saved run re-runs to identical CSV text, under 4 MB", check_saved_runs),
        run_check("3 CSV download equals the saved text; large tables refused", check_csv_download),
        run_check("4 limits enforced; the largest run fits in 4 MB", check_limits),
        run_check("5 paths outside the project refused", check_paths),
    ]
    if not all(results):
        sys.exit(1)


if __name__ == "__main__":
    main()
