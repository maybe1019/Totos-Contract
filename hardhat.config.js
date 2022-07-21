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


/*
Genesis Address:  0xB1659c4Cc52ABF3ff5955b056e31606F0798DF76
Metaticket Address:  0x3B96A075E40b439265F2c6415896aEcB53576fe5
Evolution Address:  0xcA5d8C969B39700E475C7BE15700019deb2f8C0F
*/