// ⚠️ ВНИМАНИЕ: Этот скрипт создан только для образовательных целей

const hre = require("hardhat");

async function main() {
  console.log("\n⚠️  ВНИМАНИЕ: Развертывание только для тестовых целей!\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Развертывание с аккаунта:", deployer.address);
  console.log("Баланс аккаунта:", (await deployer.getBalance()).toString());

  const Token = await hre.ethers.getContractFactory("TestToken");
  const token = await Token.deploy(
    "Test Token",
    "TEST",
    hre.ethers.utils.parseEther("1000000") // 1 миллион токенов
  );

  await token.deployed();

  const network = hre.network.name;
  
  console.log("\n✅ Контракт развернут!");
  console.log("Сеть:", network);
  console.log("Адрес контракта:", token.address);
  
  if (network === 'sepolia') {
    console.log("\n⚠️  Сохраните этот адрес в .env файле:");
    console.log("   TOKEN_ADDRESS_SEPOLIA=" + token.address + "\n");
  } else if (network === 'mainnet') {
    console.log("\n⚠️  Сохраните этот адрес в .env файле:");
    console.log("   TOKEN_ADDRESS_MAINNET=" + token.address + "\n");
  } else {
    console.log("\n⚠️  Сохраните этот адрес в .env файле\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

