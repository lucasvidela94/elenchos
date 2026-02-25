import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecords, type BackendAuditRecord, type BackendRecordStatus, type BackendSpendType } from '../lib/api';

export interface ExplorerFilters {
  municipality: string;
  type: '' | Lowercase<BackendSpendType>;
  status: '' | 'pending' | 'validated' | 'observed';
  startDate: string;
}

const statusToBackend: Record<Exclude<ExplorerFilters['status'], ''>, BackendRecordStatus> = {
  pending: 'PENDIENTE',
  validated: 'VALIDADO',
  observed: 'OBSERVADO',
};

const typeToBackend: Record<Exclude<ExplorerFilters['type'], ''>, BackendSpendType> = {
  personal: 'PERSONAL',
  obra: 'OBRA',
  servicio: 'SERVICIO',
  subsidio: 'SUBSIDIO',
  otro: 'OTRO',
};

export function useRecords(filters: ExplorerFilters) {
  return useQuery({
    queryKey: ['records', filters],
    queryFn: () =>
      fetchRecords({
        municipio: filters.municipality || undefined,
        estado: filters.status ? statusToBackend[filters.status] : undefined,
        tipo: filters.type ? typeToBackend[filters.type] : undefined,
        fecha_desde: filters.startDate || undefined,
        page: 1,
        limit: 50,
      }),
  });
}

export function useExplorerStats(records: BackendAuditRecord[]) {
  return useMemo(() => {
    const validated = records.filter((record) => record.estado === 'VALIDADO').length;
    const pending = records.filter((record) => record.estado === 'PENDIENTE').length;
    const observed = records.filter((record) => record.estado === 'OBSERVADO').length;
    return {
      total: records.length,
      validated,
      pending,
      observed,
    };
  }, [records]);
}
