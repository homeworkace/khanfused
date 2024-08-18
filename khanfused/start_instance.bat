@echo off
setlocal enabledelayedexpansion

:: Set the initial port number
set PORT=3000

:: Function to check if the port is free
:CHECK_PORT
for /f %%i in ('netstat -na ^| find /c "127.0.0.1:%PORT%"') do set PORT_COUNT=%%i
if %PORT_COUNT% gtr 0 (
    echo Port %PORT% is in use. Trying the next one...
    set /a PORT+=1
    goto CHECK_PORT
)

:: Start the React client on the free port
set HOST=app%PORT%
echo Starting React client on port %PORT%
npm start
