import type { FastifyInstance } from 'fastify';
import {
  createAuthChallenge,
  consumeAuthChallenge,
  findValidatorByWallet,
  type NoncePurpose,
} from '../store/postgres.js';
import { buildChallengeMessage, verifyWalletSignature } from '../utils/signature.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/challenge', async (request, reply) => {
    const body = request.body as { wallet?: string; purpose?: NoncePurpose };
    const wallet = body.wallet?.trim();
    const purpose = body.purpose ?? 'login';

    if (!wallet) {
      return reply.status(400).send({
        error: {
          code: 'MISSING_WALLET',
          message: 'wallet es requerido',
        },
      });
    }

    if (!['login', 'validate_record', 'observe_record'].includes(purpose)) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_PURPOSE',
          message: 'purpose invalido',
        },
      });
    }

    const message = buildChallengeMessage(purpose, crypto.randomUUID());
    const challenge = await createAuthChallenge(wallet, purpose, message);

    return {
      data: {
        wallet: challenge.wallet,
        purpose: challenge.purpose,
        nonce: challenge.nonce,
        message: challenge.message,
        expires_at: challenge.expires_at,
      },
    };
  });

  fastify.post('/login', async (request, reply) => {
    const body = request.body as { wallet?: string; signature?: string; nonce?: string };
    if (!body.wallet || !body.signature || !body.nonce) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_LOGIN_PAYLOAD',
          message: 'wallet, signature y nonce son requeridos',
        },
      });
    }

    const validator = await findValidatorByWallet(body.wallet);
    if (!validator) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_VALIDATOR',
          message: 'Avalista no autorizado',
        },
      });
    }

    const challenge = await consumeAuthChallenge(body.wallet, 'login', body.nonce);
    if (!challenge) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_NONCE',
          message: 'Nonce invalido, vencido o ya utilizado',
        },
      });
    }

    const isValidSignature = await verifyWalletSignature(body.wallet, challenge.message, body.signature);
    if (!isValidSignature) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Firma invalida',
        },
      });
    }

    const token = await reply.jwtSign(
      {
        wallet: body.wallet,
        validator_id: validator.id,
        role: 'validator',
      },
      { expiresIn: '24h' }
    );

    return {
      data: {
        token,
      },
    };
  });
}
