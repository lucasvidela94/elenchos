import { useMemo, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Clock,
  Eye,
  Scale,
  Search,
  Filter,
  FileText,
} from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createChallenge, fetchRecords, loginWithSignature, observeRecord, validateRecord } from '../lib/api';

type UiRecord = {
  id: string;
  municipality: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  validator?: string;
  observation?: string;
  action?: 'validated' | 'observed';
};

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

export default function ValidatorDashboard() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const [selectedRecord, setSelectedRecord] = useState<UiRecord | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showObserveModal, setShowObserveModal] = useState(false);
  const [observationText, setObservationText] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('validatorToken') ?? '');
  const [actionError, setActionError] = useState('');

  const recordsQuery = useQuery({
    queryKey: ['validator-records'],
    queryFn: () => fetchRecords({ page: 1, limit: 200 }),
  });

  const challengeMutation = useMutation({
    mutationFn: createChallenge,
  });

  const loginMutation = useMutation({
    mutationFn: loginWithSignature,
    onSuccess: (data) => {
      localStorage.setItem('validatorToken', data.data.token);
      setAuthToken(data.data.token);
    },
  });

  const validateMutation = useMutation({
    mutationFn: validateRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['validator-records'] });
    },
  });

  const observeMutation = useMutation({
    mutationFn: observeRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['validator-records'] });
    },
  });

  const uiRecords = useMemo<UiRecord[]>(() => {
    const rows = recordsQuery.data?.data ?? [];
    return rows.map((row) => ({
      id: row.id,
      municipality: row.municipio_id,
      type: row.tipo_gasto,
      amount: row.monto,
      date: row.fecha_gasto,
      description: row.descripcion,
      validator: row.avalista_id ?? undefined,
      observation: row.motivo_observacion ?? undefined,
      action: row.estado === 'VALIDADO' ? 'validated' : row.estado === 'OBSERVADO' ? 'observed' : undefined,
    }));
  }, [recordsQuery.data]);

  const pendingRecords = useMemo(
    () => uiRecords.filter((record) => record.action === undefined),
    [uiRecords]
  );
  const validationHistory = useMemo(
    () => uiRecords.filter((record) => record.action !== undefined),
    [uiRecords]
  );

  const stats = [
    {
      icon: Clock,
      value: pendingRecords.length.toString(),
      label: 'Pendientes',
      color: 'warning',
      bg: 'bg-warning/10',
    },
    {
      icon: CheckCircle,
      value: validationHistory.filter((record) => record.action === 'validated').length.toString(),
      label: 'Validados',
      color: 'success',
      bg: 'bg-success/10',
    },
    {
      icon: XCircle,
      value: validationHistory.filter((record) => record.action === 'observed').length.toString(),
      label: 'Observados',
      color: 'danger',
      bg: 'bg-danger/10',
    },
  ];

  const isBusy =
    challengeMutation.isPending ||
    loginMutation.isPending ||
    validateMutation.isPending ||
    observeMutation.isPending;

  const handleWalletLogin = async () => {
    if (!address || !isConnected) {
      setActionError('Conecta una wallet para iniciar sesion.');
      return;
    }
    setActionError('');
    try {
      const challenge = await challengeMutation.mutateAsync({
        wallet: address,
        purpose: 'login',
      });
      const signature = await signMessageAsync({ message: challenge.data.message });
      await loginMutation.mutateAsync({
        wallet: address,
        nonce: challenge.data.nonce,
        signature,
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleValidate = async () => {
    if (!selectedRecord?.id || !address || !isConnected) {
      setActionError('Conecta una wallet para validar.');
      return;
    }
    setActionError('');
    try {
      const challenge = await challengeMutation.mutateAsync({
        wallet: address,
        purpose: 'validate_record',
      });
      const signature = await signMessageAsync({ message: challenge.data.message });
      await validateMutation.mutateAsync({
        id: selectedRecord.id,
        wallet: address,
        nonce: challenge.data.nonce,
        signature,
      });
      setShowValidateModal(false);
      setSelectedRecord(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleObserve = async () => {
    if (!selectedRecord?.id || !address || !isConnected) {
      setActionError('Conecta una wallet para observar.');
      return;
    }
    if (!observationText.trim()) {
      setActionError('Debes ingresar un motivo de observacion.');
      return;
    }
    setActionError('');
    try {
      const challenge = await challengeMutation.mutateAsync({
        wallet: address,
        purpose: 'observe_record',
      });
      const signature = await signMessageAsync({ message: challenge.data.message });
      await observeMutation.mutateAsync({
        id: selectedRecord.id,
        wallet: address,
        nonce: challenge.data.nonce,
        signature,
        motivo: observationText.trim(),
      });
      setShowObserveModal(false);
      setObservationText('');
      setSelectedRecord(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <span className="section-label mb-3 block">Panel</span>
        <h1 className="text-title font-display text-white mb-2">Avalista</h1>
        <p className="text-white/50 font-body">
          Examina, valida y refuta registros municipales. Tu firma es el sello de legitimidad.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-primary text-sm" onClick={handleWalletLogin} disabled={isBusy}>
            {loginMutation.isPending ? 'Firmando...' : authToken ? 'Sesion activa' : 'Iniciar sesion con wallet'}
          </button>
          {address ? <span className="text-xs font-mono text-white/40">{address}</span> : null}
        </div>
        {actionError ? <p className="text-sm text-danger mt-3">{actionError}</p> : null}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 animate-slide-up stagger-1">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon
                  className={`h-5 w-5`}
                  style={{
                    color:
                      stat.color === 'success'
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

      {/* Pending Queue */}
      <div className="glass-card overflow-hidden animate-slide-up stagger-2">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider">
              Cola de Validación
            </h2>
            <span className="badge-warning">{pendingRecords.length} pendientes</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Search className="h-4 w-4 text-white/60" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Filter className="h-4 w-4 text-white/60" />
            </button>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className="py-10 px-6 text-white/50">Cargando cola de validacion...</div>
        ) : pendingRecords.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
              <ShieldCheck className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/60 font-body mb-1">No hay registros pendientes</p>
            <p className="text-sm text-white/30 font-body">
              Los registros pendientes aparecerán aquí para su examen.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {pendingRecords.map((record) => (
              <div key={record.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-white font-body font-semibold">{record.municipality}</p>
                      <p className="text-sm text-white/60 mt-1">{record.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-mono text-white/40">{record.type}</span>
                        <span className="text-xs font-mono text-neon-cyan">
                          ${record.amount.toLocaleString()} ARS
                        </span>
                        <span className="text-xs font-mono text-white/40">{record.date}</span>
                        <span className="text-xs font-mono text-white/40 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          0 docs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn-glow text-xs"
                      disabled={isBusy}
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowValidateModal(true);
                      }}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Validar
                    </button>
                    <button
                      className="btn-secondary text-xs"
                      disabled={isBusy}
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowObserveModal(true);
                      }}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Observar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="glass-card overflow-hidden animate-slide-up stagger-3">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
          <Eye className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider">
            Historial de Validaciones
          </h2>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {validationHistory.map((record) => (
            <div key={record.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      record.action === 'validated' ? 'bg-success/10' : 'bg-danger/10'
                    }`}
                  >
                    {record.action === 'validated' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-body">{record.municipality}</p>
                    <p className="text-xs text-white/40 font-mono">
                      {record.type} · ${record.amount.toLocaleString()} ARS
                    </p>
                    {record.observation && (
                      <p className="text-xs text-danger mt-1">Obs: {record.observation}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={record.action === 'validated' ? 'badge-success' : 'badge-danger'}>
                    {record.action === 'validated' ? 'Validado' : 'Observado'}
                  </span>
                  <p className="text-xs text-white/30 font-mono mt-1">{record.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsibility */}
      <div className="glass-card p-6 border-l-4 border-l-success animate-slide-up stagger-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Scale className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-body mb-2">
              Responsabilidad del Avalista
            </h3>
            <p className="text-sm text-white/50 font-body leading-relaxed">
              Como avalista institucional, tu firma es el sello de legitimidad. Al validar un
              registro, certificas que los datos reflejan la realidad. Al observarlo, tu motivo
              quedará público on-chain para siempre. Este es el corazón de Elenchos: la
              verificación, no la fe.
            </p>
          </div>
        </div>
      </div>

      {/* Validate Modal */}
      {showValidateModal && selectedRecord && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-white/[0.06]">
              <h2 className="text-xl font-display text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-success" />
                Validar Registro
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <p className="text-sm text-white/40 font-mono uppercase mb-1">Municipio</p>
                <p className="text-white font-body">{selectedRecord.municipality}</p>
                <p className="text-sm text-white/60 mt-2">{selectedRecord.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                  <span className="text-neon-cyan">
                    ${selectedRecord.amount.toLocaleString()} ARS
                  </span>
                  <span className="text-white/40">{selectedRecord.date}</span>
                </div>
              </div>

              <p className="text-sm text-white/50">
                Al validar este registro, certificas que los datos son veraces y tu firma quedará
                registrada permanentemente en la blockchain.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button className="btn-secondary" onClick={() => setShowValidateModal(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleValidate} disabled={isBusy}>
                  Confirmar Validación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Observe Modal */}
      {showObserveModal && selectedRecord && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-white/[0.06]">
              <h2 className="text-xl font-display text-white flex items-center gap-2">
                <XCircle className="h-6 w-6 text-danger" />
                Observar Registro
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <p className="text-sm text-white/40 font-mono uppercase mb-1">Municipio</p>
                <p className="text-white font-body">{selectedRecord.municipality}</p>
                <p className="text-sm text-white/60 mt-2">{selectedRecord.description}</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                  Motivo de la observación
                </label>
                <textarea
                  className="input-glass"
                  rows={3}
                  placeholder="Describe el motivo de la observación..."
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                />
              </div>

              <p className="text-sm text-white/50">
                La observación quedará registrada permanentemente en la blockchain y será visible
                públicamente.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button className="btn-secondary" onClick={() => setShowObserveModal(false)}>
                  Cancelar
                </button>
                <button
                  className="px-6 py-3 text-sm font-medium rounded-lg bg-danger/10 text-danger border border-danger/30
                           hover:bg-danger/20 transition-colors"
                  onClick={handleObserve}
                  disabled={isBusy}
                >
                  Registrar Observación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
