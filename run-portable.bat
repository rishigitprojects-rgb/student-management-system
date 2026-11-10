@echo off
setlocal
cd /d "%~dp0"

if not exist "node.exe" (
  echo The bundled Node.js runtime is missing. Extract the entire ZIP before running this file.
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo The built application is missing. Extract the entire ZIP before running this file.
  pause
  exit /b 1
)

echo Starting Student Management System. Keep this window open while using the app.
".\node.exe" ".\portable-server.cjs"
if errorlevel 1 pause
