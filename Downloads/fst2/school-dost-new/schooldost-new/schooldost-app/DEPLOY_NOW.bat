@echo off
echo ===================================================
echo SchoolDost Auto-Deploy Script
echo ===================================================
echo.

echo 1. Pushing Backend...
cd backend
git push https://ghp_fl1CsblJ1lc9N1BeypkOxqc7jcWMK10AUYjh@github.com/schooldostbackend-gif/school-dost.git master
if %errorlevel% neq 0 (
    echo [ERROR] Backend Push Failed!
    
    exit /b
)
echo [SUCCESS] Backend Pushed!
echo.

echo 2. Pushing Frontend...
cd ../frontend
git push https://ghp_fl1CsblJ1lc9N1BeypkOxqc7jcWMK10AUYjh@github.com/schooldostbackend-gif/sd-frontend.git master
if %errorlevel% neq 0 (
    echo [ERROR] Frontend Push Failed!
    
    exit /b
)
echo [SUCCESS] Frontend Pushed!
echo.

echo ===================================================
echo DONE! NOW GO TO HOSTINGER AND REDEPLOY.
echo ===================================================
pause
