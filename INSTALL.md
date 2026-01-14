# Инструкция по установке и настройке

## Шаг 1: Установка зависимостей

```bash
npm install --legacy-peer-deps
```

**Важно:** Используйте флаг `--legacy-peer-deps` для решения конфликта версий между ethers 5 и hardhat-toolbox.

## Шаг 2: Создание .env файла

```bash
cp env.example .env
```

Или создайте файл `.env` вручную и скопируйте содержимое из `env.example`.

## Шаг 3: Настройка .env файла

Откройте `.env` файл и заполните:

### Обязательные настройки:

1. **RPC URLs** (получите на [Infura](https://infura.io) или [Alchemy](https://alchemy.com)):
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   ```

2. **Адреса контрактов** (после развертывания):
   ```
   TOKEN_ADDRESS_SEPOLIA=0x...  # Заполните после развертывания в Sepolia
   TOKEN_ADDRESS_MAINNET=0x...  # Заполните после развертывания в Mainnet
   ```

### Уже настроено:

- ✅ `PRIVATE_KEY` - уже заполнен
- ✅ `SPENDER_ADDRESS` - уже заполнен (0xE4576aC79aBbe431EdD7aA55111a843529285edB)
- ✅ `NETWORK` - по умолчанию sepolia

## Шаг 4: Развертывание контракта

### В Sepolia (тестовая сеть):

```bash
npm run deploy:sepolia
```

После развертывания скопируйте адрес контракта и добавьте в `.env`:
```
TOKEN_ADDRESS_SEPOLIA=0x...  # Адрес из вывода команды
```

### В Mainnet (когда будете готовы):

```bash
npm run deploy:mainnet
```

После развертывания скопируйте адрес контракта и добавьте в `.env`:
```
TOKEN_ADDRESS_MAINNET=0x...  # Адрес из вывода команды
```

## Шаг 5: Проверка конфигурации

```bash
npm run check
```

Эта команда покажет, что еще нужно настроить.

## Шаг 6: Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

## Полезные команды

- `npm run setup` - показать инструкции по настройке
- `npm run check` - проверить конфигурацию
- `npm run deploy:sepolia` - развернуть контракт в Sepolia
- `npm run deploy:mainnet` - развернуть контракт в Mainnet
- `npm run dev` - запустить сервер в режиме разработки (с автоперезагрузкой)

## Получение RPC ключей

### Infura:
1. Зарегистрируйтесь на [infura.io](https://infura.io)
2. Создайте новый проект
3. Скопируйте API ключ
4. Используйте URL: `https://sepolia.infura.io/v3/YOUR_KEY`

### Alchemy:
1. Зарегистрируйтесь на [alchemy.com](https://alchemy.com)
2. Создайте новый приложение
3. Скопируйте API ключ
4. Используйте URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

