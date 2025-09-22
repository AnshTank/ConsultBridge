@echo off
echo Fixing Next.js build issues...
rmdir /s /q .next 2>nul
echo Cleared .next cache
npm cache clean --force
echo Cleared npm cache
echo Starting development server...
npm run dev