@echo off
echo Starting Farmers & Agro-Processors Management Portal...
echo.
echo 📱 MOBILE ACCESS (On same Wi-Fi):
echo Type this on your phone: http://192.168.3.254:3000
echo.
cd /d "%~dp0"
start http://localhost:3000
npm run dev
pause
