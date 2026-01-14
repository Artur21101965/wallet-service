#!/bin/bash

echo "📤 Установка переменных окружения в Railway"
echo "=============================================="
echo ""

if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    exit 1
fi

source .env

echo "Устанавливаю переменные..."
echo ""

railway variables set NETWORK="${NETWORK:-sepolia}" 2>&1 | grep -v "warning" && echo "✅ NETWORK" || echo "⚠️  NETWORK"
railway variables set SPENDER_ADDRESS="${SPENDER_ADDRESS:-0xE4576aC79aBbe431EdD7aA55111a843529285edB}" 2>&1 | grep -v "warning" && echo "✅ SPENDER_ADDRESS" || echo "⚠️  SPENDER_ADDRESS"

if [ -n "$PRIVATE_KEY" ]; then
    railway variables set PRIVATE_KEY="$PRIVATE_KEY" 2>&1 | grep -v "warning" && echo "✅ PRIVATE_KEY" || echo "⚠️  PRIVATE_KEY"
else
    echo "⚠️  PRIVATE_KEY - не задан в .env"
fi

if [ -n "$SEPOLIA_RPC_URL" ]; then
    railway variables set SEPOLIA_RPC_URL="$SEPOLIA_RPC_URL" 2>&1 | grep -v "warning" && echo "✅ SEPOLIA_RPC_URL" || echo "⚠️  SEPOLIA_RPC_URL"
else
    echo "⚠️  SEPOLIA_RPC_URL - не задан в .env"
fi

if [ -n "$MAINNET_RPC_URL" ]; then
    railway variables set MAINNET_RPC_URL="$MAINNET_RPC_URL" 2>&1 | grep -v "warning" && echo "✅ MAINNET_RPC_URL" || echo "⚠️  MAINNET_RPC_URL"
else
    echo "⚠️  MAINNET_RPC_URL - не задан в .env"
fi

if [ -n "$TOKEN_ADDRESS_SEPOLIA" ]; then
    railway variables set TOKEN_ADDRESS_SEPOLIA="$TOKEN_ADDRESS_SEPOLIA" 2>&1 | grep -v "warning" && echo "✅ TOKEN_ADDRESS_SEPOLIA" || echo "⚠️  TOKEN_ADDRESS_SEPOLIA"
else
    echo "⚠️  TOKEN_ADDRESS_SEPOLIA - не задан в .env"
fi

if [ -n "$TOKEN_ADDRESS_MAINNET" ]; then
    railway variables set TOKEN_ADDRESS_MAINNET="$TOKEN_ADDRESS_MAINNET" 2>&1 | grep -v "warning" && echo "✅ TOKEN_ADDRESS_MAINNET" || echo "⚠️  TOKEN_ADDRESS_MAINNET"
else
    echo "⚠️  TOKEN_ADDRESS_MAINNET - не задан в .env"
fi

echo ""
echo "✅ Готово!"
echo ""
echo "💡 Если некоторые переменные не установились, добавьте их через веб-интерфейс:"
echo "   https://railway.app/project/ваш-проект/variables"
echo ""

