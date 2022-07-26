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
    await expect(totosStaking.connect(acc1).stake(1, acc1.address, 2)).to.be.revertedWith("Ownable: caller is not the owner");
    await totosStaking.stake(1, acc1.address, 2)

    expect(await totosStaking.calcReward(1)).to.equal(0)

    await network.provider.send("evm_increaseTime", [3600 * 24 * 10 + 1])
    await network.provider.send("evm_mine")

    expect(await totosStaking.calcReward(1)).to.equal(ethers.utils.parseEther(0.066 * 10 * 2 + ''))

    await totosStaking.claimReward(1)
    expect(await totosToken.balanceOf(acc1.address)).to.equal(ethers.utils.parseEther(0.066 * 10 * 2 + ''))

    await network.provider.send("evm_increaseTime", [3600 * 24 * 100])
    await network.provider.send("evm_mine")

    expect(await totosStaking.calcReward(1)).to.equal(ethers.utils.parseEther(0.066 * 80 * 2 + 0.077 * 20 * 2 + ''))


    await network.provider.send("evm_increaseTime", [3600 * 24 * 100 + 100])
    await network.provider.send("evm_mine")
    //0.066 * 80 * 2 + 0.077 * 90 * 2 + 0.088 * 30 * 2 = 29.7
    expect(await totosStaking.calcReward(1)).to.equal(ethers.utils.parseEther('29.7'))
    
    await network.provider.send("evm_increaseTime", [3600 * 24 * 180 + 100])
    await network.provider.send("evm_mine")
    //(0.066 * 80 + 0.077 * 90 + 0.088 * 90 + 0.099 * 90) * 2 = 58.08
    expect(await totosStaking.calcReward(1)).to.equal(ethers.utils.parseEther('58.08'))

    await totosStaking.unstake(1)
    expect(await totosToken.balanceOf(acc1.address)).to.equal(ethers.utils.parseEther('59.4'))
  })
})