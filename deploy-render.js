const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Автоматический деплой на Render\n');

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const GITHUB_REPO = 'Artur21101965/wallet-service';

if (!RENDER_API_KEY) {
    console.log('⚠️  RENDER_API_KEY не найден в .env\n');
    console.log('Для автоматического деплоя через API:');
    console.log('1. Получите API ключ: https://dashboard.render.com/account/api-keys');
    console.log('2. Добавьте в .env: RENDER_API_KEY=ваш_ключ\n');
    console.log('Альтернатива: Используйте веб-интерфейс Render');
    console.log('1. Откройте https://render.com');
    console.log('2. New + → Web Service');
    console.log('3. Подключите репозиторий: Artur21101965/wallet-service\n');
    process.exit(0);
}

const renderAPI = {
    baseURL: 'api.render.com',
    apiKey: RENDER_API_KEY
};

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function getOwnerID() {
    console.log('🔍 Получение информации о владельце...\n');
    
    const options = {
        hostname: renderAPI.baseURL,
        path: '/v1/owners',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${renderAPI.apiKey}`,
            'Accept': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        if (response.status === 200 && response.data.length > 0) {
            return response.data[0].owner.id;
        }
    } catch (error) {
        console.log('⚠️  Не удалось получить ownerID автоматически');
    }
    return null;
}

async function createService() {
    console.log('📦 Создание Web Service на Render...\n');
    
    const ownerID = await getOwnerID();
    if (!ownerID) {
        console.log('⚠️  Не удалось получить ownerID. Используйте веб-интерфейс.\n');
        return null;
    }
    
    const envVars = [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '10000' },
        { key: 'NETWORK', value: process.env.NETWORK || 'sepolia' },
        { key: 'SPENDER_ADDRESS', value: process.env.SPENDER_ADDRESS || '0xE4576aC79aBbe431EdD7aA55111a843529285edB' }
    ];
    
    if (process.env.TOKEN_ADDRESS_SEPOLIA) {
        envVars.push({ key: 'TOKEN_ADDRESS_SEPOLIA', value: process.env.TOKEN_ADDRESS_SEPOLIA });
    }
    if (process.env.TOKEN_ADDRESS_MAINNET) {
        envVars.push({ key: 'TOKEN_ADDRESS_MAINNET', value: process.env.TOKEN_ADDRESS_MAINNET });
    }
    if (process.env.PRIVATE_KEY) {
        envVars.push({ key: 'PRIVATE_KEY', value: process.env.PRIVATE_KEY });
    }
    if (process.env.SEPOLIA_RPC_URL) {
        envVars.push({ key: 'SEPOLIA_RPC_URL', value: process.env.SEPOLIA_RPC_URL });
    }
    if (process.env.MAINNET_RPC_URL) {
        envVars.push({ key: 'MAINNET_RPC_URL', value: process.env.MAINNET_RPC_URL });
    }
    
    const serviceData = {
        type: 'web_service',
        name: 'wallet-service',
        ownerId: ownerID,
        repo: `https://github.com/${GITHUB_REPO}`,
        branch: 'main',
        serviceDetails: {
            runtime: 'node',
            planId: 'free',
            envVars: envVars,
            envSpecificDetails: {
                buildCommand: 'npm install',
                startCommand: 'npm start'
            }
        }
    };
    
    const options = {
        hostname: renderAPI.baseURL,
        path: '/v1/services',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${renderAPI.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options, serviceData);
        
        if (response.status === 201 || response.status === 200) {
            console.log('✅ Сервис создан!\n');
            const service = response.data.service || response.data;
            const serviceId = service.id || service.service?.id;
            const url = service.serviceDetails?.url || service.url;
            
            if (url) {
                console.log('🌐 URL:', url);
                console.log('\n📝 Настраиваю BASE_URL...');
                await setBaseURL(serviceId, url);
            } else {
                console.log('🌐 URL: Проверьте в Dashboard');
                console.log('   https://dashboard.render.com');
                console.log('\n📝 После получения URL добавьте BASE_URL вручную');
            }
            return response.data;
        } else {
            console.log('⚠️  Ответ API:', response.status, response.data);
            console.log('\n💡 Используйте веб-интерфейс: https://render.com');
            return null;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.log('\n💡 Используйте веб-интерфейс: https://render.com');
        return null;
    }
}

async function setBaseURL(serviceId, url) {
    if (!serviceId || !url) return;
    
    const options = {
        hostname: renderAPI.baseURL,
        path: `/v1/services/${serviceId}/env-vars`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${renderAPI.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    const data = {
        envVar: {
            key: 'BASE_URL',
            value: url
        }
    };
    
    try {
        const response = await makeRequest(options, data);
        if (response.status === 201 || response.status === 200) {
            console.log('✅ BASE_URL установлен:', url);
        } else {
            console.log('⚠️  Не удалось установить BASE_URL автоматически');
            console.log('   Добавьте вручную: BASE_URL=' + url);
        }
    } catch (error) {
        console.log('⚠️  Ошибка при установке BASE_URL:', error.message);
        console.log('   Добавьте вручную: BASE_URL=' + url);
    }
}

async function getServiceURL(serviceId) {
    const options = {
        hostname: renderAPI.baseURL,
        path: `/v1/services/${serviceId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${renderAPI.apiKey}`,
            'Accept': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        if (response.status === 200) {
            const service = response.data.service || response.data;
            return service.serviceDetails?.url || service.url;
        }
    } catch (error) {
        // Ignore
    }
    return null;
}

async function main() {
    console.log('Проверка конфигурации...\n');
    
    if (!fs.existsSync('.env')) {
        console.log('⚠️  Файл .env не найден\n');
        console.log('Создайте .env из env.example и заполните значения\n');
        process.exit(1);
    }
    
    const result = await createService();
    
    if (result) {
        const service = result.service || result;
        const serviceId = service.id || service.service?.id;
        
        console.log('\n✅ Деплой инициирован!');
        console.log('⏳ Ожидание получения URL...\n');
        
        // Подождем немного и попробуем получить URL
        setTimeout(async () => {
            const url = await getServiceURL(serviceId);
            if (url) {
                console.log('🌐 URL сервиса:', url);
                await setBaseURL(serviceId, url);
                console.log('\n✅ ВСЁ ГОТОВО!');
                console.log('📱 Откройте:', url + '/qr-generator.html');
            } else {
                console.log('📋 Проверьте статус: https://dashboard.render.com');
                console.log('   После получения URL добавьте BASE_URL вручную');
            }
        }, 3000);
        
        console.log('Проверьте статус: https://dashboard.render.com\n');
    } else {
        console.log('\n📋 Ручной деплой:');
        console.log('1. https://render.com → New + → Web Service');
        console.log('2. Подключите: Artur21101965/wallet-service');
        console.log('3. Настройки из render.yaml');
        console.log('4. Добавьте переменные из .env\n');
    }
}

main();

