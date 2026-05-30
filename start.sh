#!/bin/bash

echo "╔═══════════════════════════════════════════╗"
echo "║   🚀 PipiPupu Messenger - Quick Start    ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js не установлен!"
    echo "📥 Скачайте Node.js с https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    echo ""
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    mkdir uploads
    echo "✅ Создана папка для загрузок"
fi

echo "╔═══════════════════════════════════════════╗"
echo "║   🎉 Запуск сервера...                   ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Start server
npm start
