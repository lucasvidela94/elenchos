import type { FastifyInstance } from 'fastify';
import {
  getMunicipalityById,
  listMunicipalities,
  listRecordsByMunicipality,
  type SpendType,
} from '../store/postgres.js';

export async function municipalityRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const municipalities = await listMunicipalities();
    const data = await Promise.all(municipalities.map(async (municipality) => {
      const byMunicipality = await listRecordsByMunicipality(municipality.id);
      const total = byMunicipality.length;
      const totalMonto = byMunicipality.reduce((acc, record) => acc + record.monto, 0);
      const pendientes = byMunicipality.filter((record) => record.estado === 'PENDIENTE').length;
      const validados = byMunicipality.filter((record) => record.estado === 'VALIDADO').length;
      const observados = byMunicipality.filter((record) => record.estado === 'OBSERVADO').length;
      return {
        id: municipality.id,
        nombre: municipality.nombre,
        activa: municipality.activa,
        stats: {
          total_registros: total,
          monto_total: totalMonto,
          pendientes,
          validados,
          observados,
        },
      };
    }));

    return { data };
  });

  fastify.get('/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string };
    const municipality = await getMunicipalityById(id);
    if (!municipality) {
      return reply.status(404).send({
        error: {
          code: 'MUNICIPALITY_NOT_FOUND',
          message: 'Municipio no encontrado',
        },
      });
    }

    const records = await listRecordsByMunicipality(id);
    const byType: Record<SpendType, number> = {
      PERSONAL: 0,
      OBRA: 0,
      SERVICIO: 0,
      SUBSIDIO: 0,
      OTRO: 0,
    };
    const byStatus = {
      PENDIENTE: 0,
      VALIDADO: 0,
      OBSERVADO: 0,
    };
    const timeline: Record<string, number> = {};

    for (const record of records) {
      byType[record.tipo_gasto] += record.monto;
      byStatus[record.estado] += 1;
      const month = record.fecha_gasto.slice(0, 7);
      timeline[month] = (timeline[month] ?? 0) + record.monto;
    }

    return {
      data: {
        municipio: {
          id: municipality.id,
          nombre: municipality.nombre,
        },
        total_registros: records.length,
        monto_total: records.reduce((acc, record) => acc + record.monto, 0),
        por_tipo: byType,
        por_estado: byStatus,
        timeline,
      },
    };
  });
}
