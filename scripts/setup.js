const fs = require('fs');
const path = require('path');

console.log('🚀 Настройка проекта...\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Создание .env файла...');
    try {
        const envExample = fs.readFileSync(envExamplePath, 'utf8');
        fs.writeFileSync(envPath, envExample);
        console.log('✅ .env файл создан из env.example\n');
    } catch (error) {
        console.log('⚠️  Не удалось создать .env файл автоматически');
        console.log('   Создайте его вручную: cp env.example .env\n');
    }
} else {
    console.log('ℹ️  .env файл уже существует\n');
}

console.log('📋 Текущая конфигурация:');
console.log('   - Сеть по умолчанию: Sepolia');
console.log('   - Адрес получателя: 0xE4576aC79aBbe431EdD7aA55111a843529285edB');
console.log('   - Приватный ключ: настроен\n');

console.log('⚠️  ВАЖНО:');
console.log('   1. Заполните RPC URLs в .env файле:');
console.log('      - SEPOLIA_RPC_URL (получите на infura.io или alchemy.com)');
console.log('      - MAINNET_RPC_URL (получите на infura.io или alchemy.com)');
console.log('   2. Разверните контракты:');
console.log('      npx hardhat run scripts/deploy.js --network sepolia');
console.log('   3. Сохраните адреса контрактов в .env:\n');
console.log('      TOKEN_ADDRESS_SEPOLIA=0x...');
console.log('      TOKEN_ADDRESS_MAINNET=0x...\n');

console.log('✅ Настройка завершена!');

