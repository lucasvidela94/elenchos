import type { FastifyInstance } from 'fastify';
import { listValidators } from '../store/postgres.js';

export async function validatorRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { data: await listValidators() };
  });
}
