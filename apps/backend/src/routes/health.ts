import type { FastifyInstance } from 'fastify';
import { checkDbConnection } from '../db/pool.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'chainaudit-backend',
      version: '0.1.0',
    };
  });

  fastify.get('/ready', async () => {
    const databaseOk = await checkDbConnection();
    return {
      status: databaseOk ? 'ready' : 'degraded',
      checks: {
        database: databaseOk ? 'ok' : 'not_connected',
        redis: 'not_connected',
        blockchain: 'not_connected',
      },
    };
  });
}
