#!/bin/sh
# Name:       Nikita Devi Gurumayum
# Student ID: SCSJ2400109
# Module:     6COM2012 Social and Collective Artificial Intelligence
# File:       start.sh
# Purpose:    Starts Sugarscape Lab on a Mac or on Linux: makes the Python environment the first time,
#             installs the packages, starts the server and opens the app in the browser.

# Run it from a terminal in this folder:   sh start.sh
# To use another port:                     SUGARSCAPE_PORT=8001 sh start.sh

cd "$(dirname "$0")" || exit 1
PORT="${SUGARSCAPE_PORT:-8000}"
URL="http://127.0.0.1:$PORT"

# Prints a plain message saying what went wrong, then stops.
# $1: the message.
fail() {
  echo ""
  echo "Sugarscape Lab could not start: $1"
  echo "See 'If something goes wrong' in README.md."
  exit 1
}

# Finds a Python of version 3.9 or newer and prints its name.
# No parameters. Prints nothing if there is none.
find_python() {
  for candidate in python3 python3.14 python3.13 python3.12 python3.11 python3.10 python3.9 python; do
    if command -v "$candidate" >/dev/null 2>&1 &&
      "$candidate" -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3, 9) else 1)' >/dev/null 2>&1; then
      echo "$candidate"
      return
    fi
  done
}

# Waits until the server answers (at most two minutes), then opens the app in the browser.
# No parameters.
open_browser() {
  i=0
  while [ "$i" -lt 120 ]; do
    if command -v curl >/dev/null 2>&1; then
      curl -s -o /dev/null "$URL/api/status" && break
    elif [ "$i" -ge 10 ]; then
      break
    fi
    sleep 1
    i=$((i + 1))
  done
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 # Linux
  elif command -v open >/dev/null 2>&1; then
    open "$URL" # Mac
  else
    echo "Open $URL in your browser."
  fi
}

# 1. The Python environment (.venv), made the first time. One that does not work here (for example
#    copied from another computer) is made again.
if ! .venv/bin/python -c "" >/dev/null 2>&1; then
  PYTHON="$(find_python)"
  [ -n "$PYTHON" ] || fail "Python 3.9 or newer was not found. Install Python from python.org, then run this again."
  echo "Making the Python environment with $PYTHON (only the first time)..."
  rm -rf .venv
  "$PYTHON" -m venv .venv || fail "the Python environment could not be made."
fi

# 2. The packages, installed the first time: the server's (requirements.txt) and matplotlib, which
#    analyse_results.py uses to draw the figures (requirements-analysis.txt). This needs the internet.
if [ ! -f .venv/sugarscape-lab-installed ]; then
  echo "Installing the packages from requirements.txt and requirements-analysis.txt (only the first time)..."
  .venv/bin/python -m pip install --upgrade pip >/dev/null 2>&1
  .venv/bin/python -m pip install -r requirements.txt -r requirements-analysis.txt ||
    fail "the packages could not be installed. Check the internet connection and the free disk space."
  touch .venv/sugarscape-lab-installed
fi

# 3. The server. The browser opens as soon as it answers.
echo "Starting Sugarscape Lab at $URL (press Ctrl+C here to stop it)..."
open_browser &
.venv/bin/python app/server.py --port "$PORT" ||
  fail "the server stopped. If the message above says the address is already in use, Sugarscape Lab may already be running: try $URL, or use another port with SUGARSCAPE_PORT=8001 sh start.sh"
