const hre = require('hardhat');

async function deployProxy() {
  const owner = '0x698386C93513d6D0C58f296633A7A3e529bd4026';
  // Amoy: 0x36440da1D98FF46637f0b98AAA082bc77977B49B
  // Mainnet: 0x0b5e6100243f793e480DE6088dE6bA70aA9f3872
  const lensPermissionlessCreator =
    '0x0b5e6100243f793e480DE6088dE6bA70aA9f3872';
  const signupPrice = '1000000000000000000';

  const GoodLensSignup = await hre.ethers.getContractFactory('GoodLensSignupV2');
  const deployProxy = await hre.upgrades.deployProxy(GoodLensSignup, [
    owner,
    lensPermissionlessCreator,
    signupPrice
  ]);
  await deployProxy.waitForDeployment();

  console.log(`GoodLensSignup deployed to ${await deployProxy.getAddress()}`);
}

deployProxy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
