import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  bigint,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const spendTypeEnum = pgEnum('spend_type', ['PERSONAL', 'OBRA', 'SERVICIO', 'SUBSIDIO', 'OTRO']);
export const recordStatusEnum = pgEnum('record_status', ['PENDIENTE', 'VALIDADO', 'OBSERVADO']);

export const municipalities = pgTable('municipalities', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  wallet: text('wallet').notNull().unique(),
  api_key: text('api_key').notNull().unique(),
  activa: boolean('activa').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

export const validators = pgTable('validators', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  wallet: text('wallet').notNull().unique(),
  activo: boolean('activo').notNull().default(true),
  registros_validados: integer('registros_validados').notNull().default(0),
});

export const auditRecords = pgTable('audit_records', {
  id: text('id').primaryKey(),
  on_chain_id: bigint('on_chain_id', { mode: 'number' }).generatedAlwaysAsIdentity().unique(),
  record_hash: text('record_hash').notNull(),
  municipio_id: text('municipio_id')
    .notNull()
    .references(() => municipalities.id),
  tipo_gasto: spendTypeEnum('tipo_gasto').notNull(),
  monto: numeric('monto', { precision: 18, scale: 2 }).notNull(),
  moneda: varchar('moneda', { length: 3 }).notNull(),
  descripcion: text('descripcion').notNull(),
  fecha_gasto: date('fecha_gasto', { mode: 'string' }).notNull(),
  fecha_registro: timestamp('fecha_registro', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  periodo_gestion: varchar('periodo_gestion', { length: 20 }).notNull(),
  estado: recordStatusEnum('estado').notNull(),
  avalista_id: text('avalista_id').references(() => validators.id),
  motivo_observacion: text('motivo_observacion'),
  ipfs_cid: text('ipfs_cid'),
  tx_hash: text('tx_hash').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
});

export const authNonces = pgTable('auth_nonces', {
  nonce: text('nonce').primaryKey(),
  wallet: text('wallet').notNull(),
  purpose: text('purpose').notNull(),
  message: text('message').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  expires_at: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  consumed_at: timestamp('consumed_at', { withTimezone: true, mode: 'string' }),
});

export const municipalitiesRelations = relations(municipalities, ({ many }) => ({
  records: many(auditRecords),
}));

export const validatorsRelations = relations(validators, ({ many }) => ({
  validatedRecords: many(auditRecords),
}));

export const auditRecordsRelations = relations(auditRecords, ({ one }) => ({
  municipality: one(municipalities, {
    fields: [auditRecords.municipio_id],
    references: [municipalities.id],
  }),
  validator: one(validators, {
    fields: [auditRecords.avalista_id],
    references: [validators.id],
  }),
}));
