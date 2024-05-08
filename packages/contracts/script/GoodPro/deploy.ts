const hre = require('hardhat');

async function deployProxy() {
  const owner = '0x03Ba34f6Ea1496fa316873CF8350A3f7eaD317EF';
  const monthlyPrice = '8000000000000000000'; // 8 MATIC
  const yearlyPrice = '90000000000000000000'; // 90 MATIC

  const GoodPro = await hre.ethers.getContractFactory('GoodPro');
  const deployProxy = await hre.upgrades.deployProxy(GoodPro, [
    owner,
    monthlyPrice,
    yearlyPrice
  ]);
  await deployProxy.waitForDeployment();

  console.log(`GoodPro deployed to ${await deployProxy.getAddress()}`);
}

deployProxy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
