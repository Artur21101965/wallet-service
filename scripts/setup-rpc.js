const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Настройка RPC URLs...\n');

if (!fs.existsSync(envPath)) {
    console.log('❌ Файл .env не найден. Создайте его из env.example');
    process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Публичные RPC endpoints (не требуют ключей)
const publicRpcUrls = {
    sepolia: 'https://rpc.sepolia.org',
    mainnet: 'https://eth.llamarpc.com'
};

// Обновляем RPC URLs
envContent = envContent.replace(
    /SEPOLIA_RPC_URL=.*/,
    `SEPOLIA_RPC_URL=${publicRpcUrls.sepolia}`
);

envContent = envContent.replace(
    /MAINNET_RPC_URL=.*/,
    `MAINNET_RPC_URL=${publicRpcUrls.mainnet}`
);

fs.writeFileSync(envPath, envContent);

console.log('✅ RPC URLs настроены:');
console.log(`   Sepolia: ${publicRpcUrls.sepolia}`);
console.log(`   Mainnet: ${publicRpcUrls.mainnet}`);
console.log('\n⚠️  Примечание: Публичные RPC могут быть медленными.');
console.log('   Для продакшена рекомендуется использовать Infura или Alchemy.\n');

