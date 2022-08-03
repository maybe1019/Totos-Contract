const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, network } = require("hardhat");

let totosToken;
let totosStaking;

let owner, acc1, acc2, acc3;

describe("TOTOS Staking", () => {
  it("Contract Deployment and Initialize", async () => {
    [owner, acc1, acc2, acc3] = await ethers.getSigners();
    
    let TotosTokenFactory = await ethers.getContractFactory("TotosToken");
    let TotosStakingFactory = await ethers.getContractFactory("TotosStaking");

    totosToken = await TotosTokenFactory.deploy()
    totosStaking = await TotosStakingFactory.deploy(totosToken.address);

    await totosToken.transfer(totosStaking.address, ethers.utils.parseEther('1000000'))
    expect(await totosToken.balanceOf(totosStaking.address)).to.equal(ethers.utils.parseEther('1000000'))
  })

  it("Start Staking", async () => {
    await expect(totosStaking.connect(acc1).stake(1, acc1.address, 1, 2)).to.be.revertedWith("Ownable: caller is not the owner");
    await totosStaking.stake(1, acc1.address, 1, 2)

    await network.provider.send("evm_increaseTime", [3600 * 24 * 90 - 2000])
    await network.provider.send("evm_mine")

    await expect(totosStaking.unstake(1)).to.be.revertedWith("You can't unstake before the time.")

    await network.provider.send("evm_increaseTime", [3000])
    await network.provider.send("evm_mine")

    await totosStaking.unstake(1)
    expect(await totosToken.balanceOf(acc1.address)).to.equal(ethers.utils.parseEther('11.88'))


    await totosStaking.stake(2, acc2.address, 2, 3)
    await network.provider.send("evm_increaseTime", [3600 * 24 * 180 - 2000])
    await network.provider.send("evm_mine")

    await expect(totosStaking.unstake(2)).to.be.revertedWith("You can't unstake before the time.")

    await network.provider.send("evm_increaseTime", [3000])
    await network.provider.send("evm_mine")

    await totosStaking.unstake(2)
    expect(await totosToken.balanceOf(acc2.address)).to.equal(ethers.utils.parseEther('41.58'))

  })
})