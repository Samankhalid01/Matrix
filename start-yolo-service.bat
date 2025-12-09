@echo off
echo ========================================
echo   YOLO Theft Detection Service
echo ========================================
echo.

cd /d "%~dp0"
cd python-services\yolo-theft-detection

echo Activating virtual environment...
call ..\..\\.venv\Scripts\activate.bat

echo.
echo Starting YOLO service on http://localhost:5002
echo Press Ctrl+C to stop
echo.

python app.py

pause
