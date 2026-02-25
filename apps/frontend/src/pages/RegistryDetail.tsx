import { useParams } from 'react-router-dom';
import {
  FileText,
  Clock,
  ExternalLink,
  Hash,
  Building2,
  Calendar,
  Shield,
  Database,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegistryDetail() {
  const { id } = useParams<{ id: string }>();

  // Mock data for demonstration
  const record = {
    id: id || '1',
    hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa5d0e8b8e7c6f5a4b3c2d1e0f',
    municipality: 'Municipio de Rosario',
    type: 'Obra Pública',
    amount: 2500000,
    currency: 'ARS',
    status: 'validated',
    date: '2024-01-15',
    description:
      'Construcción de pavimento en calle San Martín - 5 cuadras de hormigón armado con iluminación LED',
    validator: 'Tribunal de Cuentas de la Provincia',
    validationDate: '2024-01-16',
    txHash: '0x3f8a9c2e4b6d1f5a7c9e0b2d4f6a8c0e2f4a6b8c0d2e4f6a8c0e2f4a6b8c0d2',
    blockNumber: '60234891',
    documents: [
      {
        name: 'Contrato_Obra_2024.pdf',
        size: '2.4 MB',
        cid: 'QmX4z7y8w9v0b1n2m3l4k5j6h7g8f9d0s1a2q3w4e5r6t7y8u9i0o1p2l3k4j5',
      },
      {
        name: 'Factura_Proveedor_A.pdf',
        size: '1.1 MB',
        cid: 'QmY5a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6',
      },
    ],
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'validated':
        return { label: 'Validado', color: 'success', icon: CheckCircle, bg: 'bg-success/10' };
      case 'pending':
        return { label: 'Pendiente', color: 'warning', icon: Clock, bg: 'bg-warning/10' };
      case 'observed':
        return { label: 'Observado', color: 'danger', icon: XCircle, bg: 'bg-danger/10' };
      default:
        return { label: 'Desconocido', color: 'white', icon: Eye, bg: 'bg-white/10' };
    }
  };

  const statusConfig = getStatusConfig(record.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        to="/explorer"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-mono uppercase tracking-wider">Volver al explorador</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
        <div>
          <span className="section-label mb-3 block">Registro</span>
          <h1 className="text-title font-display text-white mb-3">Detalle del Registro</h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              ID: {record.id}
            </span>
            <span className={`badge-${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3 mr-1 inline" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <a
          href={`https://polygonscan.com/tx/${record.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver en Polygonscan
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="glass-card p-6 animate-slide-up stagger-1">
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider mb-6">
              Información General
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { icon: Building2, label: 'Municipio', value: record.municipality },
                { icon: FileText, label: 'Tipo de Gasto', value: record.type },
                { icon: Calendar, label: 'Fecha de Creación', value: record.date },
                {
                  icon: Database,
                  label: 'Monto',
                  value: `$${record.amount.toLocaleString()} ${record.currency}`,
                },
              ].map((field, i) => (
                <div key={i}>
                  <dt className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                    <field.icon className="h-3.5 w-3.5" />
                    {field.label}
                  </dt>
                  <dd className="text-white font-body text-lg">{field.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <dt className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                <Hash className="h-3.5 w-3.5" />
                Hash SHA-256
              </dt>
              <dd className="font-mono text-sm text-neon-cyan bg-neon-cyan/5 p-3 rounded-lg border border-neon-cyan/20 break-all">
                {record.hash}
              </dd>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6 animate-slide-up stagger-2">
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider mb-4">
              Descripción
            </h2>
            <p className="text-white/70 font-body leading-relaxed">{record.description}</p>
          </div>

          {/* Documents */}
          <div className="glass-card p-6 animate-slide-up stagger-3">
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider mb-6">
              Documentos Respaldatorios
            </h2>

            {record.documents.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-white/10 rounded-xl">
                <FileText className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40 font-body">No hay documentos adjuntos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {record.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-neon-cyan" />
                      </div>
                      <div>
                        <p className="text-white font-body text-sm">{doc.name}</p>
                        <p className="text-xs text-white/40 font-mono">{doc.size}</p>
                      </div>
                    </div>
                    <a
                      href={`https://ipfs.io/ipfs/${doc.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan hover:text-neon-cyan/80 text-sm font-mono flex items-center gap-1"
                    >
                      Ver
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blockchain Status */}
          <div className="glass-card p-6 animate-slide-up stagger-1">
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider mb-6">
              Estado Blockchain
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  Estado On-Chain
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg} border border-${statusConfig.color}/30`}
                >
                  <StatusIcon
                    className={`h-4 w-4 text-${statusConfig.color}`}
                    style={{
                      color:
                        statusConfig.color === 'success'
                          ? '#00ff88'
                          : statusConfig.color === 'warning'
                            ? '#ffaa00'
                            : '#ff4444',
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        statusConfig.color === 'success'
                          ? '#00ff88'
                          : statusConfig.color === 'warning'
                            ? '#ffaa00'
                            : '#ff4444',
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  Transacción
                </p>
                <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                  <p className="font-mono text-xs text-white/60 break-all">
                    {record.txHash.slice(0, 20)}...{record.txHash.slice(-20)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  Bloque
                </p>
                <p className="text-white font-mono text-lg">#{record.blockNumber}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <a
                  href={`https://polygonscan.com/tx/${record.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow text-sm w-full justify-center"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Ver en Explorer
                </a>
              </div>
            </div>
          </div>

          {/* Validation */}
          <div className="glass-card p-6 animate-slide-up stagger-2">
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-wider mb-6">
              Validación
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  Estado
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-white font-body">{statusConfig.label}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  Avalista
                </p>
                <p className="text-white font-body text-sm">{record.validator}</p>
              </div>

              <div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                  Fecha de Validación
                </p>
                <p className="text-white font-body">{record.validationDate}</p>
              </div>
            </div>
          </div>

          {/* Verification Info */}
          <div className="glass-card p-6 border-l-4 border-l-neon-cyan animate-slide-up stagger-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Hash className="h-5 w-5 text-neon-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white font-body mb-1">Verificación</h3>
                <p className="text-xs text-white/50 font-body leading-relaxed">
                  Este registro puede ser verificado comparando su hash SHA-256 con el almacenado en
                  la blockchain de Polygon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
