// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ElenchosRegistry
 * @dev Contrato principal para el registro inmutable de actividades municipales
 */
contract ElenchosRegistry is AccessControl, Pausable, ReentrancyGuard {
    // Roles
    bytes32 public constant MUNICIPALITY_ROLE = keccak256("MUNICIPALITY_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Enums
    enum RegistryStatus { Pending, Validated, Rejected, OnChain }
    enum RegistryType { Activity, Expense, Contract, Project }

    // Structs
    struct Registry {
        bytes32 id;
        address municipality;
        RegistryType registryType;
        bytes32 dataHash;
        string ipfsCID;
        RegistryStatus status;
        uint256 createdAt;
        uint256 validatedAt;
        address validatedBy;
        string observations;
    }

    struct Validation {
        bytes32 registryId;
        address validator;
        bool approved;
        string observations;
        uint256 timestamp;
    }

    // State variables
    mapping(bytes32 => Registry) public registries;
    mapping(bytes32 => Validation[]) public validations;
    mapping(address => bool) public authorizedMunicipalities;
    mapping(address => bool) public authorizedValidators;
    
    bytes32[] public registryIds;
    address[] public municipalities;
    address[] public validators;

    uint256 public registryCount;
    uint256 public validationCount;

    // Events
    event RegistryCreated(
        bytes32 indexed id,
        address indexed municipality,
        RegistryType registryType,
        bytes32 dataHash,
        string ipfsCID,
        uint256 timestamp
    );

    event RegistryValidated(
        bytes32 indexed id,
        address indexed validator,
        bool approved,
        string observations,
        uint256 timestamp
    );

    event RegistryStoredOnChain(
        bytes32 indexed id,
        bytes32 dataHash,
        uint256 timestamp
    );

    event MunicipalityAdded(address indexed municipality);
    event MunicipalityRemoved(address indexed municipality);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    // Modifiers
    modifier onlyMunicipality() {
        require(
            hasRole(MUNICIPALITY_ROLE, msg.sender),
            "Caller is not an authorized municipality"
        );
        _;
    }

    modifier onlyValidator() {
        require(
            hasRole(VALIDATOR_ROLE, msg.sender),
            "Caller is not an authorized validator"
        );
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    modifier registryExists(bytes32 _id) {
        require(registries[_id].createdAt != 0, "Registry does not exist");
        _;
    }

    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // External functions

    /**
     * @dev Crea un nuevo registro municipal
     * @param _registryType Tipo de registro
     * @param _dataHash Hash SHA-256 de los datos del registro
     * @param _ipfsCID CID de IPFS para documentos respaldatorios
     * @return id ID único del registro creado
     */
    function createRegistry(
        RegistryType _registryType,
        bytes32 _dataHash,
        string calldata _ipfsCID
    ) external onlyMunicipality whenNotPaused nonReentrant returns (bytes32 id) {
        require(_dataHash != bytes32(0), "Invalid data hash");
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");

        id = keccak256(
            abi.encodePacked(
                msg.sender,
                _registryType,
                _dataHash,
                _ipfsCID,
                block.timestamp,
                registryCount
            )
        );

        require(registries[id].createdAt == 0, "Registry already exists");

        Registry memory newRegistry = Registry({
            id: id,
            municipality: msg.sender,
            registryType: _registryType,
            dataHash: _dataHash,
            ipfsCID: _ipfsCID,
            status: RegistryStatus.Pending,
            createdAt: block.timestamp,
            validatedAt: 0,
            validatedBy: address(0),
            observations: ""
        });

        registries[id] = newRegistry;
        registryIds.push(id);
        registryCount++;

        emit RegistryCreated(
            id,
            msg.sender,
            _registryType,
            _dataHash,
            _ipfsCID,
            block.timestamp
        );

        return id;
    }

    /**
     * @dev Valida o rechaza un registro
     * @param _id ID del registro
     * @param _approved true para aprobar, false para rechazar
     * @param _observations Observaciones del validador
     */
    function validateRegistry(
        bytes32 _id,
        bool _approved,
        string calldata _observations
    ) external onlyValidator whenNotPaused registryExists(_id) nonReentrant {
        Registry storage registry = registries[_id];
        
        require(
            registry.status == RegistryStatus.Pending,
            "Registry is not pending validation"
        );
        require(
            registry.municipality != msg.sender,
            "Validator cannot validate own registry"
        );

        registry.status = _approved ? RegistryStatus.Validated : RegistryStatus.Rejected;
        registry.validatedAt = block.timestamp;
        registry.validatedBy = msg.sender;
        registry.observations = _observations;

        Validation memory validation = Validation({
            registryId: _id,
            validator: msg.sender,
            approved: _approved,
            observations: _observations,
            timestamp: block.timestamp
        });

        validations[_id].push(validation);
        validationCount++;

        emit RegistryValidated(
            _id,
            msg.sender,
            _approved,
            _observations,
            block.timestamp
        );

        // Si fue aprobado, marcar como listo para blockchain
        if (_approved) {
            registry.status = RegistryStatus.OnChain;
            emit RegistryStoredOnChain(_id, registry.dataHash, block.timestamp);
        }
    }

    /**
     * @dev Obtiene un registro por su ID
     */
    function getRegistry(bytes32 _id)
        external
        view
        registryExists(_id)
        returns (Registry memory)
    {
        return registries[_id];
    }

    /**
     * @dev Obtiene todas las validaciones de un registro
     */
    function getValidations(bytes32 _id)
        external
        view
        registryExists(_id)
        returns (Validation[] memory)
    {
        return validations[_id];
    }

    /**
     * @dev Obtiene todos los IDs de registros
     */
    function getAllRegistryIds() external view returns (bytes32[] memory) {
        return registryIds;
    }

    /**
     * @dev Obtiene registros por municipio
     */
    function getRegistriesByMunicipality(address _municipality)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < registryIds.length; i++) {
            if (registries[registryIds[i]].municipality == _municipality) {
                count++;
            }
        }

        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < registryIds.length; i++) {
            if (registries[registryIds[i]].municipality == _municipality) {
                result[index] = registryIds[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Obtiene registros por estado
     */
    function getRegistriesByStatus(RegistryStatus _status)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < registryIds.length; i++) {
            if (registries[registryIds[i]].status == _status) {
                count++;
            }
        }

        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < registryIds.length; i++) {
            if (registries[registryIds[i]].status == _status) {
                result[index] = registryIds[i];
                index++;
            }
        }

        return result;
    }

    // Admin functions

    /**
     * @dev Agrega un nuevo municipio autorizado
     */
    function addMunicipality(address _municipality) external onlyAdmin {
        require(_municipality != address(0), "Invalid address");
        require(!hasRole(MUNICIPALITY_ROLE, _municipality), "Already a municipality");

        _grantRole(MUNICIPALITY_ROLE, _municipality);
        authorizedMunicipalities[_municipality] = true;
        municipalities.push(_municipality);

        emit MunicipalityAdded(_municipality);
    }

    /**
     * @dev Elimina un municipio autorizado
     */
    function removeMunicipality(address _municipality) external onlyAdmin {
        require(hasRole(MUNICIPALITY_ROLE, _municipality), "Not a municipality");

        _revokeRole(MUNICIPALITY_ROLE, _municipality);
        authorizedMunicipalities[_municipality] = false;

        emit MunicipalityRemoved(_municipality);
    }

    /**
     * @dev Agrega un nuevo validador autorizado
     */
    function addValidator(address _validator) external onlyAdmin {
        require(_validator != address(0), "Invalid address");
        require(!hasRole(VALIDATOR_ROLE, _validator), "Already a validator");

        _grantRole(VALIDATOR_ROLE, _validator);
        authorizedValidators[_validator] = true;
        validators.push(_validator);

        emit ValidatorAdded(_validator);
    }

    /**
     * @dev Elimina un validador autorizado
     */
    function removeValidator(address _validator) external onlyAdmin {
        require(hasRole(VALIDATOR_ROLE, _validator), "Not a validator");

        _revokeRole(VALIDATOR_ROLE, _validator);
        authorizedValidators[_validator] = false;

        emit ValidatorRemoved(_validator);
    }

    /**
     * @dev Pausa el contrato
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Despausa el contrato
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @dev Verifica si una dirección es un municipio autorizado
     */
    function isMunicipality(address _address) external view returns (bool) {
        return hasRole(MUNICIPALITY_ROLE, _address);
    }

    /**
     * @dev Verifica si una dirección es un validador autorizado
     */
    function isValidator(address _address) external view returns (bool) {
        return hasRole(VALIDATOR_ROLE, _address);
    }
}
