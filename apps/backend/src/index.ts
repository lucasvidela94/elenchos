import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import env from '@fastify/env';
import { config } from './config/env.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { registryRoutes } from './routes/registry.js';
import { municipalityRoutes } from './routes/municipality.js';
import { validatorRoutes } from './routes/validator.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDatabase } from './db/init.js';
import { pool } from './db/pool.js';

async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      } : undefined,
    },
  });

  await app.register(env, {
    dotenv: true,
    schema: {
      type: 'object',
      required: ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'],
      properties: {
        DATABASE_URL: { type: 'string' },
        REDIS_URL: { type: 'string' },
        JWT_SECRET: { type: 'string' },
        RPC_URL: { type: 'string' },
        PRIVATE_KEY: { type: 'string' },
        CONTRACT_ADDRESS: { type: 'string' },
        IPFS_API_KEY: { type: 'string' },
        IPFS_API_SECRET: { type: 'string' },
      },
    },
  });

  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(jwt, {
    secret: config.JWT_SECRET,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Elenchos API',
        description: 'API for municipal registry and blockchain traceability',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  await initDatabase();

  app.addHook('onClose', async () => {
    await pool.end();
  });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: '/api/v1/health' });
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(registryRoutes, { prefix: '/api/v1/records' });
  await app.register(municipalityRoutes, { prefix: '/api/v1/municipios' });
  await app.register(validatorRoutes, { prefix: '/api/v1/validators' });

  return app;
}

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${config.PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
