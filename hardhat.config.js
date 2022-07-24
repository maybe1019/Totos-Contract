require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/c1ba29d27c6b40779d9a00a8850d4f9e`,
      accounts: ['44f323d05f49b158d325dafeaa037490612b30ca2d251ada427055d8642a3021']
    }
  }
};