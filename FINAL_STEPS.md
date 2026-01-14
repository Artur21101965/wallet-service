# ✅ Финальные шаги для деплоя

## Текущий статус:

✅ Репозиторий создан: https://github.com/Artur21101965/wallet-service
✅ Код готов к загрузке
✅ Все файлы закоммичены

## Шаг 1: Загрузите код на GitHub

### Вариант A: Через терминал (если настроен доступ)

```bash
git push -u origin main
```

Если запросит пароль, используйте **Personal Access Token**:
1. Создайте токен: https://github.com/settings/tokens
2. Permissions: `repo` (все)
3. Используйте токен как пароль

### Вариант B: Через GitHub Desktop

1. Установите GitHub Desktop: https://desktop.github.com
2. Откройте проект
3. Нажмите "Publish repository"
4. Выберите репозиторий `wallet-service`

### Вариант C: Через веб-интерфейс GitHub

1. Откройте https://github.com/Artur21101965/wallet-service
2. Нажмите "uploading an existing file"
3. Перетащите все файлы проекта
4. Commit changes

---

## Шаг 2: Деплой на Render

После загрузки кода на GitHub:

1. **Откройте https://render.com**
2. **Войдите через GitHub**
3. **New +** → **Web Service**
4. **Подключите репозиторий:** `Artur21101965/wallet-service`
5. **Настройки:**
   - Name: `wallet-service`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free** ✅

6. **Добавьте переменные окружения** (Environment Variables):
   ```
   NETWORK=sepolia
   TOKEN_ADDRESS_SEPOLIA=ваш_адрес
   TOKEN_ADDRESS_MAINNET=ваш_адрес
   SPENDER_ADDRESS=0xE4576aC79aBbe431EdD7aA55111a843529285edB
   PRIVATE_KEY=ваш_ключ
   SEPOLIA_RPC_URL=ваш_rpc
   MAINNET_RPC_URL=ваш_rpc
   PORT=10000
   ```

7. **Create Web Service**

8. **После деплоя:**
   - Получите URL (например: `https://wallet-service.onrender.com`)
   - Settings → Environment
   - Добавьте: `BASE_URL=https://wallet-service.onrender.com`

---

## ✅ Готово!

Откройте: `https://ваш-проект.onrender.com/qr-generator.html`

---

## 📝 Быстрая команда для push:

```bash
# Если у вас настроен SSH ключ
git push -u origin main

# Или через HTTPS (потребуется токен)
git push -u origin main
# Username: Artur21101965
# Password: ваш_personal_access_token
```

---

## 🔗 Полезные ссылки:

- Репозиторий: https://github.com/Artur21101965/wallet-service
- Render Dashboard: https://dashboard.render.com
- Создать токен: https://github.com/settings/tokens

