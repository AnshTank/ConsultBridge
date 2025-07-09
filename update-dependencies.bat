@echo off
echo ========================================
echo  UPDATING DEPENDENCIES TO LATEST COMPATIBLE VERSIONS
echo ========================================
echo.

echo [1/4] Backing up current node_modules...
if exist node_modules_backup rmdir /s /q node_modules_backup
if exist node_modules ren node_modules node_modules_backup

echo [2/4] Backing up package-lock.json...
if exist package-lock.json.backup del package-lock.json.backup
if exist package-lock.json ren package-lock.json package-lock.json.backup

echo [3/4] Installing latest compatible dependencies...
npm install

echo [4/4] Testing build...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Dependencies updated successfully
    echo ========================================
    echo.
    echo Cleaning up backup files...
    if exist node_modules_backup rmdir /s /q node_modules_backup
    if exist package-lock.json.backup del package-lock.json.backup
    echo.
    echo You can now run: npm run dev
) else (
    echo.
    echo ========================================
    echo  ERROR! Build failed - Rolling back...
    echo ========================================
    echo.
    if exist node_modules rmdir /s /q node_modules
    if exist node_modules_backup ren node_modules_backup node_modules
    if exist package-lock.json del package-lock.json
    if exist package-lock.json.backup ren package-lock.json.backup package-lock.json
    echo Rollback complete. Your original setup is restored.
)

pause