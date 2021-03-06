// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.4;

contract Staker {
    /*************
     * VARIABLES *
     *************/

    uint256 public poolCount = 0;

    struct Pool {
        uint256 threshold;
        uint256 deadline;
        uint256 totalStaked;
        address payable sendTo;
        bool executed;
    }

    mapping(uint256 => Pool) public pools;

    /* balance for a specific address and pool */
    mapping(address => mapping(uint256 => uint256)) public balances;
    /* locking no reentrency */
    bool private lock = false;

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
        require(_poolId < poolCount, "Wtf bro this pool has never existed");
        _;
    }

    modifier poolIsEnded(uint256 _poolId) {
        require(pools[_poolId].deadline < block.timestamp, "This pool is live");
        _;
    }

    modifier poolIsLive(uint256 _poolId) {
        require(
            pools[_poolId].deadline >= block.timestamp,
            "This pool is done"
        );
        _;
    }

    modifier reentrancyGuard() {
        require(!lock, "Liar! Cheater! Thief!");
        lock = true;
        _;
        lock = false;
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

        uint256 poolId = poolCount;
        poolCount++;

        Pool memory newPool;
        newPool.threshold = _threshold * 1 wei;
        newPool.deadline = block.timestamp + _deadline * 1 seconds;
        newPool.executed = false;
        newPool.sendTo = _sendTo;

        pools[poolId] = newPool;

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

        balances[msg.sender][_poolId] += msg.value;
        pools[_poolId].totalStaked += msg.value;

        emit Stake(_poolId, msg.sender, msg.value);
    }

    function withdraw(uint256 _poolId)
        public
        poolExists(_poolId)
        poolIsEnded(_poolId)
        reentrancyGuard()
    {
        require(
            pools[_poolId].totalStaked < pools[_poolId].threshold,
            "The pool is a success, your ethers are mine hahaha."
        );

        uint256 amountToWithdraw = balances[msg.sender][_poolId];

        require(amountToWithdraw > 0, "Nothing you can withdraw here");

        (bool success, ) = msg.sender.call{value: amountToWithdraw}("");

        require(success, "Sending money failed");

        balances[msg.sender][_poolId] = 0;

        emit PoolWithdraw(_poolId, msg.sender);
    }

    function execute(uint256 _poolId)
        public
        poolExists(_poolId)
        poolIsEnded(_poolId)
        reentrancyGuard()
    {
        require(!pools[_poolId].executed, "The pool has already been executed");
        require(
            pools[_poolId].totalStaked >= pools[_poolId].threshold,
            "The pool didnt reach the threshold amout, go withdraw your ethers using withdraw function"
        );

        uint256 amountToWithdraw = pools[_poolId].totalStaked;
        (bool success, ) =
            pools[_poolId].sendTo.call{value: amountToWithdraw, gas: gasleft()}(
                ""
            );

        require(success, "Sending money failed");

        pools[_poolId].executed = true;

        emit PoolExecuted(_poolId);
    }

    function isParticipatingTo(uint256 _poolId, address _addr)
        public
        view
        poolExists(_poolId)
        returns (bool)
    {
        if (balances[_addr][_poolId] > 0) {
            return true;
        } else {
            return false;
        }
    }

    function timeleft(uint256 _poolId)
        public
        view
        poolExists(_poolId)
        returns (uint256)
    {
        int256 timel =
            int256(pools[_poolId].deadline) - int256(block.timestamp);
        if (timel > 0) {
            return uint256(timel);
        } else {
            return 0;
        }
    }

    // TODO > handle case MAX_UINT256 reached
    // Question: I use uint256, but if I use uint64 for example, I will use less gas on smartcontract creation and method call that use it?
}
