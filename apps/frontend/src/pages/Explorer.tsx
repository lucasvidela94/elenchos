import { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  ArrowRight,
  Database,
  Shield,
  Clock,
  Hash,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useExplorerStats, useRecords, type ExplorerFilters } from '../hooks/useRecords';
import type { BackendAuditRecord } from '../lib/api';

interface Record {
  id: string;
  hash: string;
  municipality: string;
  type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'validated' | 'observed';
  date: string;
  validator?: string;
}

const statusConfig = {
  validated: { label: 'Validado', color: 'success', icon: Shield },
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  observed: { label: 'Observado', color: 'danger', icon: Eye },
};

export default function Explorer() {
  const [filters, setFilters] = useState<ExplorerFilters>({
    municipality: '',
    type: '',
    status: '',
    startDate: '',
  });
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const recordsQuery = useRecords(filters);
  const loading = recordsQuery.isLoading || recordsQuery.isFetching;

  const records = useMemo<Record[]>(() => {
    const data = recordsQuery.data?.data ?? [];

    return data.map((record: BackendAuditRecord) => {
      const status =
        record.estado === 'VALIDADO'
          ? 'validated'
          : record.estado === 'OBSERVADO'
            ? 'observed'
            : 'pending';

      return {
        id: record.id,
        hash: record.record_hash,
        municipality: record.municipio_id,
        type: record.tipo_gasto,
        amount: record.monto,
        currency: record.moneda,
        status,
        date: record.fecha_gasto,
        validator: record.avalista_id ?? undefined,
      };
    });
  }, [recordsQuery.data]);

  const stats = useExplorerStats(recordsQuery.data?.data ?? []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <span className="section-label mb-4 block">Explorador</span>
        <h1 className="text-title font-display text-white mb-4">Registros públicos</h1>
        <p className="text-white/50 max-w-xl font-body">
          Examina y verifica los gastos públicos registrados en blockchain. Sin autenticación. Sin
          barreras.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up stagger-1">
        {[
          {
            label: 'Total Registros',
            value: stats.total.toString(),
            icon: Database,
            color: 'neon-cyan',
          },
          { label: 'Validados', value: stats.validated.toString(), icon: Shield, color: 'success' },
          { label: 'Pendientes', value: stats.pending.toString(), icon: Clock, color: 'warning' },
          { label: 'Observados', value: stats.observed.toString(), icon: Eye, color: 'danger' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon
                className={`h-5 w-5 text-${stat.color}`}
                style={{
                  color:
                    stat.color === 'neon-cyan'
                      ? '#00f0ff'
                      : stat.color === 'success'
                        ? '#00ff88'
                        : stat.color === 'warning'
                          ? '#ffaa00'
                          : '#ff4444',
                }}
              />
              <span className="text-xs font-mono text-white/30 uppercase">{stat.label}</span>
            </div>
            <p className="text-2xl font-display text-white font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-6 animate-slide-up stagger-2">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-neon-cyan" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.15em] text-white/60">
            Filtros de búsqueda
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">
              Municipio
            </label>
            <input
              type="text"
              className="input-glass"
              placeholder="Buscar municipio..."
              value={filters.municipality}
              onChange={(e) => setFilters({ ...filters, municipality: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">
              Tipo de Gasto
            </label>
            <div className="relative">
              <select
                className="input-glass appearance-none cursor-pointer"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value as ExplorerFilters['type'] })
                }
              >
                <option value="" className="bg-void-800">
                  Todos los tipos
                </option>
                <option value="personal" className="bg-void-800">
                  Personal
                </option>
                <option value="obra" className="bg-void-800">
                  Obra Pública
                </option>
                <option value="servicio" className="bg-void-800">
                  Servicios
                </option>
                <option value="subsidio" className="bg-void-800">
                  Subsidios
                </option>
                <option value="otro" className="bg-void-800">
                  Otros
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Estado</label>
            <div className="relative">
              <select
                className="input-glass appearance-none cursor-pointer"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as ExplorerFilters['status'] })
                }
              >
                <option value="" className="bg-void-800">
                  Todos
                </option>
                <option value="pending" className="bg-void-800">
                  Pendiente
                </option>
                <option value="validated" className="bg-void-800">
                  Validado
                </option>
                <option value="observed" className="bg-void-800">
                  Observado
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Desde</label>
            <input
              type="date"
              className="input-glass"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.06] flex justify-between items-center">
          <p className="text-sm text-white/40 font-mono">
            {loading ? 'Cargando...' : `Mostrando ${records.length} registros`}
          </p>
          <button className="btn-primary text-sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card overflow-hidden animate-slide-up stagger-3">
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider">
            Resultados
          </h2>
          <div className="flex gap-2">
            <span className="badge-warning">{stats.pending} Pendientes</span>
            <span className="badge-success">{stats.validated} Validados</span>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {recordsQuery.isError ? (
            <div className="py-10 px-6">
              <p className="text-danger font-body">No se pudieron cargar los registros.</p>
            </div>
          ) : null}
          {records.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <Database className="h-8 w-8 text-white/20" />
              </div>
              <p className="text-white/60 font-body mb-1">No se encontraron registros</p>
              <p className="text-sm text-white/30 font-body">
                Los registros aparecerán aquí cuando estén disponibles
              </p>
            </div>
          ) : (
            records.map((record, index) => {
              const status = statusConfig[record.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedRecord === record.id;

              return (
                <div
                  key={record.id}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className="px-6 py-5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            record.status === 'validated'
                              ? 'bg-success/10'
                              : record.status === 'pending'
                                ? 'bg-warning/10'
                                : 'bg-danger/10'
                          }`}
                        >
                          <StatusIcon
                            className={`h-5 w-5 ${
                              record.status === 'validated'
                                ? 'text-success'
                                : record.status === 'pending'
                                  ? 'text-warning'
                                  : 'text-danger'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-white font-semibold font-body">
                            {record.municipality}
                          </p>
                          <p className="text-xs text-white/40 font-mono mt-0.5">{record.type}</p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-white font-mono font-semibold">
                            ${record.amount.toLocaleString()} {record.currency}
                          </p>
                          <p className="text-xs text-white/40 font-mono">{record.date}</p>
                        </div>
                        <div className={`badge-${status.color}`}>{status.label}</div>
                        <ChevronDown
                          className={`h-5 w-5 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <div className="pt-4 border-t border-white/[0.06] grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-mono text-white/40 uppercase mb-1">
                              Hash SHA-256
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-void-800 rounded-lg border border-white/[0.06]">
                              <Hash className="h-4 w-4 text-neon-cyan" />
                              <span className="font-mono text-xs text-white/60 truncate">
                                {record.hash}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-white/40 uppercase mb-1">
                              Fecha de Registro
                            </p>
                            <p className="text-white font-body">{record.date}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-mono text-white/40 uppercase mb-1">
                              Avalista
                            </p>
                            <p className="text-white font-body">
                              {record.validator || 'Pendiente de validación'}
                            </p>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button className="btn-secondary text-xs flex-1">
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              Ver detalles
                            </button>
                            <button className="btn-glow text-xs flex-1">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Ver en Polygon
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card p-6 border-l-4 border-l-neon-cyan animate-slide-up stagger-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-body mb-2">
              ¿Cómo verificar un registro?
            </h3>
            <p className="text-sm text-white/50 font-body leading-relaxed">
              Cada registro tiene un hash único (SHA-256) verificable directamente en la blockchain
              de Polygon. Haz clic en cualquier registro para ver su prueba de inmutabilidad o usa
              el botón "Ver en Polygon" para comprobarlo en el explorador oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
