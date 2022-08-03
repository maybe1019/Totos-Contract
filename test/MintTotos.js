const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, network } = require("hardhat");

let genesisTotos;
let metaTicket;
let evolutionTotos;

let owner, acc1, acc2, acc3;

let ticketPrice = [0, 0.033, 0.066, 0.099]

describe("TOTOS Engine", () => {
  it("Contract Deployment and Initialize", async () => {
    [owner, acc1, acc2, acc3] = await ethers.getSigners();
    
    let GenesisTotosFactory = await ethers.getContractFactory("GenesisTotos");
    let MetaTicketFactory = await ethers.getContractFactory("MetaTicket");
    let EvolutionTotosFactory = await ethers.getContractFactory("EvolutionTotos");

    genesisTotos = await GenesisTotosFactory.deploy()
    metaTicket = await MetaTicketFactory.deploy()
    evolutionTotos = await EvolutionTotosFactory.deploy(genesisTotos.address, metaTicket.address);

    await metaTicket.setEvolutionAddress(evolutionTotos.address)
  })

  it("Mint Genesis Totos", async () => {
    await genesisTotos.mint(acc1.address, 5)
    expect(await genesisTotos.balanceOf(acc1.address)).to.equal(5)

    await expect(genesisTotos.connect(acc1).mint(acc2.address, 10)).to.be.revertedWith("Ownable: caller is not the owner")

    await genesisTotos.mint(acc2.address, 2)
  })

})