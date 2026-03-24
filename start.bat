@echo off
echo Starting Magilu App...
docker compose up -d
echo.
echo App is running at http://localhost:3000
start http://localhost:3000
pause
