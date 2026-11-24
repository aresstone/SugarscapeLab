@echo off
REM Name:       Nikita Devi Gurumayum
REM Student ID: SCSJ2400109
REM Module:     6COM2012 Social and Collective Artificial Intelligence
REM File:       start.bat
REM Purpose:    Starts Sugarscape Lab on Windows: makes the Python environment the first time, installs
REM             the packages, starts the server and opens the app in the browser.
REM
REM Double-click this file. To use another port, in a Command Prompt: set SUGARSCAPE_PORT=8001 then start.bat

cd /d "%~dp0"
if "%SUGARSCAPE_PORT%"=="" set SUGARSCAPE_PORT=8000
set URL=http://127.0.0.1:%SUGARSCAPE_PORT%

REM 1. The Python environment (.venv), made the first time. One that does not work here is made again.
".venv\Scripts\python.exe" -c "" >nul 2>&1
if errorlevel 1 (
  echo Making the Python environment ^(only the first time^)...
  if exist .venv rmdir /s /q .venv
  py -3 -m venv .venv >nul 2>&1
  if not exist ".venv\Scripts\python.exe" python -m venv .venv
  if not exist ".venv\Scripts\python.exe" goto no_python
)
".venv\Scripts\python.exe" -c "import sys; sys.exit(0 if sys.version_info[:2] >= (3, 9) else 1)"
if errorlevel 1 goto no_python

REM 2. The packages, installed the first time: the server's (requirements.txt) and matplotlib, which
REM    analyse_results.py uses to draw the figures (requirements-analysis.txt). This needs the internet.
if not exist ".venv\sugarscape-lab-installed" (
  echo Installing the packages from requirements.txt and requirements-analysis.txt ^(only the first time^)...
  ".venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>&1
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt -r requirements-analysis.txt
  if errorlevel 1 goto no_packages
  echo installed> ".venv\sugarscape-lab-installed"
)

REM 3. The server. The browser opens after a short wait.
echo Starting Sugarscape Lab at %URL% (close this window to stop it)...
start "" /b cmd /c "ping -n 11 127.0.0.1 >nul & start %URL%"
".venv\Scripts\python.exe" app\server.py --port %SUGARSCAPE_PORT%
if errorlevel 1 goto server_stopped
goto end

:no_python
echo.
echo Sugarscape Lab could not start: Python 3.9 or newer was not found.
echo Install Python from python.org (tick "Add python.exe to PATH"), then run this again.
if exist .venv rmdir /s /q .venv
goto end

:no_packages
echo.
echo Sugarscape Lab could not start: the packages could not be installed.
echo Check the internet connection and the free disk space.
goto end

:server_stopped
echo.
echo Sugarscape Lab could not start: the server stopped. If the message above says the address is
echo already in use, Sugarscape Lab may already be running: try %URL% in your browser.
goto end

:end
echo See "If something goes wrong" in README.md.
pause
