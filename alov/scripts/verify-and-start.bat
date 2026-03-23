@echo off
echo ========================================
echo Verifying Aether Changes
echo ========================================
echo.

echo Checking if files exist...
echo.

if exist "src\components\message-box.tsx" (
    echo [OK] message-box.tsx exists
) else (
    echo [ERROR] message-box.tsx NOT FOUND
)

if exist "src\components\ui\dialog.tsx" (
    echo [OK] dialog.tsx exists
) else (
    echo [ERROR] dialog.tsx NOT FOUND
)

if exist "src\components\preview-frame-improved.tsx" (
    echo [OK] preview-frame-improved.tsx exists
) else (
    echo [ERROR] preview-frame-improved.tsx NOT FOUND
)

if exist "src\app\test-components\page.tsx" (
    echo [OK] test-components page exists
) else (
    echo [ERROR] test-components page NOT FOUND
)

echo.
echo ========================================
echo Killing any running Node processes...
echo ========================================
taskkill /F /IM node.exe 2>nul
if %errorlevel% == 0 (
    echo Node processes killed
) else (
    echo No Node processes were running
)

echo.
echo ========================================
echo Clearing Next.js cache...
echo ========================================
if exist ".next" (
    rmdir /s /q ".next"
    echo Cache cleared
) else (
    echo No cache to clear
)

echo.
echo ========================================
echo Starting development server...
echo ========================================
echo.
echo Server will start in a new window...
echo.
echo Once started, visit:
echo   http://localhost:3000/test-components
echo.
echo Press any key to start the server...
pause >nul

start cmd /k "npm run dev"

echo.
echo ========================================
echo Server starting in new window!
echo ========================================
echo.
echo Visit these URLs to test:
echo   1. http://localhost:3000/test-components
echo   2. http://localhost:3000
echo.
echo If you see errors, check the server window
echo.
pause
