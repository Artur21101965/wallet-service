#!/bin/bash

echo "📦 Настройка GitHub репозитория"
echo "================================"
echo ""

echo "1. Сначала создайте репозиторий на GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Название: wallet-service"
echo "3. НЕ добавляйте README, .gitignore, лицензию"
echo "4. Создайте репозиторий"
echo ""
read -p "Нажмите Enter после создания репозитория..."

echo ""
echo "5. Введите ваш GitHub username:"
read -p "Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Username не может быть пустым"
    exit 1
fi

echo ""
echo "Удаляю старый remote..."
git remote remove origin 2>/dev/null

echo "Добавляю новый remote..."
git remote add origin "https://github.com/${GITHUB_USERNAME}/wallet-service.git"

echo ""
echo "Проверяю remote..."
git remote -v

echo ""
echo "Загружаю код на GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Успешно! Репозиторий создан и код загружен!"
    echo ""
    echo "🌐 Ваш репозиторий: https://github.com/${GITHUB_USERNAME}/wallet-service"
    echo ""
    echo "📋 Следующий шаг: Деплой на Render"
    echo "   См. DEPLOY_RENDER.md или START_RENDER.txt"
else
    echo ""
    echo "❌ Ошибка при загрузке. Проверьте:"
    echo "   1. Репозиторий создан на GitHub"
    echo "   2. Username правильный"
    echo "   3. У вас есть доступ к репозиторию"
fi

