@echo off
echo Stopping any running Next.js processes...
taskkill /f /im node.exe 2>nul

echo Clearing Next.js cache...
rmdir /s /q .next 2>nul
mkdir .next

echo Clearing browser cache instructions:
echo 1. Open your browser
echo 2. Press Ctrl+Shift+Delete
echo 3. Select "Cached images and files" and "Cookies and site data"
echo 4. Click "Clear data"
echo.
echo Press any key to start the development server...
pause > nul

echo Starting development server...
npm run dev