import type { FastifyInstance } from 'fastify';
import {
  attachRecordDocument,
  consumeAuthChallenge,
  createRecord,
  findMunicipalityByApiKey,
  findValidatorByWallet,
  getRecordById,
  listRecords,
  observeRecord,
  validateRecord,
  type SpendType,
} from '../store/postgres.js';
import { generateHash } from '../utils/hash.js';
import { verifyWalletSignature } from '../utils/signature.js';

export async function registryRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request) => {
    const query = request.query as {
      municipio?: string;
      estado?: string;
      tipo?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
      monto_min?: string;
      monto_max?: string;
      page?: string;
      limit?: string;
    };

    const page = Number(query.page ?? '1');
    const limit = Number(query.limit ?? '20');
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;

    const { data, total } = await listRecords({
      municipio: query.municipio,
      estado: query.estado,
      tipo: query.tipo,
      fecha_desde: query.fecha_desde,
      fecha_hasta: query.fecha_hasta,
      monto_min: query.monto_min ? Number(query.monto_min) : undefined,
      monto_max: query.monto_max ? Number(query.monto_max) : undefined,
      page: safePage,
      limit: safeLimit,
    });

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
      },
    };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const record = await getRecordById(id);
    if (!record) {
      return reply.status(404).send({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Registro no encontrado',
        },
      });
    }
    return {
      data: record,
    };
  });

  fastify.get('/:id/verify', async (request, reply) => {
    const { id } = request.params as { id: string };
    const record = await getRecordById(id);
    if (!record) {
      return reply.status(404).send({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Registro no encontrado',
        },
      });
    }

    const payloadForHash: Record<string, unknown> = {
      municipio_id: record.municipio_id,
      tipo_gasto: record.tipo_gasto,
      monto: record.monto,
      moneda: record.moneda,
      descripcion: record.descripcion,
      fecha_gasto: record.fecha_gasto,
      periodo_gestion: record.periodo_gestion,
      metadata: record.metadata,
    };

    const computedHash = generateHash(payloadForHash);
    return {
      data: {
        id: record.id,
        match: computedHash === record.record_hash,
        on_chain_hash: record.record_hash,
        computed_hash: computedHash,
      },
    };
  });

  fastify.post('/', async (request, reply) => {
    const apiKey = request.headers['x-api-key'];
    const normalizedApiKey = typeof apiKey === 'string' ? apiKey : '';
    const municipality = await findMunicipalityByApiKey(normalizedApiKey);
    if (!municipality) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_API_KEY',
          message: 'API Key invalida',
        },
      });
    }

    const body = request.body as {
      tipo_gasto?: SpendType;
      monto?: number;
      moneda?: string;
      descripcion?: string;
      fecha_gasto?: string;
      periodo_gestion?: string;
      metadata?: Record<string, unknown>;
    };

    if (
      !body.tipo_gasto ||
      typeof body.monto !== 'number' ||
      !body.moneda ||
      !body.descripcion ||
      !body.fecha_gasto ||
      !body.periodo_gestion
    ) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Faltan campos requeridos para crear el registro',
        },
      });
    }

    const payloadForHash = {
      municipio_id: municipality.id,
      tipo_gasto: body.tipo_gasto,
      monto: body.monto,
      moneda: body.moneda,
      descripcion: body.descripcion,
      fecha_gasto: body.fecha_gasto,
      periodo_gestion: body.periodo_gestion,
      metadata: body.metadata ?? {},
    };

    const created = await createRecord({
      record_hash: generateHash(payloadForHash),
      municipio_id: municipality.id,
      tipo_gasto: body.tipo_gasto,
      monto: body.monto,
      moneda: body.moneda,
      descripcion: body.descripcion,
      fecha_gasto: body.fecha_gasto,
      periodo_gestion: body.periodo_gestion,
      estado: 'PENDIENTE',
      avalista_id: null,
      motivo_observacion: null,
      ipfs_cid: null,
      tx_hash: `0x${crypto.randomUUID().replaceAll('-', '')}`,
      metadata: body.metadata ?? {},
    });

    return reply.status(201).send({ data: created });
  });

  fastify.post('/:id/validate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { wallet?: string; signature?: string; nonce?: string };
    if (!body.wallet || !body.signature || !body.nonce) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_VALIDATION_PAYLOAD',
          message: 'wallet, signature y nonce son requeridos',
        },
      });
    }

    const wallet = body.wallet.trim();
    const validator = await findValidatorByWallet(wallet);
    if (!validator) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_VALIDATOR',
          message: 'Avalista no autorizado',
        },
      });
    }

    const challenge = await consumeAuthChallenge(wallet, 'validate_record', body.nonce);
    if (!challenge) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_NONCE',
          message: 'Nonce invalido, vencido o ya utilizado',
        },
      });
    }

    const isValidSignature = await verifyWalletSignature(wallet, challenge.message, body.signature);
    if (!isValidSignature) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Firma invalida',
        },
      });
    }

    const current = await getRecordById(id);
    if (!current) {
      return reply.status(404).send({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Registro no encontrado',
        },
      });
    }

    if (current.estado !== 'PENDIENTE') {
      return reply.status(409).send({
        error: {
          code: 'INVALID_STATUS',
          message: 'Solo se pueden validar registros en estado PENDIENTE',
        },
      });
    }

    const updated = await validateRecord(id, validator.id);
    return { data: updated };
  });

  fastify.post('/:id/observe', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { wallet?: string; signature?: string; nonce?: string; motivo?: string };
    if (!body.wallet || !body.signature || !body.nonce) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_OBSERVE_PAYLOAD',
          message: 'wallet, signature y nonce son requeridos',
        },
      });
    }

    const wallet = body.wallet.trim();
    const validator = await findValidatorByWallet(wallet);
    if (!validator) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_VALIDATOR',
          message: 'Avalista no autorizado',
        },
      });
    }

    if (!body.motivo || !body.motivo.trim()) {
      return reply.status(400).send({
        error: {
          code: 'MISSING_REASON',
          message: 'El motivo de observacion es requerido',
        },
      });
    }

    const challenge = await consumeAuthChallenge(wallet, 'observe_record', body.nonce);
    if (!challenge) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_NONCE',
          message: 'Nonce invalido, vencido o ya utilizado',
        },
      });
    }

    const isValidSignature = await verifyWalletSignature(wallet, challenge.message, body.signature);
    if (!isValidSignature) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Firma invalida',
        },
      });
    }

    const current = await getRecordById(id);
    if (!current) {
      return reply.status(404).send({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Registro no encontrado',
        },
      });
    }

    if (current.estado !== 'PENDIENTE') {
      return reply.status(409).send({
        error: {
          code: 'INVALID_STATUS',
          message: 'Solo se pueden observar registros en estado PENDIENTE',
        },
      });
    }

    const updated = await observeRecord(id, validator.id, body.motivo.trim());
    return { data: updated };
  });

  fastify.post('/:id/document', async (request, reply) => {
    const { id } = request.params as { id: string };
    const apiKey = request.headers['x-api-key'];
    const normalizedApiKey = typeof apiKey === 'string' ? apiKey : '';
    const municipality = await findMunicipalityByApiKey(normalizedApiKey);
    if (!municipality) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_API_KEY',
          message: 'API Key invalida',
        },
      });
    }

    const record = await getRecordById(id);
    if (!record) {
      return reply.status(404).send({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Registro no encontrado',
        },
      });
    }

    if (record.municipio_id !== municipality.id) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN_RECORD',
          message: 'No puedes adjuntar documentos a un registro de otro municipio',
        },
      });
    }

    const body = request.body as { cid?: string };
    if (!body.cid || !body.cid.trim()) {
      return reply.status(400).send({
        error: {
          code: 'MISSING_CID',
          message: 'Debes enviar un cid valido',
        },
      });
    }

    const updated = await attachRecordDocument(id, body.cid.trim());
    return { data: updated };
  });
}
