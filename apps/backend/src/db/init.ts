import { pool } from './pool.js';

export async function initDatabase(): Promise<void> {
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE spend_type AS ENUM ('PERSONAL', 'OBRA', 'SERVICIO', 'SUBSIDIO', 'OTRO');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE record_status AS ENUM ('PENDIENTE', 'VALIDADO', 'OBSERVADO');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS municipalities (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      wallet TEXT NOT NULL UNIQUE,
      api_key TEXT NOT NULL UNIQUE,
      activa BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS validators (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      wallet TEXT NOT NULL UNIQUE,
      activo BOOLEAN NOT NULL DEFAULT TRUE,
      registros_validados INTEGER NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_records (
      id TEXT PRIMARY KEY,
      on_chain_id BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
      record_hash TEXT NOT NULL,
      municipio_id TEXT NOT NULL REFERENCES municipalities(id),
      tipo_gasto spend_type NOT NULL,
      monto NUMERIC(18,2) NOT NULL,
      moneda VARCHAR(3) NOT NULL,
      descripcion TEXT NOT NULL,
      fecha_gasto DATE NOT NULL,
      fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      periodo_gestion VARCHAR(20) NOT NULL,
      estado record_status NOT NULL,
      avalista_id TEXT REFERENCES validators(id),
      motivo_observacion TEXT,
      ipfs_cid TEXT,
      tx_hash TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_nonces (
      nonce TEXT PRIMARY KEY,
      wallet TEXT NOT NULL,
      purpose TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_records_municipio_id ON audit_records(municipio_id);
    CREATE INDEX IF NOT EXISTS idx_audit_records_estado ON audit_records(estado);
    CREATE INDEX IF NOT EXISTS idx_audit_records_tipo_gasto ON audit_records(tipo_gasto);
    CREATE INDEX IF NOT EXISTS idx_audit_records_fecha_gasto ON audit_records(fecha_gasto);
    CREATE INDEX IF NOT EXISTS idx_auth_nonces_wallet_purpose ON auth_nonces(wallet, purpose);
  `);

  await pool.query(`
    INSERT INTO municipalities (id, nombre, wallet, api_key, activa)
    VALUES ('muni-1', 'Municipio Demo Norte', '0x1111111111111111111111111111111111111111', 'demo-muni-api-key', TRUE)
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO validators (id, nombre, wallet, activo, registros_validados)
    VALUES ('val-1', 'Tribunal de Cuentas Demo', '0x2222222222222222222222222222222222222222', TRUE, 0)
    ON CONFLICT (id) DO NOTHING;
  `);
}
