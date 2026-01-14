const https = require('https');

const RENDER_API_KEY = 'rnd_fwHxTWK8SvO3VJCAwRuEn5zkyu9s';
const SERVICE_ID = 'srv-d5k0ouogjchc739pbqlg';
const BASE_URL = 'https://wallet-service-074n.onrender.com';

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

async function setBaseURL() {
    console.log('📝 Настройка BASE_URL...\n');
    
    const options = {
        hostname: 'api.render.com',
        path: `/v1/services/${SERVICE_ID}/env-vars`,
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
            value: BASE_URL
        }
    };
    
    try {
        const response = await makeRequest(options, data);
        console.log('Ответ API:', response.status, JSON.stringify(response.data, null, 2));
        
        if (response.status === 201 || response.status === 200) {
            console.log('\n✅ BASE_URL установлен:', BASE_URL);
            console.log('\n✅ ВСЁ ГОТОВО!');
            console.log('📱 Откройте:', BASE_URL + '/qr-generator.html');
            return true;
        } else {
            console.log('\n⚠️  Не удалось установить через API');
            console.log('Добавьте вручную в Render Dashboard:');
            console.log('Settings → Environment → Add Variable');
            console.log('BASE_URL =', BASE_URL);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.log('\nДобавьте вручную в Render Dashboard:');
        console.log('BASE_URL =', BASE_URL);
        return false;
    }
}

setBaseURL();

