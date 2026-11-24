# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       app/folder_opener.py
# Purpose:    Opens a project folder in the computer's own file manager (Finder on a Mac, File Explorer
#             on Windows), so a folder shown in the Project map can also be opened for real.

import os
import subprocess
import sys

from file_viewer import PROJECT_DIR, resolve_inside_project


# Opens a folder of the project in the file manager. If the path is a file, its folder is opened.
# Raises PermissionError if the path is outside the project, FileNotFoundError if it does not
# exist, and RuntimeError if this computer has no file manager to open.
# relative_path: a path relative to the project, for example "assignment/data". An empty path means the
#                project folder itself.
def open_in_file_manager(relative_path):
    full_path = PROJECT_DIR if relative_path in ("", ".") else resolve_inside_project(relative_path)
    if full_path is None:
        raise PermissionError("This path is outside the project folder.")
    if not os.path.exists(full_path):
        raise FileNotFoundError("There is no such folder in the project.")
    folder = full_path if os.path.isdir(full_path) else os.path.dirname(full_path)

    try:
        if sys.platform == "darwin":
            subprocess.Popen(["open", folder])                    # Mac: Finder
        elif sys.platform.startswith("win"):
            os.startfile(folder)                                  # Windows: File Explorer
        else:
            subprocess.Popen(["xdg-open", folder],                # Linux: the desktop's file manager
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except OSError:
        raise RuntimeError("The file manager could not be opened on this computer.")

    return {"opened": os.path.relpath(folder, PROJECT_DIR).replace(os.sep, "/")}
