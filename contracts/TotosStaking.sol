// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

interface ITotosToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract TotosStaking is Ownable {
    address tokenAddress;

    uint rewardPerDay = 77;
    uint decimals = 18;

    uint[4] public stakingPeriod = [90, 180, 270, 360];

    mapping(uint => bool) public onStaking;
    mapping(uint => uint) public period;
    mapping(uint => uint) public startTime;
    mapping(uint => uint) public multiplier;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function stake(uint _tokenId, uint _period, uint _multiplier) external onlyOwner returns(bool) {
        require(onStaking[_tokenId] == false, "This token is already on staking.");

        period[_tokenId] = _period;
        onStaking[_tokenId] = true;
        startTime[_tokenId] = block.timestamp;
        multiplier[_tokenId] = _multiplier;
        
        return true;
    }

    function unstake(uint _tokenId) external onlyOwner {
        require(onStaking[_tokenId] == true, "This token is not on staking.");

        uint endTime = startTime[_tokenId] + stakingPeriod[period[_tokenId]] * (1 days);

        require(endTime <= block.timestamp, "Staking hasn't finished yet.");

        uint reward = rewardPerDay * stakingPeriod[period[_tokenId]];
        reward = reward * 10 ** (decimals - 3);

        ITotosToken(tokenAddress).transfer(msg.sender, reward);

        onStaking[_tokenId] = false;
    }

    function forceUnstake(uint _tokenId) external {
        require(onStaking[_tokenId] == true, "This token is not on staking.");

        onStaking[_tokenId] = false;
    }

}