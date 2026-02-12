@echo off
echo Starting Farmers & Agro-Processors Management Portal...
cd /d "%~dp0"
start http://localhost:3000
npm run dev
pause
