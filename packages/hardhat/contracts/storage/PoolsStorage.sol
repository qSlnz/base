// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.4;

library PoolsStorage {
    bytes32 constant STORAGE_POSITION = keccak256("myapp.pools");

    struct Pool {
        uint256 threshold;
        uint256 deadline;
        uint256 totalStaked;
        address payable sendTo;
        bool executed;
    }

    struct DiamondStorage {
        uint256 poolCount = 0;
        bool lock = false;
        mapping(uint256 => Pool) pools;
        mapping(address => mapping(uint256 => uint256)) balances;
    }

    function diamondStorage()
        internal
        pure
        returns (DiamondStorage storage diamond)
    {
        bytes32 position = STORAGE_POSITION;
        assembly {
            diamond.slot := position
        }
    }
}
