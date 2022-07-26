async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let TotosTokenFactory = await ethers.getContractFactory("TotosToken");
  let TotosStakingFactory = await ethers.getContractFactory("TotosStaking");

  totosToken = await TotosTokenFactory.deploy()
  totosStaking = await TotosStakingFactory.deploy(totosToken.address);

  await totosToken.transfer(totosStaking.address, ethers.utils.parseEther('1000000'))

  console.log("Totos Token Address: ", totosToken.address)
  console.log("Staking Address: ", totosStaking.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
