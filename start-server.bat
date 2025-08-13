@echo off
echo Starting local web server for Audio Visual Memory Game...
echo.
echo The game will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Try Python 3 first, then Python 2, then Node.js
python -m http.server 8000 2>nul || python -m SimpleHTTPServer 8000 2>nul || npx http-server -p 8000 2>nul || (
    echo Error: No suitable web server found.
    echo Please install Python or Node.js to run the local server.
    echo.
    echo Alternatively, you can:
    echo 1. Install Python and run: python -m http.server 8000
    echo 2. Install Node.js and run: npx http-server -p 8000
    echo.
    pause
)
