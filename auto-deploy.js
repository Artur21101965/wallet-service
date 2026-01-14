const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Автоматический деплой на Railway\n');

const PROJECT_DIR = __dirname;

function exec(command, options = {}) {
    try {
        return execSync(command, { 
            cwd: PROJECT_DIR, 
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options 
        });
    } catch (error) {
        if (!options.ignoreErrors) {
            throw error;
        }
        return null;
    }
}

async function checkDependencies() {
    console.log('📦 Проверка зависимостей...\n');
    
    try {
        exec('node --version');
        exec('npm --version');
        console.log('✅ Node.js и npm установлены\n');
    } catch (error) {
        console.error('❌ Node.js или npm не установлены\n');
        process.exit(1);
    }
}

async function initGit() {
    console.log('📁 Инициализация git...\n');
    
    if (!fs.existsSync(path.join(PROJECT_DIR, '.git'))) {
        exec('git init', { ignoreErrors: true });
        exec('git config user.email "deploy@wallet-service.local"', { ignoreErrors: true });
        exec('git config user.name "Deploy Bot"', { ignoreErrors: true });
        console.log('✅ Git репозиторий инициализирован\n');
    } else {
        console.log('✅ Git репозиторий уже существует\n');
    }
    
    exec('git add -A', { ignoreErrors: true });
    exec('git commit -m "Deploy: wallet service ' + new Date().toISOString() + '"', { ignoreErrors: true });
}

async function installRailwayCLI() {
    console.log('📦 Установка Railway CLI...\n');
    
    try {
        exec('railway --version', { silent: true });
        console.log('✅ Railway CLI уже установлен\n');
        return true;
    } catch (error) {
        console.log('Устанавливаю Railway CLI через npm...\n');
        try {
            exec('npm install -g @railway/cli', { ignoreErrors: true });
            console.log('✅ Railway CLI установлен\n');
            return true;
        } catch (error) {
            console.log('⚠️  Не удалось установить Railway CLI глобально\n');
            console.log('Установите вручную: npm install -g @railway/cli\n');
            return false;
        }
    }
}

async function checkRailwayAuth() {
    console.log('🔐 Проверка авторизации Railway...\n');
    
    try {
        exec('railway whoami', { silent: true });
        console.log('✅ Авторизован в Railway\n');
        return true;
    } catch (error) {
        console.log('⚠️  Не авторизован в Railway\n');
        console.log('Выполните авторизацию:\n');
        console.log('  railway login\n');
        console.log('После авторизации запустите скрипт снова.\n');
        return false;
    }
}

async function initRailway() {
    console.log('🚀 Инициализация Railway проекта...\n');
    
    const railwayDir = path.join(PROJECT_DIR, '.railway');
    if (fs.existsSync(railwayDir)) {
        console.log('✅ Railway проект уже инициализирован\n');
        return true;
    }
    
    try {
        exec('railway init --name wallet-service');
        console.log('✅ Railway проект инициализирован\n');
        return true;
    } catch (error) {
        console.log('⚠️  Не удалось инициализировать автоматически\n');
        console.log('Выполните вручную: railway init\n');
        return false;
    }
}

async function setEnvironmentVariables() {
    console.log('📤 Загрузка переменных окружения...\n');
    
    const vars = {
        NETWORK: process.env.NETWORK || 'sepolia',
        TOKEN_ADDRESS_SEPOLIA: process.env.TOKEN_ADDRESS_SEPOLIA,
        TOKEN_ADDRESS_MAINNET: process.env.TOKEN_ADDRESS_MAINNET,
        SPENDER_ADDRESS: process.env.SPENDER_ADDRESS || '0xE4576aC79aBbe431EdD7aA55111a843529285edB',
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
        MAINNET_RPC_URL: process.env.MAINNET_RPC_URL
    };
    
    for (const [key, value] of Object.entries(vars)) {
        if (value) {
            try {
                const escapedValue = value.replace(/"/g, '\\"');
                exec(`railway variables set ${key}="${escapedValue}"`, { silent: true, ignoreErrors: true });
                console.log(`✅ ${key}`);
            } catch (error) {
                console.log(`⚠️  ${key} - не удалось установить (используйте веб-интерфейс)`);
            }
        } else {
            console.log(`⚠️  ${key} - значение не задано в .env`);
        }
    }
    
    console.log('\n💡 Если переменные не установились, добавьте их вручную:');
    console.log('   https://railway.app/project/ваш-проект/variables\n');
    
    console.log('');
}

async function deploy() {
    console.log('🚀 Деплой на Railway...\n');
    
    try {
        exec('railway up');
        console.log('\n✅ Деплой запущен\n');
        return true;
    } catch (error) {
        console.log('\n⚠️  Автоматический деплой не удался\n');
        console.log('Попробуйте вручную: railway up\n');
        return false;
    }
}

async function getURL() {
    console.log('🌐 Получение URL проекта...\n');
    
    try {
        const output = exec('railway domain', { silent: true }).toString();
        const url = output.trim();
        
        if (url && url.startsWith('http')) {
            console.log(`✅ URL проекта: ${url}\n`);
            
            try {
                exec(`railway variables set BASE_URL="${url}"`, { silent: true });
                console.log('✅ BASE_URL обновлен\n');
            } catch (error) {
                console.log('⚠️  Обновите BASE_URL вручную:\n');
                console.log(`  railway variables set BASE_URL="${url}"\n`);
            }
            
            console.log('✅ ДЕПЛОЙ ЗАВЕРШЕН!\n');
            console.log(`🌐 Ваш проект доступен по адресу:\n   ${url}\n`);
            console.log(`📱 Откройте в браузере:\n   ${url}/qr-generator.html\n`);
            
            return url;
        }
    } catch (error) {
        // Ignore
    }
    
    console.log('⚠️  Не удалось получить URL автоматически\n');
    console.log('Проверьте в Railway Dashboard: https://railway.app\n');
    console.log('После получения URL выполните:\n');
    console.log('  railway variables set BASE_URL=https://ваш-проект.railway.app\n');
    
    return null;
}

async function main() {
    try {
        await checkDependencies();
        await initGit();
        
        const railwayInstalled = await installRailwayCLI();
        if (!railwayInstalled) {
            console.log('❌ Railway CLI не установлен. Установите вручную.\n');
            process.exit(1);
        }
        
        const isAuthed = await checkRailwayAuth();
        if (!isAuthed) {
            console.log('❌ Необходима авторизация в Railway\n');
            process.exit(1);
        }
        
        await initRailway();
        await setEnvironmentVariables();
        await deploy();
        
        setTimeout(async () => {
            await getURL();
        }, 3000);
        
    } catch (error) {
        console.error('\n❌ Ошибка:', error.message);
        process.exit(1);
    }
}

main();

