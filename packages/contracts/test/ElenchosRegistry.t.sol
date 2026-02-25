// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ElenchosRegistry.sol";

contract ElenchosRegistryTest is Test {
    ElenchosRegistry public registry;
    
    address public admin = address(1);
    address public municipality = address(2);
    address public validator = address(3);
    address public user = address(4);

    function setUp() public {
        vm.prank(admin);
        registry = new ElenchosRegistry();

        // Setup roles
        vm.prank(admin);
        registry.addMunicipality(municipality);

        vm.prank(admin);
        registry.addValidator(validator);
    }

    function test_Deployment() public {
        assertTrue(registry.hasRole(registry.ADMIN_ROLE(), admin));
        assertTrue(registry.hasRole(registry.MUNICIPALITY_ROLE(), municipality));
        assertTrue(registry.hasRole(registry.VALIDATOR_ROLE(), validator));
    }

    function test_CreateRegistry() public {
        vm.prank(municipality);
        
        bytes32 dataHash = keccak256("test data");
        string memory ipfsCID = "QmTest123";

        bytes32 registryId = registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            dataHash,
            ipfsCID
        );

        assertTrue(registryId != bytes32(0));
        assertEq(registry.registryCount(), 1);

        ElenchosRegistry.Registry memory reg = registry.getRegistry(registryId);
        assertEq(reg.municipality, municipality);
        assertEq(reg.dataHash, dataHash);
        assertEq(reg.ipfsCID, ipfsCID);
        assertEq(uint(reg.status), uint(ElenchosRegistry.RegistryStatus.Pending));
    }

    function test_ValidateRegistry() public {
        // Create registry
        vm.prank(municipality);
        bytes32 registryId = registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            keccak256("test data"),
            "QmTest123"
        );

        // Validate
        vm.prank(validator);
        registry.validateRegistry(registryId, true, "Valid registry");

        ElenchosRegistry.Registry memory reg = registry.getRegistry(registryId);
        assertEq(uint(reg.status), uint(ElenchosRegistry.RegistryStatus.OnChain));
        assertEq(reg.validatedBy, validator);
    }

    function test_RejectRegistry() public {
        // Create registry
        vm.prank(municipality);
        bytes32 registryId = registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            keccak256("test data"),
            "QmTest123"
        );

        // Reject
        vm.prank(validator);
        registry.validateRegistry(registryId, false, "Invalid data");

        ElenchosRegistry.Registry memory reg = registry.getRegistry(registryId);
        assertEq(uint(reg.status), uint(ElenchosRegistry.RegistryStatus.Rejected));
    }

    function test_RevertWhen_UnauthorizedCreate() public {
        vm.prank(user);
        
        vm.expectRevert();
        registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            keccak256("test data"),
            "QmTest123"
        );
    }

    function test_RevertWhen_ValidatorCannotValidateOwn() public {
        // Add validator as municipality
        vm.prank(admin);
        registry.addMunicipality(validator);

        // Create registry as validator
        vm.prank(validator);
        bytes32 registryId = registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            keccak256("test data"),
            "QmTest123"
        );

        // Try to validate own registry
        vm.prank(validator);
        vm.expectRevert("Validator cannot validate own registry");
        registry.validateRegistry(registryId, true, "");
    }

    function test_GetRegistriesByMunicipality() public {
        vm.prank(municipality);
        registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            keccak256("test data 1"),
            "QmTest1"
        );

        vm.prank(municipality);
        registry.createRegistry(
            ElenchosRegistry.RegistryType.Expense,
            keccak256("test data 2"),
            "QmTest2"
        );

        bytes32[] memory registries = registry.getRegistriesByMunicipality(municipality);
        assertEq(registries.length, 2);
    }

    function test_Pause() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(municipality);
        vm.expectRevert();
        registry.createRegistry(
            ElenchosRegistry.RegistryType.Activity,
            keccak256("test data"),
            "QmTest123"
        );
    }
}
