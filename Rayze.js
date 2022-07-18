const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

let RayzeFactory;
let RayzeNFT;

let factory;
let owner, acc1, acc2, acc3, acc4, acc5;

const inputData = {
  name: "Test NFT",
  symbol: "TEST",
  baseUri: "ipfs://url/",
  maxSupply: 1000,
  freeSupply: 0,
  maxPerTx: 10,
  maxPerWallet: 10,
  transferrability: true,
  price: ethers.utils.parseUnits("1", "ether"),
  withdrawWallets: [],
  withdrawAmounts: [70, 30],
};

var testNftAddress;
let testNft;

describe("RayzeFactory Contract", () => {
  it("Contract Deployment", async () => {
    [owner, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();

    inputData.withdrawWallets = [acc2.address, acc3.address];

    RayzeFactory = await ethers.getContractFactory("RayzeFactory");
    RayzeNFT = await ethers.getContractFactory("RayzeNFT");

    factory = await RayzeFactory.deploy();

    //    console.log("RayzeFactory Address: ", factory.address)
  });

  it("CreateCollection", async () => {
    const tx = await factory
      .connect(acc1)
      .createCollection(
        inputData.name,
        inputData.symbol,
        inputData.baseUri,
        inputData.maxSupply,
        inputData.freeSupply,
        inputData.maxPerTx,
        inputData.maxPerWallet,
        inputData.transferrability,
        inputData.price,
        inputData.withdrawWallets,
        inputData.withdrawAmounts,
        {
          value: ethers.utils.parseUnits("0.03", "ether"),
        }
      );

    const rc = await tx.wait();
    const event = rc.events.find(
      (event) => event.event === "NewColelctionCreated"
    );
    testNftAddress = event.args.contractAddress;

    testNft = RayzeNFT.attach(testNftAddress);
    //    console.log("Test Collection Address: ", testNftAddress);
  });

  it("The Creator of the collection should be matched: RayzeNFT & RayzeFactory-creatorList", async () => {
    expect(await testNft.creator()).to.equal(
      await factory.getCreator(testNftAddress)
    );
    expect(await testNft.creator()).to.equal(acc1.address);
  });

  it("Mint 5 Test NFTs. The balanceOf should be the same as 5 after the Mint.", async () => {
    await expect(
      factory.mint(testNftAddress, 5, { value: inputData.price.mul(5) })
    ).to.be.revertedWith("Mint didn't start.");

    await expect(testNft.connect(acc5).startMint()).to.be.revertedWith(
      "You don't have permission."
    );

    await testNft.connect(acc1).startMint();

    await factory.mint(testNftAddress, 5, { value: inputData.price.mul(5) });
    expect(await testNft.balanceOf(owner.address)).to.equal(5);

    await factory
      .connect(acc1)
      .mint(testNftAddress, 5, { value: inputData.price.mul(5) });
    expect(await testNft.balanceOf(acc1.address)).to.equal(5);
  });

  it("Withdraw: Check revenue after withdraw.", async () => {
    await expect(factory.withdraw(testNftAddress)).to.be.revertedWith(
      "You are not the creator of this collection."
    );

    await factory.connect(acc1).withdraw(testNftAddress);

    expect(await acc2.getBalance()).to.equal(
      ethers.utils.parseUnits("10006.3", "ether")
    );
    expect(await acc3.getBalance()).to.equal(
      ethers.utils.parseUnits("10002.7", "ether")
    );

    expect(await waffle.provider.getBalance(factory.address)).to.equal(
      ethers.utils.parseUnits("1.03", "ether")
    );
  });
});
