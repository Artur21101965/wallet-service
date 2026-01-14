#!/bin/bash

echo "🚀 Автоматический деплой на Railway"
echo ""

if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Создайте его из env.example"
    exit 1
fi

echo "📦 Проверка git репозитория..."
if [ ! -d ".git" ]; then
    echo "Инициализация git..."
    git init
    git add .
    git commit -m "Initial commit: ready for deployment"
    echo "✅ Git репозиторий инициализирован"
fi

echo ""
echo "📝 Следующие шаги:"
echo ""
echo "1. Создайте репозиторий на GitHub (если еще нет):"
echo "   gh repo create wallet-service --public --source=. --remote=origin --push"
echo ""
echo "2. Или загрузите код вручную на GitHub"
echo ""
echo "3. Откройте https://railway.app и:"
echo "   - Нажмите 'New Project'"
echo "   - Выберите 'Deploy from GitHub repo'"
echo "   - Выберите ваш репозиторий"
echo ""
echo "4. Добавьте переменные окружения в Railway:"
echo "   - Откройте проект → Settings → Variables"
echo "   - Добавьте все переменные из .env файла"
echo ""
echo "5. После деплоя обновите BASE_URL на реальный URL проекта"
echo ""
echo "✅ Готово! Следуйте инструкциям выше."

