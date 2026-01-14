#!/bin/bash

set -e

echo "🚀 Автоматический деплой на Railway"
echo "===================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "Создайте .env из env.example и заполните все значения"
    exit 1
fi

echo "📦 Проверка зависимостей..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

echo "✅ Node.js и npm установлены"
echo ""

echo "📦 Установка Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo "Устанавливаю Railway CLI..."
    npm install -g @railway/cli 2>&1 | grep -v "npm WARN" || {
        echo "⚠️  Не удалось установить глобально. Пробую через npx..."
    }
else
    echo "✅ Railway CLI уже установлен"
fi

echo ""
echo "🔐 Проверка авторизации Railway..."
if railway whoami &> /dev/null; then
    echo "✅ Уже авторизован в Railway"
    RAILWAY_AUTHED=true
else
    echo "⚠️  Не авторизован в Railway"
    echo ""
    echo "Выполните авторизацию:"
    echo "  railway login"
    echo ""
    read -p "Нажмите Enter после авторизации, или Ctrl+C для отмены..."
    RAILWAY_AUTHED=true
fi

echo ""
echo "📁 Инициализация git репозитория..."
if [ ! -d ".git" ]; then
    git init
    git config user.email "deploy@wallet-service.local" || true
    git config user.name "Deploy Bot" || true
    echo "✅ Git репозиторий инициализирован"
else
    echo "✅ Git репозиторий уже существует"
fi

echo ""
echo "📝 Создание коммита..."
git add -A || true
git commit -m "Deploy: wallet service $(date +%Y%m%d-%H%M%S)" || {
    echo "⚠️  Нет изменений для коммита или git не настроен"
}

echo ""
echo "🚀 Инициализация Railway проекта..."
if [ -f ".railway/project.json" ]; then
    echo "✅ Railway проект уже инициализирован"
else
    echo "Создаю новый Railway проект..."
    railway init --name wallet-service || {
        echo "⚠️  Не удалось инициализировать автоматически"
        echo "Выполните вручную: railway init"
        exit 1
    }
fi

echo ""
echo "📤 Загрузка переменных окружения..."
source .env 2>/dev/null || true

railway variables set NETWORK="${NETWORK:-sepolia}" 2>/dev/null || echo "⚠️  NETWORK"
railway variables set TOKEN_ADDRESS_SEPOLIA="${TOKEN_ADDRESS_SEPOLIA}" 2>/dev/null || echo "⚠️  TOKEN_ADDRESS_SEPOLIA"
railway variables set TOKEN_ADDRESS_MAINNET="${TOKEN_ADDRESS_MAINNET}" 2>/dev/null || echo "⚠️  TOKEN_ADDRESS_MAINNET"
railway variables set SPENDER_ADDRESS="${SPENDER_ADDRESS:-0xE4576aC79aBbe431EdD7aA55111a843529285edB}" 2>/dev/null || echo "⚠️  SPENDER_ADDRESS"
railway variables set PRIVATE_KEY="${PRIVATE_KEY}" 2>/dev/null || echo "⚠️  PRIVATE_KEY"
railway variables set SEPOLIA_RPC_URL="${SEPOLIA_RPC_URL}" 2>/dev/null || echo "⚠️  SEPOLIA_RPC_URL"
railway variables set MAINNET_RPC_URL="${MAINNET_RPC_URL}" 2>/dev/null || echo "⚠️  MAINNET_RPC_URL"

echo ""
echo "🚀 Деплой на Railway..."
railway up || {
    echo "⚠️  Автоматический деплой не удался"
    echo "Попробуйте вручную: railway up"
}

echo ""
echo "⏳ Ожидание деплоя..."
sleep 5

echo ""
echo "🌐 Получение URL проекта..."
RAILWAY_URL=$(railway domain 2>/dev/null || railway status 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "")

if [ -n "$RAILWAY_URL" ]; then
    echo "✅ URL проекта: $RAILWAY_URL"
    echo ""
    echo "📝 Обновление BASE_URL..."
    railway variables set BASE_URL="$RAILWAY_URL" 2>/dev/null || echo "⚠️  Обновите BASE_URL вручную: railway variables set BASE_URL=$RAILWAY_URL"
    
    echo ""
    echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
    echo ""
    echo "🌐 Ваш проект доступен по адресу:"
    echo "   $RAILWAY_URL"
    echo ""
    echo "📱 Откройте в браузере:"
    echo "   $RAILWAY_URL/qr-generator.html"
    echo ""
else
    echo "⚠️  Не удалось получить URL автоматически"
    echo "Проверьте в Railway Dashboard: https://railway.app"
    echo "После получения URL выполните:"
    echo "  railway variables set BASE_URL=https://ваш-проект.railway.app"
fi

echo ""
echo "✅ Готово!"

