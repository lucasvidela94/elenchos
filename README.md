# Elenchos

Blockchain-based municipal activity registration and traceability system.

## Features

- Immutable recording of government activities
- Complete traceability with blockchain timestamps
- Modern and accessible web interface
- RESTful API for integrations
- Auditable smart contracts on Polygon

## Tech Stack

| Layer              | Technology                                               |
| ------------------ | -------------------------------------------------------- |
| **Blockchain**     | Polygon PoS, Solidity ^0.8.20, Foundry                   |
| **Backend**        | Node.js, TypeScript, Fastify, PostgreSQL, Redis          |
| **Frontend**       | React, TypeScript, Vite, wagmi, RainbowKit, Tailwind CSS |
| **Infrastructure** | Docker, GitHub Actions, Grafana, Prometheus              |

## Project Structure

```
elenchos/
├── apps/
│   ├── backend/          # Fastify API
│   └── frontend/         # React + Vite
├── packages/
│   ├── contracts/        # Solidity contracts (Foundry)
│   ├── shared/           # Shared code
│   └── ui/               # UI components
└── infrastructure/       # Docker, K8s, CI/CD
```

## Requirements

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker and Docker Compose
- Foundry (for contracts)

## Installation

```bash
# Install dependencies
pnpm install

# Start services
pnpm docker:up

# Development
pnpm dev
```

## Scripts

| Command          | Description            |
| ---------------- | ---------------------- |
| `pnpm dev`       | Start development mode |
| `pnpm build`     | Build for production   |
| `pnpm docker:up` | Start Docker services  |
| `pnpm test`      | Run tests              |

## License

MIT
