# ⚡ Быстрое исправление

## Проблема: Railway ограниченный план + переменные не устанавливаются

### Решение 1: Установите переменные вручную

Выполните:
```bash
./set-railway-vars.sh
```

Или вручную через веб-интерфейс:
1. Откройте https://railway.app
2. Выберите проект `wallet-service`
3. Settings → Variables
4. Добавьте все переменные из `.env`

### Решение 2: Используйте Render (бесплатный)

1. Откройте https://render.com
2. New + → Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Environment: Node
   - Build: `npm install`
   - Start: `npm start`
   - Plan: Free
5. Добавьте переменные окружения
6. Create Web Service

### Решение 3: Деплой через веб-интерфейс Railway

1. Откройте https://railway.app
2. Выберите проект
3. Подключите GitHub репозиторий
4. Railway автоматически задеплоит
5. Добавьте переменные в Settings → Variables

---

## После установки переменных:

1. Railway перезапустит проект автоматически
2. Получите URL проекта
3. Добавьте: `BASE_URL=https://ваш-проект.railway.app`
4. Готово! ✅

