@echo off
setlocal enabledelayedexpansion

:: Set the initial port number
set PORT=3001

:: Function to check if the port is free
:CHECK_PORT
netstat -an | find "LISTENING" | find ":!PORT!" | find "127.0.0.1" >nul
if %errorlevel% equ 0 (
    echo Port !PORT! is in use. Trying the next one...
    set /a PORT+=1
    goto CHECK_PORT
)

:: Start the React client on the free port
echo Starting React client on port !PORT!
set PORT=!PORT!
npm start