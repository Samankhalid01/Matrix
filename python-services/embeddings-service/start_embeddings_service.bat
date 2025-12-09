@echo off
echo ========================================
echo Starting MATRIX Embeddings Service
echo ========================================
echo.
echo Loading SentenceTransformer model...
echo This may take 30-60 seconds on first run
echo.
cd /d "%~dp0"
python app.py
pause
