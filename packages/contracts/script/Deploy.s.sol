// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ElenchosRegistry.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        ElenchosRegistry registry = new ElenchosRegistry();

        console.log("ElenchosRegistry deployed at:", address(registry));

        vm.stopBroadcast();
    }
}
