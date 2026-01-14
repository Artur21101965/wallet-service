// ⚠️ ВНИМАНИЕ: Этот скрипт создан только для образовательных целей

const ethers = require('ethers');
require('dotenv').config();

async function withdraw() {
    const args = process.argv.slice(2);
    const permitId = args[0];
    const amount = args[1]; // Опционально, если не указано - списывается вся разрешенная сумма
    
    if (!permitId) {
        console.error('Использование: node withdraw.js <permitId> [amount]');
        process.exit(1);
    }
    
    console.log('\n⚠️  ВНИМАНИЕ: Используйте только с тестовыми кошельками!\n');
    
    // Здесь должна быть логика получения permit из базы данных
    // Для примера используем прямые параметры
    console.log('Permit ID:', permitId);
    if (amount) {
        console.log('Сумма для списания:', amount);
    } else {
        console.log('Будет списана вся разрешенная сумма');
    }
    
    // Отправляем запрос на сервер
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/withdraw`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            permitId: permitId,
            amount: amount
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        console.log('\n✅ Средства успешно списаны!');
        console.log('TX Hash:', result.txHash);
        console.log('Сумма:', result.amount);
    } else {
        console.error('\n❌ Ошибка:', result.error);
    }
}

withdraw().catch(console.error);

