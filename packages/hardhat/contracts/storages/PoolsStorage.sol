// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.3;

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
        uint256 poolCount;
        bool lock;
        mapping(uint256 => Pool) pools;
        mapping(address => mapping(uint256 => uint256)) balances;
    }

    function get() internal pure returns (DiamondStorage storage diamond) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            diamond.slot := position
        }
    }
}
