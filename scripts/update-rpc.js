const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Обновление RPC URLs на более надежные...\n');

if (!fs.existsSync(envPath)) {
    console.log('❌ Файл .env не найден');
    process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Альтернативные публичные RPC endpoints
const rpcUrls = {
    sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
    mainnet: 'https://ethereum-rpc.publicnode.com'
};

envContent = envContent.replace(
    /SEPOLIA_RPC_URL=.*/,
    `SEPOLIA_RPC_URL=${rpcUrls.sepolia}`
);

envContent = envContent.replace(
    /MAINNET_RPC_URL=.*/,
    `MAINNET_RPC_URL=${rpcUrls.mainnet}`
);

fs.writeFileSync(envPath, envContent);

console.log('✅ RPC URLs обновлены:');
console.log(`   Sepolia: ${rpcUrls.sepolia}`);
console.log(`   Mainnet: ${rpcUrls.mainnet}\n`);

