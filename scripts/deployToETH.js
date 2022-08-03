async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let GenesisTotosFactory = await ethers.getContractFactory("GenesisTotos");
  let MetaTicketFactory = await ethers.getContractFactory("MetaTicket");
  let EvolutionTotosFactory = await ethers.getContractFactory("EvolutionTotos");

  const genesisTotos = await GenesisTotosFactory.deploy()
  console.log("Genesis Address: ", genesisTotos.address)

  const metaTicket = await MetaTicketFactory.deploy()
  console.log("Metaticket Address: ", metaTicket.address)

  const evolutionTotos = await EvolutionTotosFactory.deploy(genesisTotos.address, metaTicket.address);
  console.log("Evolution Address: ", evolutionTotos.address)

  await metaTicket.setEvolutionAddress(evolutionTotos.address)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });