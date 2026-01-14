// ⚠️ ВНИМАНИЕ: Этот скрипт создан только для образовательных целей

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function generateQR() {
    const args = process.argv.slice(2);
    const amount = args[0] || '100';
    const spender = args[1] || process.env.SPENDER_ADDRESS || '0x...';
    const host = args[2] || 'localhost:3000';
    
    const url = `http://${host}/index.html?token=${process.env.TOKEN_ADDRESS || '0x...'}&spender=${spender}&amount=${amount}`;
    
    console.log('\n⚠️  ВНИМАНИЕ: Используйте только с тестовыми кошельками!\n');
    console.log('URL:', url);
    console.log('Сумма:', amount);
    console.log('Получатель:', spender);
    console.log('\n');
    
    // Генерируем QR код
    const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2
    });
    
    // Сохраняем как изображение
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const outputPath = path.join(__dirname, '../qr-code.png');
    fs.writeFileSync(outputPath, base64Data, 'base64');
    
    console.log('✅ QR код сохранен в:', outputPath);
    console.log('\nОтсканируйте QR код в Trust Wallet для начала процесса.\n');
}

generateQR().catch(console.error);

