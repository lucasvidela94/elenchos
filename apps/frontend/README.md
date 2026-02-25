# Elenchos Frontend

Frontend de la aplicación Elenchos construido con React, Vite, wagmi y RainbowKit.

## Características

- ⚡ Vite para desarrollo rápido
- 🔗 wagmi + viem para integración Web3
- 🎨 RainbowKit para conexión de wallets
- 💅 Tailwind CSS + shadcn/ui para estilos
- 📱 Diseño responsive
- 🔍 Explorador público de registros
- 🏛️ Panel de municipio
- ✅ Panel de avalista

## Scripts

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Preview
pnpm preview

# Tests
pnpm test

# Lint
pnpm lint
```

## Variables de Entorno

Crea un archivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=80001
```
