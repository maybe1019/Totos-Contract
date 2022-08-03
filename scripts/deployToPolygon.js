async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  let TotosTokenFactory = await ethers.getContractFactory("TotosToken");
  let TotosStakingFactory = await ethers.getContractFactory("TotosStaking");

  totosToken = await TotosTokenFactory.deploy()
  console.log("Totos Token Address: ", totosToken.address)

  totosStaking = await TotosStakingFactory.deploy(totosToken.address);
  console.log("Staking Address: ", totosStaking.address)
  
  await totosToken.transfer(totosStaking.address, ethers.utils.parseEther('1000000'))

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
