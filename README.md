# Elenchos

Sistema de registro y trazabilidad de actividades municipales en blockchain.

## Stack Tecnológico

### Blockchain
- **Red principal**: Polygon PoS
- **Red de testing**: Mumbai Testnet
- **Lenguaje**: Solidity ^0.8.20
- **Framework**: Foundry
- **RPC Provider**: Alchemy
- **Wallet**: ethers.js / viem

### Backend
- **Lenguaje**: TypeScript + Node.js
- **Framework API**: Fastify
- **Base de datos**: PostgreSQL
- **Cache**: Redis
- **Indexer**: Servicio propio con WebSocket
- **Storage**: IPFS (Pinata)
- **Autenticación**: JWT + API Key + Wallet signature

### Frontend
- **Framework**: React + TypeScript + Vite
- **Web3 hooks**: wagmi + viem
- **UI Wallets**: RainbowKit
- **Estilos**: Tailwind CSS + shadcn/ui

### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Railway/Render + Vercel
- **Monitoreo**: Grafana + Prometheus

## Estructura del Proyecto

```
elenchos/
├── apps/
│   ├── backend/          # API Fastify
│   └── frontend/         # React + Vite
├── packages/
│   ├── contracts/        # Contratos Solidity (Foundry)
│   ├── shared/           # Código compartido
│   └── ui/               # Componentes UI
└── infrastructure/
    ├── docker/           # Configuración Docker
    ├── k8s/              # Kubernetes manifests
    └── github-actions/   # Workflows CI/CD
```

## Inicio Rápido

### Requisitos
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker y Docker Compose
- Foundry (para contratos)

### Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servicios de infraestructura
pnpm docker:up

# Iniciar desarrollo
pnpm dev
```

## Licencia

MIT
# elenchos
