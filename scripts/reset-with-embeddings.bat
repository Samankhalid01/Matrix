@echo off
echo ============================================================
echo   MATRIX - Reset Database and Add Products with Embeddings
echo ============================================================
echo.
echo This script will:
echo   1. Check if embeddings service is running
echo   2. Delete ALL existing products
echo   3. Add 150 NEW products WITH embeddings
echo.
echo ⚠️  WARNING: This will delete all current products!
echo.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

echo.
echo Starting process...
echo.

node reset-and-add-with-embeddings.js

echo.
echo ============================================================
echo   Process completed!
echo ============================================================
echo.
pause
