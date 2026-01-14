# 🔧 Исправление проблем с Railway

## Проблема 1: Ограниченный план Railway

Railway заблокировал деплой из-за ограниченного плана. Решения:

### Вариант A: Обновить план Railway
1. Откройте https://railway.app/account/plans
2. Выберите бесплатный план (если доступен) или платный
3. Попробуйте деплой снова

### Вариант B: Использовать Render (бесплатный)
См. инструкцию ниже в разделе "Альтернатива: Render"

### Вариант C: Деплой через веб-интерфейс Railway
1. Откройте https://railway.app
2. Выберите ваш проект `wallet-service`
3. Нажмите "Deploy" или подключите GitHub репозиторий

---

## Проблема 2: Переменные окружения не устанавливаются

### Решение: Установите переменные вручную

#### Способ 1: Через веб-интерфейс (рекомендуется)

1. Откройте ваш проект в Railway: https://railway.app/project/ваш-проект-id
2. Перейдите в **Settings** → **Variables**
3. Нажмите **"New Variable"** и добавьте каждую:

```
NETWORK = sepolia
TOKEN_ADDRESS_SEPOLIA = ваш_адрес_контракта
TOKEN_ADDRESS_MAINNET = ваш_адрес_контракта
SPENDER_ADDRESS = 0xE4576aC79aBbe431EdD7aA55111a843529285edB
PRIVATE_KEY = ваш_приватный_ключ
SEPOLIA_RPC_URL = ваш_rpc_url
MAINNET_RPC_URL = ваш_rpc_url
```

#### Способ 2: Через CLI (по одной команде)

```bash
railway variables set NETWORK=sepolia
railway variables set TOKEN_ADDRESS_SEPOLIA=ваш_адрес
railway variables set TOKEN_ADDRESS_MAINNET=ваш_адрес
railway variables set SPENDER_ADDRESS=0xE4576aC79aBbe431EdD7aA55111a843529285edB
railway variables set PRIVATE_KEY=ваш_ключ
railway variables set SEPOLIA_RPC_URL=ваш_rpc
railway variables set MAINNET_RPC_URL=ваш_rpc
```

**Важно:** Не используйте кавычки в CLI командах Railway!

---

## Альтернатива: Render (бесплатный план)

Если Railway не работает, используйте Render:

### Шаги:

1. **Откройте https://render.com** и войдите через GitHub

2. **New +** → **Web Service**

3. **Подключите GitHub репозиторий** (создайте его, если еще нет)

4. **Настройки:**
   - Name: `wallet-service`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

5. **Добавьте переменные окружения:**
   - В разделе "Environment Variables"
   - Добавьте все из вашего `.env` файла

6. **Create Web Service**

7. **После деплоя:**
   - Получите URL (например: `https://wallet-service.onrender.com`)
   - Добавьте переменную: `BASE_URL=https://wallet-service.onrender.com`

---

## После настройки переменных:

1. Railway автоматически перезапустит проект
2. Получите URL проекта
3. Добавьте `BASE_URL` с вашим реальным URL
4. Проверьте работу: откройте `https://ваш-домен/qr-generator.html`

---

## Быстрая команда для установки всех переменных:

Скопируйте значения из `.env` и выполните:

```bash
railway variables set NETWORK=$(grep NETWORK .env | cut -d '=' -f2)
railway variables set SPENDER_ADDRESS=$(grep SPENDER_ADDRESS .env | cut -d '=' -f2)
railway variables set PRIVATE_KEY=$(grep PRIVATE_KEY .env | cut -d '=' -f2)
railway variables set SEPOLIA_RPC_URL=$(grep SEPOLIA_RPC_URL .env | cut -d '=' -f2)
railway variables set MAINNET_RPC_URL=$(grep MAINNET_RPC_URL .env | cut -d '=' -f2)
railway variables set TOKEN_ADDRESS_SEPOLIA=$(grep TOKEN_ADDRESS_SEPOLIA .env | cut -d '=' -f2)
railway variables set TOKEN_ADDRESS_MAINNET=$(grep TOKEN_ADDRESS_MAINNET .env | cut -d '=' -f2)
```

