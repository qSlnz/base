// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.3;

contract Diamond {
    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {}

    receive() external payable {}
}
