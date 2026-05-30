@echo off
echo ╔═══════════════════════════════════════════╗
echo ║   🚀 PipiPupu Messenger - Quick Start    ║
echo ╚═══════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo 📥 Скачайте Node.js с https://nodejs.org/
    pause
    exit /b 1
)

node -v
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo 📦 Установка зависимостей...
    call npm install
    echo.
)

REM Create uploads directory
if not exist "uploads\" (
    mkdir uploads
    echo ✅ Создана папка для загрузок
)

echo ╔═══════════════════════════════════════════╗
echo ║   🎉 Запуск сервера...                   ║
echo ╚═══════════════════════════════════════════╝
echo.

REM Start server
call npm start
