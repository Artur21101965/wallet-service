const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('🔍 Проверка конфигурации...\n');

require('dotenv').config({ path: envPath });

const checks = {
    envFile: fs.existsSync(envPath),
    privateKey: !!process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== '0x...' && process.env.PRIVATE_KEY.length > 10,
    spenderAddress: !!process.env.SPENDER_ADDRESS && process.env.SPENDER_ADDRESS !== '0x...' && process.env.SPENDER_ADDRESS.startsWith('0x'),
    sepoliaRpc: !!process.env.SEPOLIA_RPC_URL && !process.env.SEPOLIA_RPC_URL.includes('YOUR_KEY'),
    mainnetRpc: !!process.env.MAINNET_RPC_URL && !process.env.MAINNET_RPC_URL.includes('YOUR_KEY'),
    tokenSepolia: !!process.env.TOKEN_ADDRESS_SEPOLIA && process.env.TOKEN_ADDRESS_SEPOLIA !== '0x...',
    tokenMainnet: !!process.env.TOKEN_ADDRESS_MAINNET && process.env.TOKEN_ADDRESS_MAINNET !== '0x...'
};

console.log('📋 Статус конфигурации:');
console.log('   .env файл:', checks.envFile ? '✅' : '❌');
console.log('   Приватный ключ:', checks.privateKey ? '✅' : '❌');
console.log('   Адрес получателя:', checks.spenderAddress ? '✅' : '❌');
console.log('   Sepolia RPC URL:', checks.sepoliaRpc ? '✅' : '❌');
console.log('   Mainnet RPC URL:', checks.mainnetRpc ? '✅' : '❌');
console.log('   Токен Sepolia:', checks.tokenSepolia ? '✅' : '❌');
console.log('   Токен Mainnet:', checks.tokenMainnet ? '✅' : '❌');

const allReady = Object.values(checks).every(v => v === true);

if (!allReady) {
    console.log('\n⚠️  Не все настройки заполнены:');
    if (!checks.envFile) console.log('   - Создайте .env файл: cp env.example .env');
    if (!checks.privateKey) console.log('   - Заполните PRIVATE_KEY в .env');
    if (!checks.spenderAddress) console.log('   - Заполните SPENDER_ADDRESS в .env');
    if (!checks.sepoliaRpc) console.log('   - Заполните SEPOLIA_RPC_URL в .env');
    if (!checks.mainnetRpc) console.log('   - Заполните MAINNET_RPC_URL в .env');
    if (!checks.tokenSepolia) console.log('   - Разверните контракт в Sepolia и заполните TOKEN_ADDRESS_SEPOLIA');
    if (!checks.tokenMainnet) console.log('   - Разверните контракт в Mainnet и заполните TOKEN_ADDRESS_MAINNET');
} else {
    console.log('\n✅ Все настройки готовы!');
    console.log('   Сеть по умолчанию:', process.env.NETWORK || 'sepolia');
    console.log('   Адрес получателя:', process.env.SPENDER_ADDRESS);
}

console.log('');

