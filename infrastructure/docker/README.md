# Docker Infrastructure

Configuración Docker Compose para desarrollo local de Elenchos.

## Servicios

- **PostgreSQL** (puerto 5432): Base de datos principal
- **Redis** (puerto 6379): Cache y rate limiting
- **Backend** (puerto 3000): API Fastify
- **Frontend** (puerto 5173): React + Vite
- **Anvil** (puerto 8545): Blockchain local (Foundry)
- **IPFS** (puertos 4001, 5001, 8080): Almacenamiento descentralizado

## Uso

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## Variables de Entorno

Crea un archivo `.env` en esta carpeta:

```env
JWT_SECRET=your_secret_key
PRIVATE_KEY=your_private_key_for_anvil
```

## Acceso a servicios

- API: http://localhost:3000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Anvil RPC: http://localhost:8545
- IPFS API: http://localhost:5001
- IPFS Gateway: http://localhost:8080
