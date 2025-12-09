@echo off
echo ============================================
echo   MATRIX - Bulk Product Addition
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting bulk product addition...
echo.
echo This will add 150 products to your database.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

node bulk-add-products-direct.js

echo.
echo ============================================
echo   Script completed!
echo ============================================
pause
