const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, network } = require("hardhat");

let genesisTotos;
let metaTicket;
let totosStaking;
let totosToken;

let owner, acc1, acc2, acc3;

const calcReward = (stage, period) => {
  const ratio = [1, 1.5, 1.7, 2]
  const p = [90, 180, 270, 360]
  return 50 * p[period] * ratio[stage] * ratio[period]
}

describe("TOTOS Engine", () => {
  it("Contract Deployment and Initialize", async () => {
    [owner, acc1, acc2, acc3] = await ethers.getSigners();
    
    let GenesisTotosFactory = await ethers.getContractFactory("GenesisTotos");
    let MetaTicketFactory = await ethers.getContractFactory("MetaTicket");
    let TotosStakingFactory = await ethers.getContractFactory("TotosStaking");
    let TotosTokenFactory = await ethers.getContractFactory("TotosToken");

    genesisTotos = await GenesisTotosFactory.deploy()
    metaTicket = await MetaTicketFactory.deploy()
    totosToken = await TotosTokenFactory.deploy()
    totosStaking = await TotosStakingFactory.deploy(genesisTotos.address, totosToken.address)

    await metaTicket.setGenesisAddress(genesisTotos.address);
    await genesisTotos.setTicketAddress(metaTicket.address);
    await genesisTotos.setStakingAddress(totosStaking.address)
    
    const amount = ethers.utils.parseUnits("200000000", 'ether')
    await totosToken.transfer(totosStaking.address, amount)

    // Check if the $TOTOS balance of staking contract is equal to the amount sent
    expect(await totosToken.balanceOf(totosStaking.address)).to.equal(amount)
  })

  it("Mint Totos NFT and upgrade stage", async () => {
    let value = ethers.utils.parseUnits("0.01", 'ether').mul(5)
    await genesisTotos.connect(acc1).mint(5, {value: value})

    expect(await genesisTotos.balanceOf(acc1.address)).to.equal(5)

    await expect(genesisTotos.connect(acc1).upgradeStage(1)).to.be.revertedWith("You don't have a ticket for upgrade.")

    value = ethers.utils.parseUnits("0.033", 'ether').mul(5)
    await metaTicket.connect(acc1).mint(1, 5, {value: value})
    await metaTicket.connect(acc1).mint(2, 5, {value: value.mul(2)})
    await metaTicket.connect(acc1).mint(3, 5, {value: value.mul(3)})

    // Upgrade token 1
    await genesisTotos.connect(acc1).upgradeStage(1)
    expect(await metaTicket.balanceOf(acc1.address, 1)).to.equal(4)
    expect(await genesisTotos.stage(1)).to.equal(1)

    // upgrade token 2 to stage 2
    await genesisTotos.connect(acc1).upgradeStage(2)
    await genesisTotos.connect(acc1).upgradeStage(2)
    expect(await metaTicket.balanceOf(acc1.address, 2)).to.equal(4)
    expect(await genesisTotos.stage(2)).to.equal(2)
  })

  it("Stake token1 and check the reward.", async () => {
    await expect(totosStaking.stake(1, 1)).to.be.revertedWith('You are not the owner of this token.');

    //check if the token can't be transfered or upgraded when it's on staking.
    await totosStaking.connect(acc1).stake(1, 0)
    expect(await genesisTotos.locked(1)).to.equal(true)
    await expect(genesisTotos.connect(acc1).transferFrom(acc1.address, acc2.address, 1)).to.be.revertedWith('This Token is locked.')
    await expect(genesisTotos.connect(acc1).upgradeStage(1)).to.be.revertedWith('This token is on staking.')

    await expect(totosStaking.connect(acc1).unstake(1)).to.be.revertedWith("Staking hasn't finished yet.")

    await network.provider.send("evm_increaseTime", [3600 * 24 * 91])
    await network.provider.send("evm_mine")

    await totosStaking.connect(acc1).unstake(1)

    let reward = ethers.utils.parseUnits(calcReward(1, 0) + '', 'ether')
    expect(await totosToken.balanceOf(acc1.address)).to.equal(reward)

    await totosToken.connect(acc1).burn(reward)
  })

  it("Stake token1 again and check the reward.", async () => {
    await expect(totosStaking.stake(1, 1)).to.be.revertedWith('You are not the owner of this token.');

    //check if the token can't be transfered or upgraded when it's on staking.
    await totosStaking.connect(acc1).stake(1, 0)
    expect(await genesisTotos.locked(1)).to.equal(true)
    await expect(genesisTotos.connect(acc1).transferFrom(acc1.address, acc2.address, 1)).to.be.revertedWith('This Token is locked.')
    await expect(genesisTotos.connect(acc1).upgradeStage(1)).to.be.revertedWith('This token is on staking.')

    await expect(totosStaking.connect(acc1).unstake(1)).to.be.revertedWith("Staking hasn't finished yet.")

    await network.provider.send("evm_increaseTime", [3600 * 24 * 91])
    await network.provider.send("evm_mine")

    await totosStaking.connect(acc1).unstake(1)

    let reward = ethers.utils.parseUnits(calcReward(1, 0) + '', 'ether')
    expect(await totosToken.balanceOf(acc1.address)).to.equal(reward)
    
    await totosToken.connect(acc1).burn(reward)
  })

  it("Stake token2 for period2(6 months) and check the reward.", async () => {
    //check if the token can't be transfered or upgraded when it's on staking.
    await totosStaking.connect(acc1).stake(2, 1)

    await expect(totosStaking.connect(acc1).unstake(2)).to.be.revertedWith("Staking hasn't finished yet.")

    await network.provider.send("evm_increaseTime", [3600 * 24 * 181])
    await network.provider.send("evm_mine")

    await totosStaking.connect(acc1).unstake(2)

    let reward = ethers.utils.parseUnits(calcReward(2, 1) + '', 'ether')
    expect(await totosToken.balanceOf(acc1.address)).to.equal(reward)
    expect(await genesisTotos.locked(2)).to.equal(false)

    await genesisTotos.connect(acc1).transferFrom(acc1.address, acc2.address, 2)
    expect(await genesisTotos.ownerOf(2)).to.equal(acc2.address)
  })
})