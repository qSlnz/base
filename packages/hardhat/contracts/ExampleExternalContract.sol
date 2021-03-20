// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.4;

contract ExampleExternalContract {
    bool public completed;

    function complete() public payable returns (bool) {
        completed = true;
        return true;
    }
}
