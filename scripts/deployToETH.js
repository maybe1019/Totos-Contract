async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let GenesisTotosFactory = await ethers.getContractFactory("GenesisTotos");
  let MetaTicketFactory = await ethers.getContractFactory("MetaTicket");
  let EvolutionTotosFactory = await ethers.getContractFactory("EvolutionTotos");

  const genesisTotos = await GenesisTotosFactory.deploy()
  const metaTicket = await MetaTicketFactory.deploy()
  const evolutionTotos = await EvolutionTotosFactory.deploy(genesisTotos.address, metaTicket.address);

  await metaTicket.setEvolutionAddress(evolutionTotos.address)

  console.log("Genesis Address: ", genesisTotos.address)
  console.log("Metaticket Address: ", metaTicket.address)
  console.log("Evolution Address: ", evolutionTotos.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
Genesis Address:  0x8A4EB54128D48Ed7c9Bb43b9B2E16179E5875b8F
Metaticket Address:  0xfA3450bFd014196abF89Def0d474bcc15126c362
Evolution Address:  0x2138287e12E6770E0CD5144e341FbE97EBaA609E
*/