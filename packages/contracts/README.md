# Elenchos Smart Contracts

Contratos inteligentes para el sistema de registro y trazabilidad municipal en blockchain.

## Contratos

### ElenchosRegistry.sol
Contrato principal que gestiona:
- Creación de registros municipales
- Validación por avalistas
- Almacenamiento inmutable en blockchain
- Control de acceso basado en roles

## Características

- ✅ Solidity ^0.8.20
- ✅ OpenZeppelin Contracts (AccessControl, Pausable, ReentrancyGuard)
- ✅ Foundry para testing y deployment
- ✅ Gas optimizado
- ✅ Roles: Admin, Municipality, Validator

## Instalación

```bash
# Instalar dependencias
forge install

# Compilar
forge build

# Test
forge test

# Coverage
forge coverage
```

## Deployment

### Local
```bash
anvil
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Mumbai Testnet
```bash
forge script script/Deploy.s.sol --rpc-url $MUMBAI_RPC_URL --broadcast --verify
```

### Polygon Mainnet
```bash
forge script script/Deploy.s.sol --rpc-url $POLYGON_RPC_URL --broadcast --verify
```

## Variables de Entorno

```bash
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
POLYGONSCAN_API_KEY=your_polygonscan_key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
```
