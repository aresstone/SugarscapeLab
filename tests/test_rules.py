# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       test_rules.py
# Purpose:    Checks that the Sugarscape rules behave as written and that the saved CSV files
#             match the simulations. Prints one PASS or FAIL line per check.
# Run with:   python tests/test_rules.py

import importlib
import os
import sys

# The folder that holds the "tests", "assignment" and "project" folders.
LAB_FOLDER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The two folders whose data and code are checked.
COURSEWORK_FOLDERS = ["assignment", "project"]

sys.path.insert(0, os.path.join(LAB_FOLDER, "assignment"))
from sugarscape import Sugarscape, Agent, AGENT_COLUMNS, STEP_COLUMNS, gini  # noqa: E402


# Raises AssertionError with a message when a condition is false.
# condition: what must be true; message: what to report if it is not.
def expect(condition, message):
    if not condition:
        raise AssertionError(message)


# A world on a 50 by 50 grid with no agents and no sugar anywhere (capacity kept as built).
# settings: extra Sugarscape settings.
def blank_world(**settings):
    world = Sugarscape(num_agents=0, **settings)
    world.sugar = [[0] * world.width for _ in range(world.height)]
    return world


# Puts a new agent on the world at (x, y) and returns it.
# world: the Sugarscape; x, y: the cell; sugar, vision, metabolism: agent values;
# founder_id: ancestor id.
def place(world, x, y, sugar=10, vision=3, metabolism=1, founder_id=None):
    agent_id = world.next_id
    world.next_id += 1
    if founder_id is None:
        founder_id = agent_id
    agent = Agent(agent_id, x, y, sugar, vision, metabolism, 80, founder_id)
    world.agents.append(agent)
    world.occupant[y][x] = agent
    return agent


# Check 1: movement choice, vision limit, occupied cells and sugar bookkeeping.
def check_movement():
    world = blank_world()
    place(world, 10, 11, sugar=5)
    world.sugar[10][13] = 6
    world.sugar[8][10] = 6
    world.sugar[11][10] = 9
    world.sugar[14][10] = 9
    world.sugar[10][7] = 3
    agent = place(world, 10, 10, sugar=20, vision=3, metabolism=2)
    expect(world.choose_cell(agent) == (10, 8), "tie should go to the nearer cell")
    collected = world.move_agent(agent)
    expect((agent.x, agent.y) == (10, 8), "agent did not move to the chosen cell")
    expect(collected == 6 and agent.sugar == 20 + 6 - 2, "sugar must be start + collected - metabolism")
    expect(world.sugar[8][10] == 0 and world.occupant[10][10] is None, "cell not emptied")
    world.sugar[10][13] = 8
    other = place(world, 30, 30, vision=3)
    world.sugar[30][33] = 8
    world.sugar[30][27] = 8
    expect(world.choose_cell(other) in [(33, 30), (27, 30)], "equal ties must pick one of the tied cells")
    wrapper = place(world, 0, 0, vision=2)
    world.sugar[0][49] = 5
    expect(world.choose_cell(wrapper) == (49, 0), "the edges must wrap")
    stayer = place(world, 40, 40, vision=2)
    expect(world.choose_cell(stayer) == (40, 40), "with no sugar in view the agent stays put")


# Check 2: regrowth up to capacity, and patches that never regrow.
def check_regrowth():
    world = blank_world(regrowth_rate=0.25)
    world.capacity[5][5] = 1
    for _ in range(3):
        world.regrow()
    expect(world.sugar[5][5] == 0.75, "cell should have regained 0.25 per step")
    for _ in range(10):
        world.regrow()
    expect(world.sugar[5][5] == 1, "sugar must stop at the capacity")
    world.regrows[5][5] = False
    world.sugar[5][5] = 0
    world.regrow()
    expect(world.sugar[5][5] == 0, "a patch marked as not regrowing must stay empty")
    sim = Sugarscape(no_regrow_patches=300, seed=3)
    fixed = [(x, y) for y in range(50) for x in range(50) if not sim.regrows[y][x]]
    expect(len(fixed) == 300, "wrong number of patches that never regrow")
    for _ in range(30):
        before = [sim.sugar[y][x] for x, y in fixed]
        sim.step()
        after = [sim.sugar[y][x] for x, y in fixed]
        expect(all(b >= a for b, a in zip(before, after)), "a fixed patch gained sugar")


# Check 3: starvation removes the agent.
def check_starvation():
    world = blank_world()
    hungry = place(world, 5, 5, sugar=1, metabolism=1)
    fed = place(world, 20, 20, sugar=5, metabolism=1)
    world.move_agent(hungry)
    world.move_agent(fed)
    expect(world.check_death(hungry) == "starved", "agent with 0 sugar should starve")
    expect(hungry not in world.agents and world.occupant[5][5] is None, "dead agent not removed")
    expect(world.check_death(fed) is None and fed in world.agents, "a fed agent must live")


# Check 4: old age only happens when lifespan is on.
def check_lifespan():
    settings = {"num_agents": 100, "initial_sugar_min": 1000, "initial_sugar_max": 1000,
                "metabolism_min": 1, "metabolism_max": 1, "max_age_min": 5, "max_age_max": 10}
    short = Sugarscape(lifespan=True, **settings)
    long_lived = Sugarscape(lifespan=False, **settings)
    old_age_deaths = 0
    for _ in range(30):
        short.step()
        long_lived.step()
        old_age_deaths += short.deaths_old_age
        expect(all(a.age < a.max_age for a in short.agents), "an agent outlived its max_age")
        expect(long_lived.deaths_old_age == 0, "death by old age while lifespan is off")
    expect(old_age_deaths == 100 and len(short.agents) == 0, "every agent should die of old age")
    expect(len(long_lived.agents) == 100 and long_lived.agents[0].age == 30, "agents must live on")


# Check 5: reproduction rule.
def check_reproduction():
    world = blank_world(reproduction=True, reproduction_threshold=50)
    poor = place(world, 10, 10, sugar=49)
    expect(world.reproduce(poor) is None and poor.sugar == 49, "birth below the threshold")
    rich = place(world, 25, 25, sugar=51, vision=4, metabolism=3, founder_id=7)
    child = world.reproduce(rich)
    expect(child is not None, "no birth at or above the threshold")
    distance = abs(child.x - 25) + abs(child.y - 25)
    expect(distance == 1, "child must stand on a neighbouring cell")
    expect(child.sugar == 25 and rich.sugar == 26, "child gets half rounded down, parent keeps the rest")
    expect(child.vision == 4 and child.metabolism == 3 and child.founder_id == 7, "traits not inherited")
    expect(child.age == 0 and child in world.agents and world.occupant[child.y][child.x] is child,
           "child not placed correctly")
    edge = place(world, 0, 0, sugar=50)
    child_at_edge = world.reproduce(edge)
    expect(child_at_edge is not None and edge.sugar == 25, "exactly the threshold should reproduce")
    boxed = place(world, 40, 40, sugar=90)
    for x, y in [(41, 40), (39, 40), (40, 41), (40, 39)]:
        place(world, x, y)
    expect(world.reproduce(boxed) is None and boxed.sugar == 90, "no birth without an empty neighbour")
    off = blank_world()
    expect(off.reproduce(place(off, 3, 3, sugar=500)) is None, "birth while reproduction is off")


# Check 6: over a full run no two agents share a cell and sugar stays within bounds.
def check_invariants():
    world = Sugarscape(num_agents=300, lifespan=True, reproduction=True, reproduction_threshold=30,
                       seed=11)
    for _ in range(100):
        world.step()
        cells = set((a.x, a.y) for a in world.agents)
        expect(len(cells) == len(world.agents), "two agents share a cell")
        for y in range(world.height):
            for x in range(world.width):
                expect(0 <= world.sugar[y][x] <= world.capacity[y][x], "sugar outside 0..capacity")
    expect(gini([5, 5, 5]) == 0 and gini([0, 0, 10]) > 0.6 and gini([4]) == 0, "gini function wrong")


# Check 7: same settings and seed give the same CSV text; another seed does not.
def check_same_csv_text():
    run_simulations = load_run_simulations("assignment")
    settings = {"num_agents": 100, "lifespan": True, "reproduction": True, "seed": 4}
    first = run_simulations.simulate(settings, 40)
    second = run_simulations.simulate(settings, 40)
    other = run_simulations.simulate(dict(settings, seed=5), 40)
    texts = []
    for data in (first, second, other):
        texts.append(run_simulations.rows_to_csv_text(AGENT_COLUMNS, data[0]) +
                     run_simulations.rows_to_csv_text(STEP_COLUMNS, data[1]))
    expect(texts[0] == texts[1], "same seed gave different text")
    expect(texts[0] != texts[2], "different seed gave the same text")


# The starting values of every agent that the checks compare.
# world: a Sugarscape at step 0.
def start_of(world):
    return [(a.agent_id, a.x, a.y, a.sugar, a.metabolism) for a in world.agents]


# Check 8: the start (positions, sugar, metabolism) does not depend on vision or switches.
def check_same_start():
    plain = Sugarscape(seed=9, num_agents=200)
    changed = Sugarscape(seed=9, num_agents=200, vision_min=7, vision_max=12, lifespan=True,
                         reproduction=True, regrowth_rate=0.25, no_regrow_patches=100)

    expect(start_of(plain) == start_of(changed), "starting agents differ between scenarios")


# Reads a text file exactly as stored (no newline translation).
# path: the file to read.
def read_exact(path):
    with open(path, "r", encoding="utf-8", newline="") as handle:
        return handle.read()


# Imports run_simulations.py from one coursework folder (a fresh copy each time).
# folder_name: "assignment" or "project".
def load_run_simulations(folder_name):
    folder = os.path.join(LAB_FOLDER, folder_name)
    sys.path.insert(0, folder)
    for module_name in ("run_simulations", "sugarscape"):
        sys.modules.pop(module_name, None)
    try:
        return importlib.import_module("run_simulations")
    finally:
        sys.path.remove(folder)


# Splits CSV text into rows of text cells, without the header.
# text: the content of a CSV file.
def csv_body(text):
    lines = text.split("\n")[1:]
    return [line.split(",") for line in lines if line != ""]


# Check 9: agents CSV has one row per living agent per step, matching the steps CSV.
# folder_name: "assignment" or "project".
def check_csv_row_counts(folder_name):
    run_simulations = load_run_simulations(folder_name)
    data = os.path.join(LAB_FOLDER, folder_name, "data")
    for run in run_simulations.RUNS:
        agent_rows = csv_body(read_exact(os.path.join(data, run["name"] + "_agents.csv")))
        step_rows = csv_body(read_exact(os.path.join(data, run["name"] + "_steps.csv")))
        expect(len(step_rows) == run["steps"] + 1, run["name"] + ": wrong number of steps")
        counts = {}
        seen = set()
        for row in agent_rows:
            step = int(row[0])
            counts[step] = counts.get(step, 0) + 1
            expect((step, row[1]) not in seen, run["name"] + ": agent twice in one step")
            seen.add((step, row[1]))
        for row in step_rows:
            step = int(row[0])
            expect(counts.get(step, 0) == int(row[1]), run["name"] + ": row count differs at step %d" % step)


# Check 10: every saved CSV equals a fresh run with the reference seed.
# folder_name: "assignment" or "project".
def check_csv_match_fresh_run(folder_name):
    run_simulations = load_run_simulations(folder_name)
    data = os.path.join(LAB_FOLDER, folder_name, "data")
    for run in run_simulations.RUNS:
        settings = dict(run["settings"])
        settings["seed"] = run_simulations.REPEAT_SEEDS[0]
        agent_rows, step_rows = run_simulations.simulate(settings, run["steps"])
        fresh_agents = run_simulations.rows_to_csv_text(AGENT_COLUMNS, agent_rows)
        fresh_steps = run_simulations.rows_to_csv_text(STEP_COLUMNS, step_rows)
        expect(read_exact(os.path.join(data, run["name"] + "_agents.csv")) == fresh_agents,
               run["name"] + ": agents CSV differs from a fresh run")
        expect(read_exact(os.path.join(data, run["name"] + "_steps.csv")) == fresh_steps,
               run["name"] + ": steps CSV differs from a fresh run")


# Check 11: the model file is identical in both folders.
def check_identical_model_files():
    paths = [os.path.join(LAB_FOLDER, name, "sugarscape.py") for name in COURSEWORK_FOLDERS]
    contents = []
    for path in paths:
        with open(path, "rb") as handle:
            contents.append(handle.read())
    expect(contents[0] == contents[1], "sugarscape.py differs between assignment and project")


# Runs one check and prints PASS or FAIL. Returns True when it passed.
# label: text shown on the line; function: the check; arguments: values passed to it.
def run_check(label, function, *arguments):
    try:
        function(*arguments)
    except Exception as problem:
        print("FAIL  " + label + "  (" + type(problem).__name__ + ": " + str(problem) + ")")
        return False
    print("PASS  " + label)
    return True


# Runs all eleven checks and exits with an error code if any fails.
def main():
    results = [
        run_check("1 movement and sugar bookkeeping", check_movement),
        run_check("2 regrowth and fixed patches", check_regrowth),
        run_check("3 starvation", check_starvation),
        run_check("4 lifespan", check_lifespan),
        run_check("5 reproduction", check_reproduction),
        run_check("6 no shared cells, sugar within bounds", check_invariants),
        run_check("7 same seed same CSV text, other seed differs", check_same_csv_text),
        run_check("8 same start whatever vision and switches", check_same_start),
    ]
    for folder_name in COURSEWORK_FOLDERS:
        results.append(run_check("9 CSV row counts (" + folder_name + ")", check_csv_row_counts, folder_name))
        results.append(run_check("10 CSV equals fresh run (" + folder_name + ")",
                                 check_csv_match_fresh_run, folder_name))
    results.append(run_check("11 sugarscape.py identical in both folders", check_identical_model_files))
    if not all(results):
        sys.exit(1)


if __name__ == "__main__":
    main()
