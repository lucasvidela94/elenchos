import { useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  ExternalLink,
  ChevronRight,
  Database,
  TrendingUp,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  attachRecordDocument,
  createRecord,
  fetchMunicipalityStats,
  fetchRecords,
  type BackendSpendType,
} from '../lib/api';

function getErrorMessage(error: unknown): string {
  const apiMessage = (error as { response?: { data?: { error?: { message?: string } } } })?.response
    ?.data?.error?.message;
  if (apiMessage) {
    return apiMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrio un error inesperado';
}

export default function MunicipalityDashboard() {
  const queryClient = useQueryClient();
  const municipalityId = 'muni-1';

  const [showNewRegistry, setShowNewRegistry] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('municipalityApiKey') ?? 'demo-muni-api-key');
  const [tipoGasto, setTipoGasto] = useState<'' | Lowercase<BackendSpendType>>('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaGasto, setFechaGasto] = useState(() => new Date().toISOString().slice(0, 10));
  const [moneda, setMoneda] = useState('ARS');
  const [periodoGestion, setPeriodoGestion] = useState('2023-2027');
  const [cid, setCid] = useState('');
  const [actionError, setActionError] = useState('');

  const statsQuery = useQuery({
    queryKey: ['municipality-stats', municipalityId],
    queryFn: () => fetchMunicipalityStats(municipalityId),
  });

  const recordsQuery = useQuery({
    queryKey: ['municipality-records', municipalityId],
    queryFn: () => fetchRecords({ municipio: municipalityId, page: 1, limit: 20 }),
  });

  const createRecordMutation = useMutation({
    mutationFn: createRecord,
    onSuccess: async (created) => {
      if (cid.trim()) {
        await attachRecordDocumentMutation.mutateAsync({
          apiKey,
          recordId: created.data.id,
          cid: cid.trim(),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['municipality-stats', municipalityId] });
      await queryClient.invalidateQueries({ queryKey: ['municipality-records', municipalityId] });
    },
  });

  const attachRecordDocumentMutation = useMutation({
    mutationFn: attachRecordDocument,
  });

  const isBusy = createRecordMutation.isPending || attachRecordDocumentMutation.isPending;

  const statsData = statsQuery.data?.data;
  const records = recordsQuery.data?.data ?? [];

  const stats = [
    {
      icon: Database,
      value: String(statsData?.total_registros ?? 0),
      label: 'Total',
      color: 'neon-cyan',
      bg: 'bg-neon-cyan/10',
    },
    {
      icon: Clock,
      value: String(statsData?.por_estado.PENDIENTE ?? 0),
      label: 'Pendientes',
      color: 'warning',
      bg: 'bg-warning/10',
    },
    {
      icon: CheckCircle,
      value: String(statsData?.por_estado.VALIDADO ?? 0),
      label: 'Validados',
      color: 'success',
      bg: 'bg-success/10',
    },
    {
      icon: XCircle,
      value: String(statsData?.por_estado.OBSERVADO ?? 0),
      label: 'Observados',
      color: 'danger',
      bg: 'bg-danger/10',
    },
  ];

  const recentRecords = useMemo(
    () =>
      records.map((record) => ({
        id: record.id,
        type: record.tipo_gasto,
        amount: record.monto,
        status:
          record.estado === 'VALIDADO'
            ? 'validated'
            : record.estado === 'OBSERVADO'
              ? 'observed'
              : 'pending',
        date: record.fecha_gasto,
      })),
    [records]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <span className="badge-success">Validado</span>;
      case 'pending':
        return <span className="badge-warning">Pendiente</span>;
      case 'observed':
        return <span className="badge-danger">Observado</span>;
      default:
        return null;
    }
  };

  const handleCreateRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError('');

    if (!tipoGasto) {
      setActionError('Selecciona un tipo de gasto.');
      return;
    }
    if (!monto || Number(monto) <= 0) {
      setActionError('Ingresa un monto valido.');
      return;
    }
    if (!descripcion.trim()) {
      setActionError('Ingresa una descripcion.');
      return;
    }
    if (!apiKey.trim()) {
      setActionError('Ingresa una API Key.');
      return;
    }

    localStorage.setItem('municipalityApiKey', apiKey);

    const mapType: Record<Lowercase<BackendSpendType>, BackendSpendType> = {
      personal: 'PERSONAL',
      obra: 'OBRA',
      servicio: 'SERVICIO',
      subsidio: 'SUBSIDIO',
      otro: 'OTRO',
    };

    try {
      await createRecordMutation.mutateAsync({
        apiKey: apiKey.trim(),
        tipo_gasto: mapType[tipoGasto],
        monto: Number(monto),
        moneda: moneda.trim().toUpperCase(),
        descripcion: descripcion.trim(),
        fecha_gasto: fechaGasto,
        periodo_gestion: periodoGestion.trim(),
      });

      setShowNewRegistry(false);
      setTipoGasto('');
      setMonto('');
      setDescripcion('');
      setCid('');
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
        <div>
          <span className="section-label mb-3 block">Panel</span>
          <h1 className="text-title font-display text-white mb-2">Municipio</h1>
          <p className="text-white/50 font-body">
            Gestiona tus registros municipales y documentos respaldatorios.
          </p>
          <div className="mt-4 max-w-md">
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">API Key</label>
            <input
              type="text"
              className="input-glass"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="demo-muni-api-key"
            />
          </div>
          {actionError ? <p className="text-sm text-danger mt-3">{actionError}</p> : null}
        </div>

        <button className="btn-primary" onClick={() => setShowNewRegistry(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Registro
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up stagger-1">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-5 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon
                  className="h-5 w-5"
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
              </div>
              <div>
                <p className="text-2xl font-display text-white font-bold">{stat.value}</p>
                <p className="text-xs text-white/40 font-mono uppercase">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 animate-slide-up stagger-2">
        <div className="md:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider">
              Actividad Mensual
            </h2>
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">{statsData ? 'Actualizado' : 'Sin datos'}</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-32">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-neon-cyan/20 rounded-t-lg hover:bg-neon-cyan/40 transition-colors cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-void-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {height}
                  </div>
                </div>
                <span className="text-[10px] text-white/30 font-mono">
                  {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider mb-6">
            Distribución
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Obra Pública', value: statsData?.por_tipo.OBRA ?? 0, color: 'bg-neon-cyan' },
              { label: 'Personal', value: statsData?.por_tipo.PERSONAL ?? 0, color: 'bg-neon-magenta' },
              { label: 'Servicios', value: statsData?.por_tipo.SERVICIO ?? 0, color: 'bg-success' },
              {
                label: 'Otros',
                value: (statsData?.por_tipo.SUBSIDIO ?? 0) + (statsData?.por_tipo.OTRO ?? 0),
                color: 'bg-warning',
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white font-mono">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden animate-slide-up stagger-3">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider">
            Registros Recientes
          </h2>
          <button className="text-xs text-neon-cyan hover:text-neon-cyan/80 font-mono flex items-center gap-1">
            Ver todos
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {recordsQuery.isLoading ? (
          <div className="py-10 px-6 text-white/50">Cargando registros...</div>
        ) : recentRecords.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
              <FileText className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/60 font-body mb-1">No hay registros recientes</p>
            <p className="text-sm text-white/30 font-body">
              Comienza creando tu primer registro municipal.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="px-6 py-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white font-body">{record.type}</p>
                    <p className="text-xs text-white/40 font-mono">{record.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-white font-mono">${record.amount.toLocaleString()} ARS</p>
                  {getStatusBadge(record.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 animate-slide-up stagger-4">
        <div className="glass-card p-6 border-l-4 border-l-warning">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Hash className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-body mb-2">
                Proceso de Registro
              </h3>
              <ol className="text-sm text-white/50 font-body space-y-2 list-decimal list-inside">
                <li>Completa los datos del gasto</li>
                <li>Adjunta CID de documento respaldatorio</li>
                <li>El sistema genera el hash SHA-256</li>
                <li>Espera validación del avalista</li>
                <li>El hash se ancla en blockchain</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-neon-cyan">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-body mb-2">
                API de Integración
              </h3>
              <p className="text-sm text-white/50 font-body mb-4">
                Automatiza el registro desde tus sistemas existentes usando nuestra API REST.
              </p>
              <button className="text-sm text-neon-cyan hover:text-neon-cyan/80 font-medium font-body transition-colors flex items-center gap-1">
                Ver documentación
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNewRegistry && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-xl font-display text-white">Nuevo Registro Municipal</h2>
              <button
                onClick={() => setShowNewRegistry(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleCreateRecord}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                    Tipo de Gasto
                  </label>
                  <select
                    className="input-glass"
                    value={tipoGasto}
                    onChange={(e) => setTipoGasto(e.target.value as typeof tipoGasto)}
                  >
                    <option value="" className="bg-void-800">
                      Seleccionar tipo...
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
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                    Monto
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      className="input-glass pl-8"
                      placeholder="0.00"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">Moneda</label>
                  <input
                    type="text"
                    className="input-glass"
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">Fecha</label>
                  <input
                    type="date"
                    className="input-glass"
                    value={fechaGasto}
                    onChange={(e) => setFechaGasto(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                    Periodo de gestion
                  </label>
                  <input
                    type="text"
                    className="input-glass"
                    value={periodoGestion}
                    onChange={(e) => setPeriodoGestion(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                  Descripción
                </label>
                <textarea
                  className="input-glass"
                  rows={3}
                  placeholder="Describe el gasto de manera clara y detallada..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                  CID del documento (opcional)
                </label>
                <input
                  type="text"
                  className="input-glass"
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                  placeholder="bafy..."
                />
              </div>

              <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl p-4 flex items-start gap-3">
                <Hash className="h-5 w-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 font-body">
                  <strong className="text-white">Hash SHA-256:</strong> Se generará automáticamente
                  al enviar el registro.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNewRegistry(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isBusy}>
                  {isBusy ? 'Enviando...' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
