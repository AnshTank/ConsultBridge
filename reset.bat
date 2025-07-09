@echo off
echo Cleaning Next.js cache...
rmdir /s /q .next
echo Cache cleared!

echo Installing dependencies...
npm install

echo Starting development server...
npm run dev