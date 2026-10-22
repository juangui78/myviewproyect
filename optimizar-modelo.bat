@echo off
setlocal enabledelayedexpansion
title Optimizador 3D MyView (0 Tokens)

:: Comprobar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js en el sistema.
    echo Por favor instala Node.js desde https://nodejs.org/ para usar este optimizador.
    pause
    exit /b 1
)

:: Localizar optimize.mjs
set "SCRIPT_PATH="
if exist "%~dp0tools\optimizer\optimize.mjs" (
    set "SCRIPT_PATH=%~dp0tools\optimizer\optimize.mjs"
) else if exist "%~dp0myview\tools\optimizer\optimize.mjs" (
    set "SCRIPT_PATH=%~dp0myview\tools\optimizer\optimize.mjs"
)

if "%SCRIPT_PATH%"=="" (
    echo [ERROR] No se encontro optimize.mjs en tools\optimizer\
    pause
    exit /b 1
)

:: Obtener archivo GLB (por drag-and-drop o pregunta interactiva)
set "GLB_FILE=%~1"

if "%GLB_FILE%"=="" (
    cls
    echo =============================================================
    echo          OPTIMIZADOR 3D LOCAL MYVIEW (0 TOKENS)
    echo =============================================================
    echo.
    echo  Arrastra y suelta un archivo .glb en esta ventana y pulsa Enter.
    echo  (O escribe o pega la ruta completa del archivo .glb)
    echo.
    set /p "GLB_FILE=Archivo: "
    set "GLB_FILE=!GLB_FILE:"=!"
)

if "%GLB_FILE%"=="" (
    echo No se especifico ningun archivo.
    pause
    exit /b 1
)

if not exist "!GLB_FILE!" (
    echo [ERROR] El archivo no existe: "!GLB_FILE!"
    pause
    exit /b 1
)

echo.
echo Ejecutando optimizacion...
echo.
node "!SCRIPT_PATH!" "!GLB_FILE!"

echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
