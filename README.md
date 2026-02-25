# Elenchos

Sistema de registro y trazabilidad de actividades municipales en blockchain.

## Características

- Registro inmutable de actividades gubernamentales
- Trazabilidad completa con timestamps en blockchain
- Interfaz web moderna y accesible
- API RESTful para integraciones
- Contratos inteligentes auditables en Polygon

## Stack Tecnológico

| Capa                | Tecnología                                               |
| ------------------- | -------------------------------------------------------- |
| **Blockchain**      | Polygon PoS, Solidity ^0.8.20, Foundry                   |
| **Backend**         | Node.js, TypeScript, Fastify, PostgreSQL, Redis          |
| **Frontend**        | React, TypeScript, Vite, wagmi, RainbowKit, Tailwind CSS |
| **Infraestructura** | Docker, GitHub Actions, Grafana, Prometheus              |

## Estructura

```
elenchos/
├── apps/
│   ├── backend/          # API Fastify
│   └── frontend/         # React + Vite
├── packages/
│   ├── contracts/        # Contratos Solidity (Foundry)
│   ├── shared/           # Código compartido
│   └── ui/               # Componentes UI
└── infrastructure/       # Docker, K8s, CI/CD
```

## Requisitos

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker y Docker Compose
- Foundry (para contratos)

## Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servicios
pnpm docker:up

# Desarrollo
pnpm dev
```

## Scripts

| Comando          | Descripción               |
| ---------------- | ------------------------- |
| `pnpm dev`       | Iniciar modo desarrollo   |
| `pnpm build`     | Compilar producción       |
| `pnpm docker:up` | Levantar servicios Docker |
| `pnpm test`      | Ejecutar tests            |

## Licencia

MIT
