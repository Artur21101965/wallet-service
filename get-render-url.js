const https = require('https');
require('dotenv').config();

const RENDER_API_KEY = process.env.RENDER_API_KEY || 'rnd_fwHxTWK8SvO3VJCAwRuEn5zkyu9s';

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

async function getServices() {
    const options = {
        hostname: 'api.render.com',
        path: '/v1/services',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
    return null;
}

async function getServiceDetails(serviceId) {
    const options = {
        hostname: 'api.render.com',
        path: `/v1/services/${serviceId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
    return null;
}

async function setBaseURL(serviceId, url) {
    const options = {
        hostname: 'api.render.com',
        path: `/v1/services/${serviceId}/env-vars`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
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
            return true;
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
    return false;
}

async function main() {
    console.log('🔍 Поиск сервиса wallet-service...\n');
    
    const services = await getServices();
    if (!services || !services.length) {
        console.log('❌ Сервисы не найдены');
        return;
    }
    
    const walletService = services.find(s => {
        const service = s.service || s;
        return service.name === 'wallet-service';
    });
    
    if (!walletService) {
        console.log('❌ Сервис wallet-service не найден');
        console.log('Найденные сервисы:', services.map(s => (s.service || s).name).join(', '));
        return;
    }
    
    const service = walletService.service || walletService;
    const serviceId = service.id;
    
    console.log('✅ Сервис найден:', service.name);
    console.log('📋 ID:', serviceId);
    
    const details = await getServiceDetails(serviceId);
    if (details) {
        const serviceData = details.service || details;
        const url = serviceData.serviceDetails?.url || serviceData.url;
        
        if (url) {
            console.log('\n🌐 URL сервиса:', url);
            console.log('\n📝 Настраиваю BASE_URL...');
            
            const success = await setBaseURL(serviceId, url);
            if (success) {
                console.log('✅ BASE_URL установлен:', url);
                console.log('\n✅ ВСЁ ГОТОВО!');
                console.log('📱 Откройте:', url + '/qr-generator.html');
            } else {
                console.log('⚠️  Не удалось установить BASE_URL автоматически');
                console.log('   Добавьте вручную в Render Dashboard:');
                console.log('   BASE_URL=' + url);
            }
        } else {
            console.log('\n⚠️  URL еще не доступен');
            console.log('   Сервис может быть в процессе деплоя');
            console.log('   Проверьте: https://dashboard.render.com');
        }
    }
}

main();

