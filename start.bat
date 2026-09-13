@echo off
title Dashboard Ejecutivo 360 - Admin, Recepcion y ERP VentaRD
echo ========================================================
echo   Iniciando Dashboard Analitico 360...
echo ========================================================

start "Servidor Backend 360" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Cliente Web 360" cmd /k "cd client && npm run dev"

echo Abriendo navegador en http://localhost:5173 ...
timeout /t 2 /nobreak >nul
start http://localhost:5173
