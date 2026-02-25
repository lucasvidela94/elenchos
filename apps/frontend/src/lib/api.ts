import axios from 'axios';

export type BackendRecordStatus = 'PENDIENTE' | 'VALIDADO' | 'OBSERVADO';
export type BackendSpendType = 'PERSONAL' | 'OBRA' | 'SERVICIO' | 'SUBSIDIO' | 'OTRO';

export interface BackendAuditRecord {
  id: string;
  on_chain_id: number;
  record_hash: string;
  municipio_id: string;
  tipo_gasto: BackendSpendType;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha_gasto: string;
  fecha_registro: string;
  periodo_gestion: string;
  estado: BackendRecordStatus;
  avalista_id: string | null;
  motivo_observacion: string | null;
  ipfs_cid: string | null;
  tx_hash: string;
  metadata: Record<string, unknown>;
}

export interface RecordsListResponse {
  data: BackendAuditRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChallengeResponse {
  data: {
    wallet: string;
    purpose: 'login' | 'validate_record' | 'observe_record';
    nonce: string;
    message: string;
    expires_at: string;
  };
}

export interface LoginResponse {
  data: {
    token: string;
  };
}

export interface RecordMutationResponse {
  data: BackendAuditRecord;
}

export interface MunicipalityStatsResponse {
  data: {
    municipio: {
      id: string;
      nombre: string;
    };
    total_registros: number;
    monto_total: number;
    por_tipo: Record<BackendSpendType, number>;
    por_estado: Record<BackendRecordStatus, number>;
    timeline: Record<string, number>;
  };
}

export interface ListRecordsParams {
  municipio?: string;
  estado?: BackendRecordStatus;
  tipo?: BackendSpendType;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  page?: number;
  limit?: number;
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

export async function fetchRecords(params: ListRecordsParams): Promise<RecordsListResponse> {
  const response = await api.get<RecordsListResponse>('/records', { params });
  return response.data;
}

export async function createChallenge(input: {
  wallet: string;
  purpose: 'login' | 'validate_record' | 'observe_record';
}): Promise<ChallengeResponse> {
  const response = await api.post<ChallengeResponse>('/auth/challenge', input);
  return response.data;
}

export async function loginWithSignature(input: {
  wallet: string;
  nonce: string;
  signature: string;
}): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', input);
  return response.data;
}

export async function validateRecord(input: {
  id: string;
  wallet: string;
  nonce: string;
  signature: string;
}): Promise<RecordMutationResponse> {
  const response = await api.post<RecordMutationResponse>(`/records/${input.id}/validate`, {
    wallet: input.wallet,
    nonce: input.nonce,
    signature: input.signature,
  });
  return response.data;
}

export async function observeRecord(input: {
  id: string;
  wallet: string;
  nonce: string;
  signature: string;
  motivo: string;
}): Promise<RecordMutationResponse> {
  const response = await api.post<RecordMutationResponse>(`/records/${input.id}/observe`, {
    wallet: input.wallet,
    nonce: input.nonce,
    signature: input.signature,
    motivo: input.motivo,
  });
  return response.data;
}

export async function fetchMunicipalityStats(municipalityId: string): Promise<MunicipalityStatsResponse> {
  const response = await api.get<MunicipalityStatsResponse>(`/municipios/${municipalityId}/stats`);
  return response.data;
}

export async function createRecord(input: {
  apiKey: string;
  tipo_gasto: BackendSpendType;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha_gasto: string;
  periodo_gestion: string;
  metadata?: Record<string, unknown>;
}): Promise<RecordMutationResponse> {
  const response = await api.post<RecordMutationResponse>(
    '/records',
    {
      tipo_gasto: input.tipo_gasto,
      monto: input.monto,
      moneda: input.moneda,
      descripcion: input.descripcion,
      fecha_gasto: input.fecha_gasto,
      periodo_gestion: input.periodo_gestion,
      metadata: input.metadata ?? {},
    },
    {
      headers: {
        'x-api-key': input.apiKey,
      },
    }
  );
  return response.data;
}

export async function attachRecordDocument(input: {
  apiKey: string;
  recordId: string;
  cid: string;
}): Promise<RecordMutationResponse> {
  const response = await api.post<RecordMutationResponse>(
    `/records/${input.recordId}/document`,
    {
      cid: input.cid,
    },
    {
      headers: {
        'x-api-key': input.apiKey,
      },
    }
  );
  return response.data;
}
