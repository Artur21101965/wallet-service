const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const tokenAddress = '0xc1f52368fb7d84AA84F843957387d563AeD840D8';

console.log('📝 Обновление адреса контракта в .env...\n');

if (!fs.existsSync(envPath)) {
    console.log('❌ Файл .env не найден');
    process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

envContent = envContent.replace(
    /TOKEN_ADDRESS_SEPOLIA=.*/,
    `TOKEN_ADDRESS_SEPOLIA=${tokenAddress}`
);

fs.writeFileSync(envPath, envContent);

console.log('✅ Адрес контракта обновлен:');
console.log(`   TOKEN_ADDRESS_SEPOLIA=${tokenAddress}\n`);

