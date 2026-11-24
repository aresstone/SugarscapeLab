# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       app/playback.py
# Purpose:    Packs a finished run into the playback frames the Simulate page draws, and keeps the answer
#             small enough to send. It holds no simulation rules.

import json

# The agent columns kept in a playback frame, in this order.
FRAME_COLUMNS = ["agent_id", "x", "y", "sugar", "age"]


# A number as short as it can be written: whole numbers without ".0", others with at most 4 decimals.
# value: the number.
def short_number(value):
    if value == int(value):
        return int(value)
    return round(value, 4)


# The sugar on every cell, row by row, as one character per cell: the sugar rounded down (0 to 4).
# world: the Sugarscape object.
def sugar_text(world):
    characters = []
    for row in world.sugar:
        for value in row:
            characters.append(str(int(value)))
    return "".join(characters)


# One playback frame: the step, the sugar on the cells, and [agent_id, x, y, sugar, age] per agent.
# step: the step number. rows: the agent rows of that step. columns: AGENT_COLUMNS of the model.
# sugar: the text from sugar_text.
def make_frame(step, rows, columns, sugar):
    picks = [columns.index(name) for name in FRAME_COLUMNS]
    agents = []
    for row in rows:
        agents.append([short_number(row[index]) for index in picks])
    return {"step": step, "sugar": sugar, "agents": agents}


# Vision and metabolism of every agent that ever lived (they never change), keyed by agent_id.
# agent_rows: all agent rows of the run. columns: AGENT_COLUMNS of the model.
def agent_traits(agent_rows, columns):
    traits = {}
    for row in agent_rows:
        traits[row[columns.index("agent_id")]] = [row[columns.index("vision")],
                                                  row[columns.index("metabolism")]]
    return traits


# Turns the answer into JSON text no larger than max_bytes. If the frames of every step do not fit,
# only every second, third, ... step is kept (always with the last); the per-step rows stay complete.
# answer: the answer without frames. frames: one frame per step. max_bytes: the largest answer allowed.
def fit_frames(answer, frames, max_bytes):
    sizes = [len(json.dumps(frame, separators=(",", ":"))) + 1 for frame in frames]
    room = max_bytes - len(json.dumps(answer, separators=(",", ":"))) - 100
    every = 1
    while True:
        picked = list(range(0, len(frames), every))
        if picked[-1] != len(frames) - 1:
            picked.append(len(frames) - 1)
        if sum(sizes[index] for index in picked) <= room or every >= len(frames):
            break
        every += 1
    answer["frame_every"] = every
    answer["frames"] = [frames[index] for index in picked]
    text = json.dumps(answer, separators=(",", ":"))
    if len(text.encode("utf-8")) > max_bytes:
        raise ValueError("This run is too large to send. Try fewer agents or fewer steps.")
    return text
