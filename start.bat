@echo off
echo Starting Magilu App...
echo Updating repository...
git pull --rebase origin main
if errorlevel 1 (
	echo.
	echo Failed to update repository. Resolve git issues and try again.
	pause
	exit /b 1
)

docker compose up -d
if errorlevel 1 (
	echo.
	echo Failed to start Docker containers. Check build errors above.
	pause
	exit /b 1
)

echo.
echo App is running at http://localhost:3000
start "" "http://localhost:3000"
pause
