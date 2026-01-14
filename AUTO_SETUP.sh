#!/bin/bash

set -e

echo "🚀 Автоматическая настройка GitHub и деплой на Render"
echo "======================================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "📦 Проверка git статуса..."
if [ ! -d ".git" ]; then
    echo "Инициализация git..."
    git init
    git config user.email "deploy@wallet-service.local" || true
    git config user.name "Deploy Bot" || true
fi

git add -A
git commit -m "Ready for deployment" || echo "Нет изменений для коммита"

echo ""
echo "🔍 Проверка GitHub CLI..."
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI установлен"
    
    if gh auth status &> /dev/null; then
        echo "✅ Авторизован в GitHub"
        
        echo ""
        echo "📦 Создание GitHub репозитория..."
        REPO_NAME="wallet-service"
        
        if gh repo view "$REPO_NAME" &> /dev/null; then
            echo "✅ Репозиторий $REPO_NAME уже существует"
        else
            echo "Создаю новый репозиторий..."
            gh repo create "$REPO_NAME" --public --source=. --remote=origin --push 2>&1 | grep -v "warning" || {
                echo "⚠️  Не удалось создать автоматически"
                echo "Создайте вручную: https://github.com/new"
                exit 1
            }
        fi
        
        echo ""
        echo "📤 Загрузка кода на GitHub..."
        git push -u origin main || git push -u origin master
        
        echo ""
        echo "✅ GitHub репозиторий готов!"
        echo "🌐 URL: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
        
    else
        echo "⚠️  Не авторизован в GitHub CLI"
        echo "Выполните: gh auth login"
        exit 1
    fi
else
    echo "⚠️  GitHub CLI не установлен"
    echo ""
    echo "📋 Инструкция для ручной настройки:"
    echo ""
    echo "1. Создайте репозиторий: https://github.com/new"
    echo "   Название: wallet-service"
    echo "   НЕ добавляйте README, .gitignore, лицензию"
    echo ""
    echo "2. Выполните команды:"
    echo "   git remote add origin https://github.com/ВАШ-USERNAME/wallet-service.git"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi

echo ""
echo "🎯 Следующий шаг: Деплой на Render"
echo ""
echo "1. Откройте https://render.com"
echo "2. Войдите через GitHub"
echo "3. New + → Web Service"
echo "4. Подключите репозиторий: wallet-service"
echo "5. Настройки:"
echo "   - Environment: Node"
echo "   - Build: npm install"
echo "   - Start: npm start"
echo "   - Plan: Free"
echo "6. Добавьте переменные окружения из .env"
echo "7. Create Web Service"
echo ""
echo "📝 Подробная инструкция: DEPLOY_RENDER.md"
echo ""

