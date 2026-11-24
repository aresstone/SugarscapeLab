// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/learn-code.ts
// Purpose:    The line-by-line walk through the five main functions of sugarscape.py, for the Learn page
//             "A walk through the code". Each code line is copied exactly from the file (indented as in its
//             method), with what it does in plain words.

// One function: its name, a sentence on its job, and each line with its meaning.
export type CodeWalk = { name: string; job: string; lines: [string, string][] };

export const CODE_WALKS: CodeWalk[] = [
  {
    name: "choose_cell",
    job: "Looks at every cell the agent can see and picks the one it will move to.",
    lines: [
      ["def choose_cell(self, agent):", "Start of the rule. It works on one agent, the one whose turn it is."],
      ["    best_sugar = -1", "The most sugar seen so far. It starts below 0, so the first cell looked at always beats it."],
      ["    best_distance = 0", "How far away the best cell is."],
      ["    best_cells = []", "The list of cells that are equally best so far. It starts empty."],
      ["    for x, y, distance in self.cells_in_view(agent):", "Go through every cell the agent can see: its own cell and the empty cells along its row and column, with how far each one is."],
      ["        sugar_here = self.sugar[y][x]", "Read how much sugar is on this cell."],
      ["        if sugar_here > best_sugar or (sugar_here == best_sugar and distance < best_distance):", "Is this cell better: more sugar, or the same sugar but nearer?"],
      ["            best_sugar = sugar_here", "If so, remember its sugar..."],
      ["            best_distance = distance", "...and its distance..."],
      ["            best_cells = [(x, y)]", "...and start a new list of best cells holding only this one."],
      ["        elif sugar_here == best_sugar and distance == best_distance:", "Otherwise, is it exactly as good: the same sugar and the same distance?"],
      ["            best_cells.append((x, y))", "Then add it to the list of equally best cells."],
      ["    if len(best_cells) == 1:", "After looking at every cell: is there only one best cell?"],
      ["        return best_cells[0]", "Then that is the answer."],
      ["    return self.rng.choice(best_cells)", "Otherwise pick one of the tied cells at random, with the run's own random number generator."],
    ],
  },
  {
    name: "move_agent",
    job: "Moves the agent to the chosen cell, lets it eat, and makes it burn sugar and grow older.",
    lines: [
      ["def move_agent(self, agent):", "Start of the rule for one agent."],
      ["    new_x, new_y = self.choose_cell(agent)", "Ask choose_cell where to go."],
      ["    self.occupant[agent.y][agent.x] = None", "Mark the cell it is leaving as empty."],
      ["    agent.x = new_x", "Change the agent's column..."],
      ["    agent.y = new_y", "...and its row."],
      ["    self.occupant[new_y][new_x] = agent", "Mark the new cell as taken by this agent."],
      ["    collected = self.sugar[new_y][new_x]", "The sugar on the new cell is what the agent collects."],
      ["    self.sugar[new_y][new_x] = 0", "The agent eats all of it, so the cell is left with none."],
      ["    agent.sugar = agent.sugar + collected - agent.metabolism", "Its sugar becomes what it had, plus what it ate, minus what its body burns this step."],
      ["    agent.age += 1", "It is one step older."],
      ["    self.sugar_collected += collected", "Add what it ate to the step's total, for the sugar_collected column."],
      ["    return collected", "Give back how much it ate."],
    ],
  },
  {
    name: "check_death",
    job: "Decides whether the agent dies, and removes it if it does.",
    lines: [
      ["def check_death(self, agent):", "Start of the rule for one agent, just after it has moved and eaten."],
      ["    cause = None", "No cause of death yet."],
      ["    if agent.sugar <= 0:", "Has it run out of sugar?"],
      ['        cause = "starved"', "Then it starved."],
      ['    elif self.settings["lifespan"] and agent.age >= agent.max_age:', "If not, and lifespan is switched on: has it reached its maximum age?"],
      ['        cause = "old age"', "Then it dies of old age."],
      ["    if cause is not None:", "If it died of either cause..."],
      ["        self.occupant[agent.y][agent.x] = None", "...its cell becomes empty..."],
      ["        self.agents.remove(agent)", "...and it is taken off the list of living agents. Its sugar is lost."],
      ["    return cause", 'Give back the cause, "starved" or "old age", or None if it lives, so the step can count it.'],
    ],
  },
  {
    name: "reproduce",
    job: "Lets a rich agent place a child on an empty neighbouring cell, sharing its sugar.",
    lines: [
      ["def reproduce(self, agent):", "Start of the rule for one living agent."],
      ["    settings = self.settings", "A shorter name for the run's settings."],
      ['    if not settings["reproduction"] or agent.sugar < settings["reproduction_threshold"]:', "Is reproduction off, or does the agent have less sugar than the threshold?"],
      ["        return None", "Then there is no child."],
      ["    free_cells = []", "A list for the empty cells next to the agent."],
      ["    for dx, dy in DIRECTIONS:", "Look at the four neighbouring cells: right, left, down and up."],
      ["        x = (agent.x + dx) % self.width", "The neighbour's column; % makes it wrap round the edge of the grid."],
      ["        y = (agent.y + dy) % self.height", "The neighbour's row, wrapping the same way."],
      ["        if self.occupant[y][x] is None:", "Is that cell empty?"],
      ["            free_cells.append((x, y))", "Then remember it."],
      ["    if not free_cells:", "If all four neighbours are taken..."],
      ["        return None", "...there is no room, so no child."],
      ["    x, y = self.rng.choice(free_cells)", "Pick one empty neighbour at random."],
      ["    child_sugar = int(agent.sugar // 2)", "The child gets half the parent's sugar, rounded down to a whole number."],
      ["    agent.sugar = agent.sugar - child_sugar", "The parent keeps the rest, so no sugar is made or lost."],
      ['    max_age = self.rng.randint(settings["max_age_min"], settings["max_age_max"])', "Draw the child's own maximum age from the usual range."],
      ["    child = Agent(self.next_id, x, y, child_sugar, agent.vision,", "Make the child with the next free id, on the chosen cell, with its sugar and the parent's vision..."],
      ["                  agent.metabolism, max_age, agent.founder_id)", "...the parent's metabolism, its own maximum age and the parent's founder. Its age starts at 0."],
      ["    self.next_id += 1", "Ids are never reused: the next agent gets the next number."],
      ["    self.agents.append(child)", "Add the child to the living agents. It acts from the next step."],
      ["    self.occupant[y][x] = child", "Mark its cell as taken."],
      ["    return child", "Give back the child, so the step can count a birth."],
    ],
  },
  {
    name: "regrow",
    job: "Lets sugar grow back on every cell at the start of each step.",
    lines: [
      ["def regrow(self):", "Start of the rule. It works on the whole grid."],
      ['    rate = self.settings["regrowth_rate"]', "How much sugar a cell gains each step."],
      ["    for y in range(self.height):", "Go through every row..."],
      ["        for x in range(self.width):", "...and every cell in it."],
      ["            if self.regrows[y][x]:", "Skip a patch marked as never regrowing."],
      ["                self.sugar[y][x] = min(self.capacity[y][x], self.sugar[y][x] + rate)", "Add the rate to the cell's sugar, but never more than the cell's capacity."],
    ],
  },
];
