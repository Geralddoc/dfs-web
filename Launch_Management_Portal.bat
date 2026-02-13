@echo off
setlocal

:menu
cls
echo ====================================================
echo    FARMERS ^& AGRO-PROCESSORS MANAGEMENT PORTAL
echo ====================================================
echo.
echo 📱 MOBILE ACCESS (On same Wi-Fi):
echo Type this on your phone: http://192.168.3.254:3000
echo.
echo 1. Start Local Dashboard (Dev Mode)
echo 2. Sync All Changes to Cloud (Git Push ^& Vercel)
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto sync_git
if "%choice%"=="3" exit
goto menu

:start_dev
echo Starting Local Server...
cd /d "%~dp0"
start http://localhost:3000
npm run dev
pause
goto menu

:sync_git
echo.
echo Syncing changes to GitHub and Vercel...
cd /d "%~dp0"
git add .
git commit -m "Auto-sync from Management Portal Launcher"
git push origin main
echo.
echo Sync Complete! Vercel will now begin deploying.
echo Visit: https://dfs-web.vercel.app
pause
goto menu
