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

  it("Mint Metaticket", async () => {
    // await expect(metaTicket.connect(acc1).mint(1, 1)).to.be.revertedWith("Not enough funds.")
    // await metaTicket.connect(acc1).mint(1, 5, {value: ethers.utils.parseUnits("0.033", 'ether').mul(5)})
    // expect(await metaTicket.balanceOf(acc1.address, 1)).to.equal(5)

    // await expect(metaTicket.connect(acc1).mint(2, 1)).to.be.revertedWith("Not enough funds.")
    // await metaTicket.connect(acc1).mint(2, 5, {value: ethers.utils.parseUnits("0.066", 'ether').mul(5)})
    // expect(await metaTicket.balanceOf(acc1.address, 2)).to.equal(5)

    // await expect(metaTicket.connect(acc1).mint(3, 1)).to.be.revertedWith("Not enough funds.")
    // await metaTicket.connect(acc1).mint(3, 5, {value: ethers.utils.parseUnits("0.099", 'ether').mul(5)})
    // expect(await metaTicket.balanceOf(acc1.address, 3)).to.equal(5)
  })

  it("Unlock evolutions", async () => {
    await expect(evolutionTotos.connect(acc1).unlockEvolution(10)).to.be.revertedWith("The Genesis Token hasn not been minted yet.")
    await expect(evolutionTotos.connect(acc1).unlockEvolution(1)).to.be.revertedWith("You don't have a ticket for unlock.") 
    await expect(evolutionTotos.connect(acc1).unlockEvolution(6)).to.be.revertedWith("You are not the owner of the Genesis Token of this bundle.") 
    await expect(evolutionTotos.connect(acc1).unlockEvolution(334)).to.be.revertedWith("The previous stage hasn't been unlocked.")
    
    await metaTicket.connect(acc1).mint(1, 5, {value: ethers.utils.parseUnits("0.033", 'ether').mul(5)})
    expect(await metaTicket.balanceOf(acc1.address, 1)).to.equal(5)
    await evolutionTotos.connect(acc1).unlockEvolution(1)

    expect(await metaTicket.balanceOf(acc1.address, 1)).to.equal(4)
    expect(await evolutionTotos.unlocked(1)).to.equal(true)
    expect(await evolutionTotos.balanceOf(acc1.address)).to.equal(1)
    expect(await evolutionTotos.ownerOf(1)).to.equal(acc1.address)

    await expect(evolutionTotos.connect(acc1).unlockEvolution(334)).to.be.revertedWith("You don't have a ticket for unlock.")
    await metaTicket.connect(acc1).mint(2, 5, {value: ethers.utils.parseUnits("0.066", 'ether').mul(5)})
    await expect(evolutionTotos.connect(acc2).unlockEvolution(334)).to.be.revertedWith("You are not the owner of the previous stage.")

    await evolutionTotos.connect(acc1).unlockEvolution(334)
    expect(await evolutionTotos.balanceOf(acc1.address)).to.equal(2)
    expect(await evolutionTotos.ownerOf(334)).to.equal(acc1.address)
  })
})