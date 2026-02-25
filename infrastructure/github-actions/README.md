# GitHub Actions Workflows

Workflows de CI/CD para el proyecto Elenchos.

## Workflows

### ci-cd.yml
Pipeline principal que incluye:
- Tests del backend (con PostgreSQL y Redis)
- Tests del frontend
- Tests de contratos inteligentes
- Build y push de imágenes Docker
- Deploy a staging y producción

### deploy-contracts.yml
Despliegue manual de contratos inteligentes:
- Soporta localhost, Mumbai y Polygon
- Verificación automática en explorers
- Guarda artifacts del despliegue

### security.yml
Auditoría de seguridad:
- Análisis Slither para contratos
- Auditoría de dependencias npm
- Chequeo de calidad de código

## Secrets Requeridos

Configura estos secrets en GitHub:

```
DOCKER_USERNAME
DOCKER_PASSWORD
PRIVATE_KEY
ALCHEMY_API_KEY
POLYGONSCAN_API_KEY
MUMBAI_RPC_URL
POLYGON_RPC_URL
```

## Uso

Los workflows se ejecutan automáticamente en:
- Push a `main` o `develop`
- Pull requests a `main` o `develop`

Para desplegar contratos manualmente:
1. Ve a Actions > Deploy Contracts
2. Click en "Run workflow"
3. Selecciona la red
4. Ejecuta
