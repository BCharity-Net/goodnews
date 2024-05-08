const hre = require('hardhat');

async function deployProxy() {
  const owner = '0x03Ba34f6Ea1496fa316873CF8350A3f7eaD317EF';
  const feesBps = '500'; // 5%

  const GoodTipping = await hre.ethers.getContractFactory('GoodTipping');
  const deployProxy = await hre.upgrades.deployProxy(GoodTipping, [
    owner,
    feesBps
  ]);
  await deployProxy.waitForDeployment();

  console.log(`GoodTipping deployed to ${await deployProxy.getAddress()}`);
}

deployProxy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
