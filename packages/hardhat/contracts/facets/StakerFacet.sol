// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.3;

import "./../storages/PoolsStorage.sol";

contract StakerFacet {
    /**********
     * EVENTS *
     **********/

    event Stake(
        uint256 indexed poolId,
        address indexed staker,
        uint256 indexed amount
    );
    event PoolCreation(uint256 indexed poolId, address indexed staker);
    event PoolExecuted(uint256 indexed poolId);
    event PoolWithdraw(uint256 indexed poolId, address indexed staker);

    /*************
     * MODIFIERS *
     *************/

    modifier poolExists(uint256 _poolId) {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();
        require(_poolId < ds.poolCount, "Wtf bro this pool has never existed");
        _;
    }

    modifier poolIsEnded(uint256 _poolId) {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();
        require(
            ds.pools[_poolId].deadline < block.timestamp,
            "This pool is live"
        );
        _;
    }

    modifier poolIsLive(uint256 _poolId) {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();
        require(
            ds.pools[_poolId].deadline >= block.timestamp,
            "This pool is done"
        );
        _;
    }

    modifier reentrancyGuard() {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();
        require(!ds.lock, "Liar! Cheater! Thief!");
        ds.lock = true;
        _;
        ds.lock = false;
    }

    /*************
     * FUNCTIONS *
     *************/

    /* return poolid */
    function createPool(
        uint256 _threshold,
        uint256 _deadline,
        address payable _sendTo
    ) public returns (uint256) {
        require(_deadline > 0);
        require(_sendTo != address(0));

        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();

        uint256 poolId = ds.poolCount;
        ds.poolCount++;

        PoolsStorage.Pool memory newPool;
        newPool.threshold = _threshold * 1 wei;
        newPool.deadline = block.timestamp + _deadline * 1 seconds;
        newPool.executed = false;
        newPool.sendTo = _sendTo;

        ds.pools[poolId] = newPool;

        emit PoolCreation(poolId, msg.sender);

        return poolId;
    }

    function stake(uint256 _poolId)
        public
        payable
        poolExists(_poolId)
        poolIsLive(_poolId)
    {
        require(msg.value > 0, "Gimme yo money");

        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();

        ds.balances[msg.sender][_poolId] += msg.value;
        ds.pools[_poolId].totalStaked += msg.value;

        emit Stake(_poolId, msg.sender, msg.value);
    }

    function withdraw(uint256 _poolId)
        public
        poolExists(_poolId)
        poolIsEnded(_poolId)
        reentrancyGuard()
    {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();

        require(
            ds.pools[_poolId].totalStaked < ds.pools[_poolId].threshold,
            "The pool is a success, your ethers are mine hahaha."
        );

        uint256 amountToWithdraw = ds.balances[msg.sender][_poolId];

        require(amountToWithdraw > 0, "Nothing you can withdraw here");

        (bool success, ) = msg.sender.call{value: amountToWithdraw}("");

        require(success, "Sending money failed");

        ds.balances[msg.sender][_poolId] = 0;

        emit PoolWithdraw(_poolId, msg.sender);
    }

    function execute(uint256 _poolId)
        public
        poolExists(_poolId)
        poolIsEnded(_poolId)
        reentrancyGuard()
    {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();

        require(
            !ds.pools[_poolId].executed,
            "The pool has already been executed"
        );
        require(
            ds.pools[_poolId].totalStaked >= ds.pools[_poolId].threshold,
            "The pool didnt reach the threshold amout, go withdraw your ethers using withdraw function"
        );

        uint256 amountToWithdraw = ds.pools[_poolId].totalStaked;
        (bool success, ) =
            ds.pools[_poolId].sendTo.call{
                value: amountToWithdraw,
                gas: gasleft()
            }("");

        require(success, "Sending money failed");

        ds.pools[_poolId].executed = true;

        emit PoolExecuted(_poolId);
    }

    function isParticipatingTo(uint256 _poolId, address _addr)
        public
        view
        poolExists(_poolId)
        returns (bool)
    {
        PoolsStorage.DiamondStorage storage ds = PoolsStorage.get();

        if (ds.balances[_addr][_poolId] > 0) {
            return true;
        } else {
            return false;
        }
    }

    // TODO > handle case MAX_UINT256 reached
    // Question: I use uint256, but if I use uint64 for example, I will use less gas on smartcontract creation and method call that use it?
}
