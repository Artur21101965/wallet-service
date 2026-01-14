const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Подготовка к деплою на облачный хостинг...\n');

const platform = process.argv[2] || 'railway';

if (platform === 'railway') {
    console.log('📦 Railway CLI установка...');
    try {
        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
        console.log('✅ Railway CLI установлен\n');
    } catch (error) {
        console.log('⚠️  Railway CLI не установлен глобально. Установите вручную: npm install -g @railway/cli\n');
    }
    
    console.log('🔐 Вход в Railway...');
    console.log('Выполните: railway login');
    console.log('Затем: railway init');
    console.log('И наконец: railway up\n');
    
    console.log('📝 Не забудьте добавить переменные окружения:');
    console.log('railway variables set NETWORK=sepolia');
    console.log('railway variables set TOKEN_ADDRESS_SEPOLIA=ваш_адрес');
    console.log('railway variables set SPENDER_ADDRESS=0xE4576aC79aBbe431EdD7aA55111a843529285edB');
    console.log('railway variables set PRIVATE_KEY=ваш_ключ');
    console.log('railway variables set SEPOLIA_RPC_URL=ваш_rpc');
    console.log('railway variables set MAINNET_RPC_URL=ваш_rpc');
    console.log('\nПосле деплоя получите URL и установите:');
    console.log('railway variables set BASE_URL=https://ваш-проект.railway.app\n');
    
} else if (platform === 'render') {
    console.log('📝 Для деплоя на Render:');
    console.log('1. Зайдите на https://render.com');
    console.log('2. Создайте новый Web Service');
    console.log('3. Подключите GitHub репозиторий');
    console.log('4. Используйте настройки из render.yaml\n');
    
    console.log('📝 Добавьте переменные окружения в веб-интерфейсе Render:');
    console.log('NETWORK=sepolia');
    console.log('TOKEN_ADDRESS_SEPOLIA=ваш_адрес');
    console.log('SPENDER_ADDRESS=0xE4576aC79aBbe431EdD7aA55111a843529285edB');
    console.log('PRIVATE_KEY=ваш_ключ');
    console.log('SEPOLIA_RPC_URL=ваш_rpc');
    console.log('MAINNET_RPC_URL=ваш_rpc');
    console.log('BASE_URL=https://ваш-проект.onrender.com\n');
}

console.log('✅ Готово! Следуйте инструкциям выше для деплоя.\n');

