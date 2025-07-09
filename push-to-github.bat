@echo off
echo ========================================
echo  PUSHING TO GITHUB: ConsultBridge2
echo ========================================
echo.

echo [1/6] Initializing git repository...
git init

echo [2/6] Adding remote origin...
git remote add origin https://github.com/AnshTank/ConsultBridge2.git

echo [3/6] Adding all files...
git add .

echo [4/6] Creating initial commit...
git commit -m "Initial commit: ConsultBridge - Next.js Consultancy Platform"

echo [5/6] Setting main branch...
git branch -M main

echo [6/6] Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Repository: https://github.com/AnshTank/ConsultBridge2
    echo.
) else (
    echo.
    echo ========================================
    echo  ERROR! Push failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. GitHub repository exists
    echo 2. You have push permissions
    echo 3. Git is installed and configured
    echo.
)

pause