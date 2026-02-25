import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN: z.string().default('*'),
  RPC_URL: z.string().default('https://rpc-mumbai.maticvigil.com'),
  PRIVATE_KEY: z.string().optional(),
  CONTRACT_ADDRESS: z.string().optional(),
  IPFS_API_KEY: z.string().optional(),
  IPFS_API_SECRET: z.string().optional(),
  PINATA_API_KEY: z.string().optional(),
  PINATA_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
