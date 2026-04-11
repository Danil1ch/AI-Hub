@echo off
setlocal
cd /d "%~dp0"

echo [AI Hub] Installing dependencies (if needed)...
call npm install
if errorlevel 1 (
  echo.
  echo [ERROR] npm install failed.
  pause
  exit /b 1
)

echo.
echo [AI Hub] Starting development mode...
call npm run dev
if errorlevel 1 (
  echo.
  echo [ERROR] npm run dev failed.
  pause
  exit /b 1
)
