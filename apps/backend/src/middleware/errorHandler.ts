import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    });
  }

  if (error.statusCode === 401) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }

  if (error.statusCode === 429) {
    return reply.status(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
    });
  }

  return reply.status(error.statusCode || 500).send({
    statusCode: error.statusCode || 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
  });
};
