# ChainAudit
## Registro Público de Auditoría Gubernamental en Blockchain

**Documento de Arquitectura · v1.0 · 2025**

> 🔒 Transparencia radical · Registros inmutables · Validación institucional · Open Source

---

## 1. Visión y Propósito

**ChainAudit** es una plataforma de bien público que permite registrar, validar y consultar movimientos de gasto gubernamental utilizando tecnología blockchain. Su objetivo es invertir la carga de la prueba: en lugar de que el ciudadano tenga que ir a buscar información, el gobierno debe demostrar públicamente que gastó bien.

El sistema corre desde el inicio de una gestión hasta su finalización. Todo lo registrado en ese período queda inmortalizado on-chain. Ningún municipio está obligado a participar — pero quien lo hace, señala voluntariamente su compromiso con la transparencia.

> **Principio fundamental:** la blockchain garantiza que lo que se registró no fue modificado. Los avalistas institucionales garantizan que lo registrado es veraz. La combinación de ambos crea confianza sin depender de ninguna autoridad central única.

---

## 2. Actores del Sistema

| Actor | Rol y permisos |
|---|---|
| **Municipio / Organismo** | Entidad que carga movimientos de gasto. Se autentica mediante API Key + wallet firmante. Solo puede escribir sus propios registros. |
| **Avalista Institucional** | Organismo que valida y co-firma los registros: Tribunales de Cuentas, Sindicatura General, ONGs de transparencia, universidades públicas. Su firma es el sello de legitimidad. |
| **Ciudadano / Sociedad Civil** | Acceso público de solo lectura. Puede explorar todos los registros, ver estados de validación, exportar datos y detectar inconsistencias. |
| **Administrador de Plataforma** | Gestiona el registro de municipios y avalistas en el smart contract. Rol técnico, sin poder sobre los registros individuales. |

---

## 3. Arquitectura General

El sistema utiliza una arquitectura híbrida: los datos viven off-chain para eficiencia y costo, pero sus hashes y metadatos críticos se anclan on-chain para garantizar inmutabilidad y verificabilidad pública.

> **On-chain:** HASH del registro + metadatos mínimos (municipio, fecha, monto, tipo, estado de validación)

> **Off-chain:** Datos completos, documentos adjuntos, índice de búsqueda, explorador web

Esto mantiene costos de gas mínimos (< USD 0.01 por registro en Polygon) y permite búsquedas complejas sin las limitaciones de una blockchain.

### 3.1 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                      │
│     Explorador Web (React) · Dashboard Municipio            │
│              Panel Avalista · API Docs                      │
├─────────────────────────────────────────────────────────────┤
│                      CAPA DE API                            │
│   REST API pública · Webhooks · SDK cliente                 │
│              Autenticación JWT + API Key                    │
├─────────────────────────────────────────────────────────────┤
│              CAPA DE LÓGICA DE NEGOCIO                      │
│   Servicio de registros · Servicio de validación            │
│                Indexer · Hash Engine                        │
├─────────────────────────────────────────────────────────────┤
│               CAPA DE DATOS OFF-CHAIN                       │
│       PostgreSQL (datos) · Redis (cache)                    │
│                 S3/IPFS (documentos)                        │
├─────────────────────────────────────────────────────────────┤
│              CAPA BLOCKCHAIN (ON-CHAIN)                     │
│     Smart Contracts Solidity · Polygon PoS                  │
│                  Eventos on-chain                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Smart Contract — Diseño

El corazón del sistema es un smart contract en Solidity desplegado en Polygon. Su función es mínima por diseño: recibir hashes de registros, gestionar el estado de validación y mantener el registro de actores autorizados.

### 4.1 Entidades del Contrato

| Entidad | Campos |
|---|---|
| **AuditRecord** | hash (bytes32), municipioId, timestamp, monto, tipoGasto, estado (PENDIENTE / VALIDADO / OBSERVADO), avalista que firmó, URI al dato completo off-chain |
| **Municipality** | id, nombre, wallet autorizada, activa (bool), timestamp de registro |
| **Validator** | wallet del avalista, nombre, activo (bool), registros validados |

### 4.2 Funciones Principales

| Función | Descripción |
|---|---|
| `submitRecord(hash, metadata)` | Solo municipio autorizado. Crea el registro en estado PENDIENTE. Emite evento `RecordSubmitted`. |
| `validateRecord(recordId)` | Solo avalista registrado. Cambia estado a VALIDADO. Emite evento `RecordValidated`. |
| `observeRecord(recordId, motivo)` | Solo avalista. Marca el registro como OBSERVADO con motivo público. No borra el registro. |
| `registerMunicipality(wallet, nombre)` | Solo admin. Autoriza un nuevo municipio. |
| `registerValidator(wallet, nombre)` | Solo admin. Registra un nuevo avalista institucional. |
| `getRecord(recordId)` | Público. Devuelve todos los campos del registro. |

> **Nota de diseño:** el contrato es append-only. Ningún registro puede eliminarse. Las correcciones se agregan como nuevos registros con referencia al anterior. Esto garantiza la trazabilidad completa.

### 4.3 Modelo de Firmas — Multisig Simplificado

No se usa un multisig clásico. En cambio se usa un modelo de dos pasos más simple y auditable:

- **Paso 1 —** El municipio firma y envía la transacción de `submitRecord` con su wallet privada
- **Paso 2 —** Un avalista independiente revisa off-chain el registro y, si es correcto, envía la transacción `validateRecord` con su propia wallet
- Si el avalista detecta un problema, ejecuta `observeRecord` con el motivo, que queda público on-chain

La ausencia de validación después de N días también es información pública visible en el explorador. Esto crea presión institucional sin necesitar mecanismos complejos.

---

## 5. Stack Tecnológico

### 5.1 Blockchain

| Componente | Tecnología y justificación |
|---|---|
| **Red principal** | Polygon PoS — bajo costo de gas (< USD 0.01/tx), EVM-compatible, amplio ecosistema, programa de impacto social con créditos gratuitos |
| **Red de testing** | Mumbai Testnet (Polygon) para desarrollo y staging |
| **Lenguaje contratos** | Solidity ^0.8.20 |
| **Framework contratos** | Foundry — testing en Solidity, deploys scriptados, más rápido que Hardhat |
| **RPC Provider** | Alchemy (plan gratuito inicial) o nodo propio con Polygon Edge |
| **Wallet firmante** | ethers.js / viem para firma de transacciones en backend |

### 5.2 Backend

| Componente | Tecnología y justificación |
|---|---|
| **Lenguaje** | TypeScript + Node.js — ecosistema maduro para Web3, amplia disponibilidad de librerías (ethers, viem) |
| **Framework API** | Fastify — más rápido que Express, soporte nativo de TypeScript, ideal para API pública con alto volumen de reads |
| **Base de datos** | PostgreSQL — datos estructurados, queries complejas de búsqueda y filtrado, JSONB para metadata flexible |
| **Cache** | Redis — cache de queries frecuentes, rate limiting, sesiones |
| **Indexer** | Servicio propio que escucha eventos on-chain via WebSocket y sincroniza con PostgreSQL. Alternativa futura: The Graph |
| **Hash Engine** | SHA-256 del payload JSON canónico del registro antes de enviarlo on-chain |
| **Storage documentos** | IPFS (via Pinata o nodo propio) para documentos respaldatorios. El CID de IPFS se incluye en el registro. |
| **Autenticación** | JWT para sesiones de panel + API Key para integración de municipios + firma de wallet para operaciones on-chain |

### 5.3 Frontend

| Componente | Tecnología y justificación |
|---|---|
| **Framework** | React + TypeScript + Vite |
| **Web3 hooks** | wagmi + viem — conexión de wallets, firma de transacciones, lectura de contratos |
| **UI Wallets** | RainbowKit — UI lista para conectar MetaMask, WalletConnect, etc. |
| **Estilos** | Tailwind CSS + shadcn/ui |
| **Explorador** | Página pública de búsqueda por municipio, fecha, tipo y estado. Sin autenticación. |
| **Panel municipio** | Dashboard para cargar registros y ver su estado de validación |
| **Panel avalista** | Cola de registros pendientes, interfaz de validación/observación |

### 5.4 Infraestructura y DevOps

| Componente | Tecnología y justificación |
|---|---|
| **Contenedores** | Docker + Docker Compose para desarrollo local. Kubernetes para producción si escala. |
| **CI/CD** | GitHub Actions — tests automáticos, deploy automático |
| **Hosting inicial** | Railway o Render (gratuito/barato para proyecto open source) + Vercel para frontend |
| **Monitoreo** | Grafana + Prometheus para métricas de API. Alertas si el indexer se desincroniza. |
| **Repositorio** | GitHub público — licencia MIT o GPL |

---

## 6. Modelo de Datos

### 6.1 Registro de Auditoría (AuditRecord)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único off-chain |
| `on_chain_id` | uint256 | ID del registro en el smart contract |
| `record_hash` | bytes32 | SHA-256 del payload. Ancla on-chain. |
| `municipio_id` | UUID FK | Referencia al municipio |
| `tipo_gasto` | enum | PERSONAL / OBRA / SERVICIO / SUBSIDIO / OTRO |
| `monto` | decimal(18,2) | Importe en moneda local |
| `moneda` | varchar(3) | ARS, USD, etc. |
| `descripcion` | text | Descripción del gasto |
| `fecha_gasto` | date | Fecha del movimiento |
| `fecha_registro` | timestamp | Cuando se envió on-chain |
| `periodo_gestion` | varchar(20) | Ej: 2023-2027 |
| `estado` | enum | PENDIENTE / VALIDADO / OBSERVADO |
| `avalista_id` | UUID FK null | Quién validó (si aplica) |
| `motivo_observacion` | text null | Razón de la observación (pública) |
| `ipfs_cid` | varchar null | CID del documento respaldatorio |
| `tx_hash` | varchar(66) | Hash de la transacción en Polygon |
| `metadata` | JSONB | Campos adicionales flexibles |

---

## 7. API Pública

La API sigue el estándar REST con respuestas en JSON. Toda operación de lectura es pública y sin autenticación. Las operaciones de escritura requieren API Key (municipios) o wallet firmada (avalistas).

### 7.1 Endpoints de Lectura (Públicos)

| Endpoint | Descripción |
|---|---|
| `GET /api/v1/records` | Lista paginada de registros. Filtros: municipio, estado, tipo, fecha_desde, fecha_hasta, monto_min, monto_max. |
| `GET /api/v1/records/:id` | Detalle de un registro. Incluye URL de verificación on-chain. |
| `GET /api/v1/records/:id/verify` | Verifica on-chain que el hash del registro no fue alterado. Devuelve `match: true/false`. |
| `GET /api/v1/municipios` | Lista de municipios participantes con estadísticas agregadas. |
| `GET /api/v1/municipios/:id/stats` | Resumen de gasto por tipo, estado de validación, timeline. |
| `GET /api/v1/validators` | Lista de avalistas institucionales registrados. |
| `GET /api/v1/health` | Estado del sistema, último bloque indexado, latencia. |

### 7.2 Endpoints de Escritura (Autenticados)

| Endpoint | Descripción |
|---|---|
| `POST /api/v1/records` | Municipio crea nuevo registro. Requiere API Key. Backend calcula hash y envía tx on-chain. |
| `POST /api/v1/records/:id/validate` | Avalista valida un registro pendiente. Requiere firma de wallet. |
| `POST /api/v1/records/:id/observe` | Avalista observa un registro con motivo. Requiere firma de wallet. |
| `POST /api/v1/records/:id/document` | Municipio adjunta documento a un registro. Sube a IPFS y actualiza CID. |

---

## 8. Flujo de Vida de un Registro

El siguiente flujo describe el ciclo completo desde que un municipio carga un gasto hasta que queda validado públicamente:

1. El municipio llama a `POST /api/v1/records` con los datos del gasto y su API Key
2. El backend valida el formato, calcula el SHA-256 del payload canónico y guarda en PostgreSQL en estado **PENDIENTE**
3. El backend envía la transacción `submitRecord` al smart contract en Polygon con el hash y metadatos mínimos
4. El contrato emite el evento `RecordSubmitted` con el `on_chain_id`. El indexer captura el evento y actualiza el registro con el `tx_hash`
5. El registro queda visible públicamente en el explorador en estado **PENDIENTE**
6. El avalista institucional ve el registro en su panel, descarga el documento adjunto (si existe) y verifica la consistencia
7. Si todo está correcto: el avalista llama a `POST /api/v1/records/:id/validate`. El backend envía `validateRecord` al contrato → estado **VALIDADO**
8. Si hay inconsistencias: el avalista llama a `observe` con el motivo. El motivo queda on-chain y visible públicamente → estado **OBSERVADO**
9. El explorador actualiza el estado. Cualquier ciudadano puede verificar el hash on-chain.

---

## 9. Roadmap de Desarrollo

| Fase | Alcance |
|---|---|
| **Fase 1 — MVP** (2-3 meses) | Smart contract base en Foundry + tests. API REST con endpoints core. Explorador web básico. Deploy en Polygon Mumbai testnet. Primer municipio piloto. |
| **Fase 2 — Validadores** (1-2 meses) | Panel de avalistas con cola de validación. Notificaciones por email/webhook. Sistema de observaciones con motivos. Deploy en Polygon mainnet. |
| **Fase 3 — Escala** (2-3 meses) | SDK para municipios (npm package). Dashboard de estadísticas agregadas. Integración IPFS para documentos. The Graph para indexing descentralizado. |
| **Fase 4 — Ecosistema** | Soporte multi-chain (Ethereum L2s). API de reportes para medios y sociedad civil. Plugin para sistemas de gestión municipal existentes. Gobernanza on-chain del registro de avalistas. |

---

## 10. Consideraciones Importantes

### 10.1 Lo que blockchain garantiza y lo que no

✅ **Garantiza:** que un registro no fue modificado desde que se subió. Que existe una fecha y un firmante. Que ningún actor puede borrar datos.

⚠️ **No garantiza:** que el registro refleja la realidad del mundo físico. Para eso existen los avalistas institucionales.

### 10.2 Privacidad y datos sensibles

Los registros deben contener información de gasto público, que por definición debe ser pública. Sin embargo, deben evitarse datos personales de empleados individuales. El diseño trabaja con categorías y montos agregados para tipos de gasto como personal, no con nombres específicos.

### 10.3 Modelo de sostenibilidad

Como proyecto de bien público open source, el financiamiento puede provenir de grants de Ethereum Foundation, Polygon Foundation o iniciativas de gobierno abierto. Los costos de gas en Polygon son mínimos (del orden de centavos por registro). Polygon tiene un programa de gas credits para proyectos de impacto social.

### 10.4 Gobernanza del registro de avalistas

El registro de quién puede ser avalista es el punto de centralización más delicado del sistema. En fase inicial, lo administra el equipo del proyecto. En fases avanzadas, puede migrar a gobernanza on-chain donde los propios avalistas registrados votan la incorporación de nuevos miembros.

---

> *Construido con la convicción de que la tecnología puede hacer la democracia más transparente.*

**ChainAudit es open source.** Todo el código, los contratos y la documentación serán públicos desde el día uno. Si un municipio, provincia u organismo quiere contribuir, auditar el código, o correr su propio nodo, puede hacerlo.
