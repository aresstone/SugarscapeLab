# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       sugarscape.py
# Purpose:    The Sugarscape model: a wrapping grid of sugar, agents that look, move, eat,
#             burn sugar, die and (optionally) reproduce. It has no output of its own.
# Run with:   (not run directly; it is imported by run_simulations.py and analyse_results.py)

import random
import statistics

# Every setting with its default value. Keyword arguments of Sugarscape may only use these names.
DEFAULT_SETTINGS = {
    "width": 50,                    # number of columns in the grid
    "height": 50,                   # number of rows in the grid
    "num_agents": 100,              # how many agents the simulation starts with
    "seed": 1,                      # seed of the random number generator
    "vision_min": 1,                # smallest vision an agent can start with
    "vision_max": 6,                # largest vision an agent can start with
    "metabolism_min": 1,            # smallest sugar burned per step
    "metabolism_max": 4,            # largest sugar burned per step
    "initial_sugar_min": 5,         # smallest starting sugar
    "initial_sugar_max": 25,        # largest starting sugar
    "regrowth_rate": 1,             # sugar a cell regains each step
    "no_regrow_patches": 0,         # how many cells with sugar never regrow
    "lifespan": False,              # True: agents die when their age reaches max_age
    "max_age_min": 60,              # smallest maximum age
    "max_age_max": 100,             # largest maximum age
    "reproduction": False,          # True: rich agents place a child on a neighbouring cell
    "reproduction_threshold": 50,   # sugar an agent needs before it can reproduce
}

# Column names of the per-agent rows (one row per living agent per step).
AGENT_COLUMNS = ["step", "agent_id", "x", "y", "sugar", "vision", "metabolism", "age", "founder_id"]

# Column names of the per-step summary rows.
STEP_COLUMNS = ["step", "population", "births", "deaths_starved", "deaths_old_age",
                "mean_sugar", "median_sugar", "gini", "sugar_on_grid", "sugar_collected",
                "mean_vision", "mean_metabolism", "share_on_rich_cells", "founders_alive"]

# Positions (x, y) of the two sugar hills.
PEAKS = [(37, 12), (12, 37)]

# Pairs (distance limit, capacity): a cell closer than the limit to a peak gets that capacity.
CAPACITY_BANDS = [(5, 4), (10, 3), (15, 2), (20, 1)]

# The four directions (dx, dy) an agent can look and step in.
DIRECTIONS = [(1, 0), (-1, 0), (0, 1), (0, -1)]

# A cell with at least this capacity counts as a rich cell.
RICH_CAPACITY = 3


# Gini coefficient of a list of numbers: 0 means everyone is equal, close to 1 means one holds all.
# values: the list of numbers (for example the sugar of every agent).
def gini(values):
    count = len(values)
    total = sum(values)
    if count < 2 or total <= 0:
        return 0.0
    ordered = sorted(values)
    weighted_sum = 0
    for position, value in enumerate(ordered, start=1):
        weighted_sum += (2 * position - count - 1) * value
    return weighted_sum / (count * total)


# One agent of the simulation. It only stores values; the rules live in Sugarscape.
# agent_id: unique number; x, y: its cell; sugar: sugar it holds; vision: how far it sees;
# metabolism: sugar burned per step; max_age: age at which it dies of old age (if lifespan is on);
# founder_id: the id of the starting agent it descends from.
class Agent:
    # Sets up a new agent with the given values and age 0.
    def __init__(self, agent_id, x, y, sugar, vision, metabolism, max_age, founder_id):
        self.agent_id = agent_id
        self.x = x
        self.y = y
        self.sugar = sugar
        self.vision = vision
        self.metabolism = metabolism
        self.age = 0
        self.max_age = max_age
        self.founder_id = founder_id


# The whole simulation: the sugar grid, the agents and the rules of one time step.
# settings: keyword arguments, each one a name from DEFAULT_SETTINGS (others raise ValueError).
class Sugarscape:
    # Checks the settings, builds the sugar grid and creates the starting agents.
    def __init__(self, **settings):
        for name in settings:
            if name not in DEFAULT_SETTINGS:
                raise ValueError("Unknown setting: " + name)
        self.settings = dict(DEFAULT_SETTINGS)
        self.settings.update(settings)
        self.width = self.settings["width"]
        self.height = self.settings["height"]
        self.rng = random.Random(self.settings["seed"])
        self.time = 0
        self.agents = []
        self.next_id = 1
        self.births = 0
        self.deaths_starved = 0
        self.deaths_old_age = 0
        self.sugar_collected = 0
        self.capacity = self.build_capacity()
        self.sugar = [list(row) for row in self.capacity]
        self.regrows = [[True] * self.width for _ in range(self.height)]
        self.occupant = [[None] * self.width for _ in range(self.height)]
        self.make_starting_agents()
        self.mark_fixed_patches()

    # Builds the capacity map (list of rows) from the distance to the nearer sugar peak.
    def build_capacity(self):
        capacity = []
        for y in range(self.height):
            row = []
            for x in range(self.width):
                row.append(self.capacity_at(x, y))
            capacity.append(row)
        return capacity

    # Capacity of one cell: the first band whose distance limit is above the distance to a peak.
    # x, y: the cell.
    def capacity_at(self, x, y):
        nearest = None
        for peak_x, peak_y in PEAKS:
            distance = ((x - peak_x) ** 2 + (y - peak_y) ** 2) ** 0.5
            if nearest is None or distance < nearest:
                nearest = distance
        for limit, band_capacity in CAPACITY_BANDS:
            if nearest < limit:
                return band_capacity
        return 0

    # Creates the starting agents, drawing random numbers in a fixed order (see the settings).
    def make_starting_agents(self):
        settings = self.settings
        cells = [(x, y) for y in range(self.height) for x in range(self.width)]
        self.rng.shuffle(cells)
        cells = cells[:settings["num_agents"]]
        sugar_low, sugar_high = settings["initial_sugar_min"], settings["initial_sugar_max"]
        metabolism_low, metabolism_high = settings["metabolism_min"], settings["metabolism_max"]
        sugars = [self.rng.randint(sugar_low, sugar_high) for _ in cells]
        metabolisms = [self.rng.randint(metabolism_low, metabolism_high) for _ in cells]
        age_low, age_high = settings["max_age_min"], settings["max_age_max"]
        max_ages = [self.rng.randint(age_low, age_high) for _ in cells]
        visions = [self.rng.randint(settings["vision_min"], settings["vision_max"]) for _ in cells]
        for index, (x, y) in enumerate(cells):
            agent = Agent(self.next_id, x, y, sugars[index], visions[index],
                          metabolisms[index], max_ages[index], self.next_id)
            self.next_id += 1
            self.agents.append(agent)
            self.occupant[y][x] = agent

    # Picks the cells that hold sugar but will never regrow it.
    def mark_fixed_patches(self):
        sugary_cells = [(x, y) for y in range(self.height) for x in range(self.width)
                        if self.capacity[y][x] > 0]
        self.rng.shuffle(sugary_cells)
        for x, y in sugary_cells[:self.settings["no_regrow_patches"]]:
            self.regrows[y][x] = False

    # Rule: every cell that may regrow gains regrowth_rate sugar, never above its capacity.
    def regrow(self):
        rate = self.settings["regrowth_rate"]
        for y in range(self.height):
            for x in range(self.width):
                if self.regrows[y][x]:
                    self.sugar[y][x] = min(self.capacity[y][x], self.sugar[y][x] + rate)

    # Lists (x, y, distance) for the agent's own cell and every empty cell it can see.
    # agent: the agent that is looking.
    def cells_in_view(self, agent):
        view = [(agent.x, agent.y, 0)]
        for dx, dy in DIRECTIONS:
            for distance in range(1, agent.vision + 1):
                x = (agent.x + dx * distance) % self.width
                y = (agent.y + dy * distance) % self.height
                if self.occupant[y][x] is None:
                    view.append((x, y, distance))
        return view

    # Rule: look and choose. Most sugar wins, then the nearest cell, then a random pick.
    # agent: the agent that is choosing. Returns the (x, y) it will move to.
    def choose_cell(self, agent):
        best_sugar = -1
        best_distance = 0
        best_cells = []
        for x, y, distance in self.cells_in_view(agent):
            sugar_here = self.sugar[y][x]
            if sugar_here > best_sugar or (sugar_here == best_sugar and distance < best_distance):
                best_sugar = sugar_here
                best_distance = distance
                best_cells = [(x, y)]
            elif sugar_here == best_sugar and distance == best_distance:
                best_cells.append((x, y))
        if len(best_cells) == 1:
            return best_cells[0]
        return self.rng.choice(best_cells)

    # Rule: move to the chosen cell, eat all its sugar, then burn metabolism and age by 1.
    # agent: the agent that acts. Returns the sugar it collected.
    def move_agent(self, agent):
        new_x, new_y = self.choose_cell(agent)
        self.occupant[agent.y][agent.x] = None
        agent.x = new_x
        agent.y = new_y
        self.occupant[new_y][new_x] = agent
        collected = self.sugar[new_y][new_x]
        self.sugar[new_y][new_x] = 0
        agent.sugar = agent.sugar + collected - agent.metabolism
        agent.age += 1
        self.sugar_collected += collected
        return collected

    # Rule: starvation (sugar 0 or less) and, if lifespan is on, old age. A dead agent is removed.
    # agent: the agent to check. Returns "starved", "old age" or None.
    def check_death(self, agent):
        cause = None
        if agent.sugar <= 0:
            cause = "starved"
        elif self.settings["lifespan"] and agent.age >= agent.max_age:
            cause = "old age"
        if cause is not None:
            self.occupant[agent.y][agent.x] = None
            self.agents.remove(agent)
        return cause

    # Rule: a rich living agent with an empty neighbouring cell gives half its sugar to a child.
    # agent: the possible parent. Returns the new child, or None if there was no birth.
    def reproduce(self, agent):
        settings = self.settings
        if not settings["reproduction"] or agent.sugar < settings["reproduction_threshold"]:
            return None
        free_cells = []
        for dx, dy in DIRECTIONS:
            x = (agent.x + dx) % self.width
            y = (agent.y + dy) % self.height
            if self.occupant[y][x] is None:
                free_cells.append((x, y))
        if not free_cells:
            return None
        x, y = self.rng.choice(free_cells)
        child_sugar = int(agent.sugar // 2)
        agent.sugar = agent.sugar - child_sugar
        max_age = self.rng.randint(settings["max_age_min"], settings["max_age_max"])
        child = Agent(self.next_id, x, y, child_sugar, agent.vision,
                      agent.metabolism, max_age, agent.founder_id)
        self.next_id += 1
        self.agents.append(child)
        self.occupant[y][x] = child
        return child

    # Advances the simulation by one time step: regrow, then every agent acts in random order.
    def step(self):
        self.births = 0
        self.deaths_starved = 0
        self.deaths_old_age = 0
        self.sugar_collected = 0
        self.regrow()
        acting_order = list(self.agents)
        self.rng.shuffle(acting_order)
        for agent in acting_order:
            self.move_agent(agent)
            cause = self.check_death(agent)
            if cause == "starved":
                self.deaths_starved += 1
            elif cause == "old age":
                self.deaths_old_age += 1
            elif self.reproduce(agent) is not None:
                self.births += 1
        self.time += 1

    # One list per living agent, in AGENT_COLUMNS order, for the current step.
    def agent_rows(self):
        rows = []
        for agent in self.agents:
            rows.append([self.time, agent.agent_id, agent.x, agent.y, agent.sugar, agent.vision,
                         agent.metabolism, agent.age, agent.founder_id])
        return rows

    # Dict with the STEP_COLUMNS keys describing the current step.
    def summary(self):
        sugars = [agent.sugar for agent in self.agents]
        count = len(sugars)
        result = {"step": self.time, "population": count, "births": self.births,
                  "deaths_starved": self.deaths_starved, "deaths_old_age": self.deaths_old_age,
                  "sugar_collected": self.sugar_collected,
                  "sugar_on_grid": sum(sum(row) for row in self.sugar),
                  "mean_sugar": 0, "median_sugar": 0, "gini": 0, "mean_vision": 0,
                  "mean_metabolism": 0, "share_on_rich_cells": 0, "founders_alive": 0}
        if count > 0:
            rich = [agent for agent in self.agents
                    if self.capacity[agent.y][agent.x] >= RICH_CAPACITY]
            result["mean_sugar"] = sum(sugars) / count
            result["median_sugar"] = statistics.median(sugars)
            result["gini"] = gini(sugars)
            result["mean_vision"] = sum(agent.vision for agent in self.agents) / count
            result["mean_metabolism"] = sum(agent.metabolism for agent in self.agents) / count
            result["share_on_rich_cells"] = len(rich) / count
            result["founders_alive"] = len(set(agent.founder_id for agent in self.agents))
        return result
