const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const address = deployer.address;
    const balance = await deployer.getBalance();
    
    console.log("\n📊 Проверка баланса:\n");
    console.log("Адрес:", address);
    console.log("Баланс:", hre.ethers.utils.formatEther(balance), "BNB/ETH");
    console.log("Сеть:", hre.network.name);
    
    if (balance.eq(0)) {
        console.log("\n⚠️  Баланс равен нулю!");
        if (hre.network.name === 'bscTestnet') {
            console.log("Получите тестовые BNB на: https://testnet.bnbchain.org/faucet");
        } else if (hre.network.name === 'bsc') {
            console.log("Пополните счет реальными BNB для деплоя на BSC Mainnet");
        } else if (hre.network.name === 'sepolia') {
            console.log("Получите тестовые ETH на: https://sepoliafaucet.com/");
        }
    } else {
        const estimatedGas = hre.ethers.utils.parseEther("0.01");
        if (balance.gte(estimatedGas)) {
            console.log("\n✅ Баланс достаточен для деплоя");
        } else {
            console.log("\n⚠️  Баланс может быть недостаточен для деплоя");
            console.log("Рекомендуется: минимум 0.01 BNB/ETH");
        }
    }
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

