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
	if not exist logs mkdir logs
	for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set date=%%c%%a%%b)
	for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set time=%%a%%b)
	set logfile=logs\docker-error_%date%_%time%.log
	echo Failed to start Docker containers. Generating error log...
	docker compose up -d 2^>^&1 ^> "%logfile%"
	echo.
	echo Error log saved: %logfile%
	echo.
	echo Next steps:
	echo   1. Check the error log for details
	echo   2. Run: docker compose build --no-cache
	echo   3. Run: docker compose up -d
	echo.
	pause
	exit /b 1
)

echo.
echo App is running at http://localhost:3000
start "" "http://localhost:3000"
pause
