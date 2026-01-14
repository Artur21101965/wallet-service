# Настройка для Sepolia и Mainnet

## Быстрая настройка

1. Скопируйте `env.example` в `.env`:
```bash
cp env.example .env
```

2. Заполните `.env` файл:

```env
PORT=3000
NETWORK=sepolia

# Адреса контрактов токенов
TOKEN_ADDRESS_SEPOLIA=0x...  # Замените на адрес вашего контракта в Sepolia
TOKEN_ADDRESS_MAINNET=0x...  # Замените на адрес вашего контракта в Mainnet

# Адрес получателя разрешения
SPENDER_ADDRESS=0xE4576aC79aBbe431EdD7aA55111a843529285edB

# RPC URLs (получите на infura.io или alchemy.com)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Приватный ключ (уже заполнен)
PRIVATE_KEY=0xf2c2d9da30ec7da900c3b756ee6ceaabb337b111568448a46197c7b50669df2d
```

## Развертывание контракта

### Sepolia (тестовая сеть)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

После развертывания сохраните адрес контракта в `.env` файле.

## Переключение сетей

1. Через интерфейс: используйте селектор сети в `/qr-generator.html` или `/index.html`
2. Через API: 
   - GET `/api/network` - получить текущую сеть
   - POST `/api/network` - переключить сеть
3. Через переменную окружения: измените `NETWORK=sepolia` на `NETWORK=mainnet` в `.env`

## Важно

- ⚠️ Приватный ключ уже настроен, но убедитесь, что `.env` файл не коммитится в git
- ⚠️ Для Mainnet используйте реальные RPC URLs (Infura, Alchemy и т.д.)
- ⚠️ Адреса контрактов должны быть развернуты в соответствующих сетях

