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
echo [AI Hub] Building portable EXE...
call npm run dist
if errorlevel 1 (
  echo.
  echo [ERROR] npm run dist failed.
  pause
  exit /b 1
)

echo.
echo [OK] Done. Check the "release" folder.
pause
