@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "VENV_DIR=%PROJECT_DIR%venv"
set "PYTHON=python"

cd /d "%PROJECT_DIR%"

echo 
echo [INFO] Setting up environment...
echo 

REM 
IF NOT EXIST "%VENV_DIR%" (
    echo [INFO] Creating virtual environment...
    %PYTHON% -m venv "%VENV_DIR%" || goto :fail
)

REM 
call "%VENV_DIR%\Scripts\activate.bat" || goto :fail

REM 
IF EXIST "requirements.txt" (
    echo [INFO] Installing dependencies...
    pip install -r requirements.txt || goto :fail
) ELSE (
    echo [WARNING] requirements.txt not found, skipping install.
)

REM
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"

IF NOT EXIST "%PYTHON_EXE%" (
    echo [ERROR] Python not found in virtual environment.
    goto :fail
)

echo 
echo [INFO] Starting pipeline...
echo 

REM 
echo [INFO] Starting CSV creation...
"%PYTHON_EXE%" create_csv.py || goto :fail

REM 
echo [INFO] Starting EDA...
"%PYTHON_EXE%" EDA.py || goto :fail

REM 
echo [INFO] Starting training...
"%PYTHON_EXE%" train.py || goto :fail

REM 
echo [INFO] Running test evaluation...
"%PYTHON_EXE%" test.py || goto :fail
REM 
echo [INFO] Generating plots...
"%PYTHON_EXE%" plot_config_scores.py || goto :fail
REM 
echo [INFO] Generating inference samples...
"%PYTHON_EXE%" inference.py || goto :fail

echo
echo [SUCCESS] Pipeline completed.
echo
exit /b 0

:fail
echo
echo [ERROR] Pipeline failed.
echo 
exit /b 1