@echo off
echo Starting Magilu App...
docker info >nul 2>&1
if errorlevel 1 (
	echo Docker engine is not reachable. Starting Docker Desktop...
	if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
		start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
	) else if exist "C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe" (
		start "" "C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe"
	) else (
		echo.
		echo Docker Desktop not found. Please install or open Docker Desktop manually.
		echo.
		pause
		exit /b 1
	)

	echo Waiting for Docker engine to be ready...
	set /a retries=0
	:wait_docker
	docker info >nul 2>&1
	if not errorlevel 1 goto docker_ready
	set /a retries+=1
	if %retries% GEQ 30 (
		echo.
		echo Docker started but engine is still not reachable.
		echo Open Docker Desktop and verify Linux containers are enabled.
		echo.
		pause
		exit /b 1
	)
	timeout /t 2 /nobreak >nul
	goto wait_docker
)

:docker_ready
docker compose up -d
if errorlevel 1 (
	echo.
	echo Failed to start containers. Check the build errors above.
	echo.
	pause
	exit /b 1
)

docker compose ps --services --status running | findstr /I "^app$" >nul
if errorlevel 1 (
	echo.
	echo Container started command completed, but app service is not running.
	echo Run: docker compose ps
	echo.
	pause
	exit /b 1
)

echo.
echo App is running at http://localhost:3000
start http://localhost:3000
pause
