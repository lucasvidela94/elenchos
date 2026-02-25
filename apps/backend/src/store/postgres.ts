import { and, asc, count, desc, eq, gt, gte, isNull, lte, sql } from 'drizzle-orm';
import { db } from '../db/pool.js';
import { auditRecords, authNonces, municipalities, validators } from '../db/schema.js';

export type RecordStatus = 'PENDIENTE' | 'VALIDADO' | 'OBSERVADO';
export type SpendType = 'PERSONAL' | 'OBRA' | 'SERVICIO' | 'SUBSIDIO' | 'OTRO';

export interface AuditRecord {
  id: string;
  on_chain_id: number;
  record_hash: string;
  municipio_id: string;
  tipo_gasto: SpendType;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha_gasto: string;
  fecha_registro: string;
  periodo_gestion: string;
  estado: RecordStatus;
  avalista_id: string | null;
  motivo_observacion: string | null;
  ipfs_cid: string | null;
  tx_hash: string;
  metadata: Record<string, unknown>;
}

export interface Municipality {
  id: string;
  nombre: string;
  wallet: string;
  api_key: string;
  activa: boolean;
  created_at: string;
}

export interface Validator {
  id: string;
  nombre: string;
  wallet: string;
  activo: boolean;
  registros_validados: number;
}

export type NoncePurpose = 'login' | 'validate_record' | 'observe_record';

export interface AuthChallenge {
  nonce: string;
  wallet: string;
  purpose: NoncePurpose;
  message: string;
  expires_at: string;
}

function mapAuditRecord(row: typeof auditRecords.$inferSelect): AuditRecord {
  return {
    id: row.id,
    on_chain_id: row.on_chain_id ?? 0,
    record_hash: row.record_hash,
    municipio_id: row.municipio_id,
    tipo_gasto: row.tipo_gasto as SpendType,
    monto: Number(row.monto),
    moneda: row.moneda,
    descripcion: row.descripcion,
    fecha_gasto: row.fecha_gasto,
    fecha_registro: row.fecha_registro,
    periodo_gestion: row.periodo_gestion,
    estado: row.estado as RecordStatus,
    avalista_id: row.avalista_id,
    motivo_observacion: row.motivo_observacion,
    ipfs_cid: row.ipfs_cid,
    tx_hash: row.tx_hash,
    metadata: row.metadata ?? {},
  };
}

function mapAuthChallenge(row: typeof authNonces.$inferSelect): AuthChallenge {
  return {
    nonce: row.nonce,
    wallet: row.wallet,
    purpose: row.purpose as NoncePurpose,
    message: row.message,
    expires_at: row.expires_at,
  };
}

export interface ListRecordFilters {
  municipio?: string;
  estado?: string;
  tipo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  page: number;
  limit: number;
}

export async function listRecords(
  filters: ListRecordFilters
): Promise<{ data: AuditRecord[]; total: number }> {
  const conditions = [];

  if (filters.municipio) {
    conditions.push(eq(auditRecords.municipio_id, filters.municipio));
  }
  if (filters.estado) {
    conditions.push(eq(auditRecords.estado, filters.estado as RecordStatus));
  }
  if (filters.tipo) {
    conditions.push(eq(auditRecords.tipo_gasto, filters.tipo as SpendType));
  }
  if (filters.fecha_desde) {
    conditions.push(gte(auditRecords.fecha_gasto, filters.fecha_desde));
  }
  if (filters.fecha_hasta) {
    conditions.push(lte(auditRecords.fecha_gasto, filters.fecha_hasta));
  }
  if (typeof filters.monto_min === 'number' && Number.isFinite(filters.monto_min)) {
    conditions.push(gte(auditRecords.monto, filters.monto_min.toFixed(2)));
  }
  if (typeof filters.monto_max === 'number' && Number.isFinite(filters.monto_max)) {
    conditions.push(lte(auditRecords.monto, filters.monto_max.toFixed(2)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalRows = await db
    .select({ total: count() })
    .from(auditRecords)
    .where(whereClause);

  const rows = await db
    .select()
    .from(auditRecords)
    .where(whereClause)
    .orderBy(desc(auditRecords.fecha_registro))
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit);

  return {
    data: rows.map((row) => mapAuditRecord(row)),
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function getRecordById(id: string): Promise<AuditRecord | undefined> {
  const rows = await db.select().from(auditRecords).where(eq(auditRecords.id, id)).limit(1);
  const row = rows[0];
  if (!row) {
    return undefined;
  }
  return mapAuditRecord(row);
}

export async function createRecord(
  data: Omit<AuditRecord, 'id' | 'on_chain_id' | 'fecha_registro'>
): Promise<AuditRecord> {
  const id = crypto.randomUUID();
  const rows = await db
    .insert(auditRecords)
    .values({
      id,
      record_hash: data.record_hash,
      municipio_id: data.municipio_id,
      tipo_gasto: data.tipo_gasto,
      monto: data.monto.toFixed(2),
      moneda: data.moneda,
      descripcion: data.descripcion,
      fecha_gasto: data.fecha_gasto,
      periodo_gestion: data.periodo_gestion,
      estado: data.estado,
      avalista_id: data.avalista_id,
      motivo_observacion: data.motivo_observacion,
      ipfs_cid: data.ipfs_cid,
      tx_hash: data.tx_hash,
      metadata: data.metadata ?? {},
    })
    .returning();

  return mapAuditRecord(rows[0]);
}

export async function attachRecordDocument(id: string, cid: string): Promise<AuditRecord | undefined> {
  const rows = await db
    .update(auditRecords)
    .set({ ipfs_cid: cid })
    .where(eq(auditRecords.id, id))
    .returning();
  const row = rows[0];
  if (!row) {
    return undefined;
  }
  return mapAuditRecord(row);
}

export async function validateRecord(id: string, validatorId: string): Promise<AuditRecord | undefined> {
  const rows = await db.transaction(async (tx) => {
    const updated = await tx
      .update(auditRecords)
      .set({
        estado: 'VALIDADO',
        avalista_id: validatorId,
        motivo_observacion: null,
      })
      .where(eq(auditRecords.id, id))
      .returning();

    if (!updated[0]) {
      return [];
    }

    await tx
      .update(validators)
      .set({
        registros_validados: sql`${validators.registros_validados} + 1`,
      })
      .where(eq(validators.id, validatorId));

    return updated;
  });

  const row = rows[0];
  if (!row) {
    return undefined;
  }
  return mapAuditRecord(row);
}

export async function observeRecord(
  id: string,
  validatorId: string,
  motivo: string
): Promise<AuditRecord | undefined> {
  const rows = await db
    .update(auditRecords)
    .set({
      estado: 'OBSERVADO',
      avalista_id: validatorId,
      motivo_observacion: motivo,
    })
    .where(eq(auditRecords.id, id))
    .returning();
  const row = rows[0];
  if (!row) {
    return undefined;
  }
  return mapAuditRecord(row);
}

export async function findMunicipalityByApiKey(apiKey: string): Promise<Municipality | undefined> {
  const rows = await db
    .select()
    .from(municipalities)
    .where(and(eq(municipalities.api_key, apiKey), eq(municipalities.activa, true)))
    .limit(1);
  return rows[0] as Municipality | undefined;
}

export async function getMunicipalityById(id: string): Promise<Municipality | undefined> {
  const rows = await db.select().from(municipalities).where(eq(municipalities.id, id)).limit(1);
  return rows[0] as Municipality | undefined;
}

export async function listMunicipalities(): Promise<Municipality[]> {
  const rows = await db.select().from(municipalities).orderBy(asc(municipalities.nombre));
  return rows as Municipality[];
}

export async function listRecordsByMunicipality(municipioId: string): Promise<AuditRecord[]> {
  const rows = await db
    .select()
    .from(auditRecords)
    .where(eq(auditRecords.municipio_id, municipioId))
    .orderBy(desc(auditRecords.fecha_registro));
  return rows.map((row) => mapAuditRecord(row));
}

export async function listValidators(): Promise<Validator[]> {
  const rows = await db.select().from(validators).orderBy(asc(validators.nombre));
  return rows as Validator[];
}

export async function findValidatorByWallet(wallet: string): Promise<Validator | undefined> {
  const rows = await db
    .select()
    .from(validators)
    .where(and(sql`LOWER(${validators.wallet}) = LOWER(${wallet})`, eq(validators.activo, true)))
    .limit(1);
  return rows[0] as Validator | undefined;
}

export async function createAuthChallenge(
  wallet: string,
  purpose: NoncePurpose,
  message: string,
  ttlMinutes = 10
): Promise<AuthChallenge> {
  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  const rows = await db
    .insert(authNonces)
    .values({
      nonce,
      wallet,
      purpose,
      message,
      expires_at: expiresAt,
    })
    .returning();
  return mapAuthChallenge(rows[0]);
}

export async function consumeAuthChallenge(
  wallet: string,
  purpose: NoncePurpose,
  nonce: string
): Promise<AuthChallenge | undefined> {
  const now = new Date().toISOString();
  const rows = await db
    .update(authNonces)
    .set({
      consumed_at: now,
    })
    .where(
      and(
        eq(authNonces.wallet, wallet),
        eq(authNonces.purpose, purpose),
        eq(authNonces.nonce, nonce),
        isNull(authNonces.consumed_at),
        gt(authNonces.expires_at, now)
      )
    )
    .returning();
  const row = rows[0];
  if (!row) {
    return undefined;
  }
  return mapAuthChallenge(row);
}
