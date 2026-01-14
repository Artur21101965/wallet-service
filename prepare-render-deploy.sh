#!/bin/bash

echo "📋 Подготовка данных для деплоя на Render"
echo "=========================================="
echo ""

if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    exit 1
fi

source .env

echo "✅ Настройки для Render:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 НАСТРОЙКИ СЕРВИСА:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Name: wallet-service"
echo "Environment: Node"
echo "Build Command: npm install"
echo "Start Command: npm start"
echo "Plan: Free"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (скопируйте в Render):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "NETWORK=${NETWORK:-sepolia}"
echo "SPENDER_ADDRESS=${SPENDER_ADDRESS:-0xE4576aC79aBbe431EdD7aA55111a843529285edB}"
echo "PORT=10000"

if [ -n "$TOKEN_ADDRESS_SEPOLIA" ]; then
    echo "TOKEN_ADDRESS_SEPOLIA=$TOKEN_ADDRESS_SEPOLIA"
else
    echo "# TOKEN_ADDRESS_SEPOLIA=ваш_адрес (не задан)"
fi

if [ -n "$TOKEN_ADDRESS_MAINNET" ]; then
    echo "TOKEN_ADDRESS_MAINNET=$TOKEN_ADDRESS_MAINNET"
else
    echo "# TOKEN_ADDRESS_MAINNET=ваш_адрес (не задан)"
fi

if [ -n "$PRIVATE_KEY" ]; then
    echo "PRIVATE_KEY=$PRIVATE_KEY"
else
    echo "# PRIVATE_KEY=ваш_ключ (не задан)"
fi

if [ -n "$SEPOLIA_RPC_URL" ]; then
    echo "SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL"
else
    echo "# SEPOLIA_RPC_URL=ваш_rpc (не задан)"
fi

if [ -n "$MAINNET_RPC_URL" ]; then
    echo "MAINNET_RPC_URL=$MAINNET_RPC_URL"
else
    echo "# MAINNET_RPC_URL=ваш_rpc (не задан)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 ИНСТРУКЦИЯ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Откройте https://render.com"
echo "2. New + → Web Service"
echo "3. Подключите: Artur21101965/wallet-service"
echo "4. Используйте настройки выше"
echo "5. Добавьте переменные окружения (скопируйте выше)"
echo "6. Create Web Service"
echo ""
echo "📖 Подробно: DEPLOY_RENDER_NOW.md"
echo ""

