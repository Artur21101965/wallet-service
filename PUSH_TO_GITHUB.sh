#!/bin/bash

echo "📤 Загрузка кода на GitHub"
echo "=========================="
echo ""

cd "$(dirname "$0")"

echo "Проверка remote..."
git remote -v

echo ""
echo "Попытка загрузки через HTTPS..."
echo "Если запросит пароль, используйте Personal Access Token"
echo ""

git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Успешно загружено на GitHub!"
    echo "🌐 Репозиторий: https://github.com/Artur21101965/wallet-service"
    echo ""
    echo "📋 Следующий шаг: Деплой на Render"
    echo "   См. DEPLOY_RENDER.md"
else
    echo ""
    echo "⚠️  Не удалось загрузить автоматически"
    echo ""
    echo "Решение:"
    echo "1. Создайте Personal Access Token:"
    echo "   https://github.com/settings/tokens"
    echo "   Permissions: repo (все)"
    echo ""
    echo "2. Выполните:"
    echo "   git push -u origin main"
    echo "   Username: Artur21101965"
    echo "   Password: ваш_токен"
    echo ""
    echo "Или используйте GitHub Desktop для загрузки"
fi

