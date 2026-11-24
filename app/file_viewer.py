# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       app/file_viewer.py
# Purpose:    Decides which project files the web app may show, and reads them. Only text files and the
#             figures inside the project are allowed; any path that leads outside the project is refused.

import os

# The project folder, with any links followed, so every check compares real locations.
PROJECT_DIR = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# The kinds of file the viewer shows as text: code, settings, notes and data.
TEXT_EXTENSIONS = {".py", ".ts", ".tsx", ".css", ".html", ".sh", ".bat", ".md", ".txt", ".json", ".csv", ".svg"}

# The folders whose .png figures (drawn by analyse_results.py) the viewer shows as pictures.
FIGURE_FOLDERS = {"assignment/figures", "project/figures"}

# Folders that hold installed or generated files. Nothing inside them is shown.
HIDDEN_FOLDERS = {"node_modules", "dist", "__pycache__", "venv"}

# CSV files can be very long (an agents file has a line per agent per step), so only their first
# lines are shown.
CSV_LINES_SHOWN = 40

# Larger files than this are not shown (the biggest code file is well under it).
MAX_BYTES = 300_000


# Turns a path relative to the project into a full path. Returns None if the path is empty,
# absolute, or leads outside the project (for example with "..").
# relative_path: a path such as "pipeline/step2_preprocess.py".
def resolve_inside_project(relative_path):
    if not relative_path or "\x00" in relative_path or os.path.isabs(relative_path):
        return None
    full_path = os.path.realpath(os.path.join(PROJECT_DIR, relative_path))
    if os.path.commonpath([full_path, PROJECT_DIR]) != PROJECT_DIR:
        return None
    return full_path


# Says whether a path is one of the figures drawn by analyse_results.py: a .png file directly inside
# assignment/figures or project/figures. relative_path: a path relative to the project.
def is_figure(relative_path):
    full_path = resolve_inside_project(relative_path)
    if full_path is None or not os.path.isfile(full_path) or not full_path.lower().endswith(".png"):
        return False
    folder = os.path.relpath(os.path.dirname(full_path), PROJECT_DIR).replace(os.sep, "/")
    return folder in FIGURE_FOLDERS


# Says whether the viewer may show a file: a figure, or a text file of a known kind, inside the
# project, not hidden (no part of its path starts with a dot) and not inside an installed or
# generated folder. relative_path: a path relative to the project.
def is_viewable(relative_path):
    if is_figure(relative_path):
        return True
    full_path = resolve_inside_project(relative_path)
    if full_path is None or not os.path.isfile(full_path):
        return False
    parts = os.path.relpath(full_path, PROJECT_DIR).split(os.sep)
    if any(part.startswith(".") or part in HIDDEN_FOLDERS for part in parts):
        return False
    extension = os.path.splitext(full_path)[1].lower()
    if extension not in TEXT_EXTENSIONS:
        return False
    return extension == ".csv" or os.path.getsize(full_path) <= MAX_BYTES


# Reads a file for the viewer. Raises PermissionError if the path is outside the project or not
# allowed, and FileNotFoundError if it does not exist.
# relative_path: a path relative to the project.
# Returns the path, the text, the number of lines shown and in total, and whether it was cut short.
def read_for_viewer(relative_path):
    full_path = resolve_inside_project(relative_path)
    if full_path is None:
        raise PermissionError("This path is outside the project folder.")
    if not os.path.isfile(full_path):
        raise FileNotFoundError("There is no such file in the project.")
    if not is_viewable(relative_path) or is_figure(relative_path):
        raise PermissionError("This file cannot be shown in the viewer as text.")

    with open(full_path, encoding="utf-8", errors="replace") as file:
        lines = file.read().splitlines()
    shown = lines[:CSV_LINES_SHOWN] if full_path.lower().endswith(".csv") else lines
    return {"path": os.path.relpath(full_path, PROJECT_DIR).replace(os.sep, "/"),
            "text": "\n".join(shown),
            "lines_shown": len(shown),
            "total_lines": len(lines),
            "truncated": len(shown) < len(lines)}
