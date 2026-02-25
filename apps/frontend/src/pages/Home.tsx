import { Link } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Building2,
  Eye,
  Lock,
  FileCheck,
  Landmark,
  ArrowRight,
  ChevronRight,
  Fingerprint,
  Radio,
  Database,
  Zap,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-32 relative">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-magenta/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-5xl">
          {/* Label */}
          <div className="animate-slide-up">
            <span className="section-label mb-8 block">Transparencia gubernamental on-chain</span>
          </div>

          {/* Main headline */}
          <h1 className="text-hero font-display text-white mb-8 animate-slide-up stagger-1">
            Cada peso público, <span className="text-gradient text-glow">verificable</span> para
            siempre
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl font-body animate-slide-up stagger-2">
            Elenchos es el registro público de auditoría gubernamental en blockchain. Sin
            intermediarios. Sin confianza ciega. Solo verificación inmutable.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mt-12 animate-slide-up stagger-3">
            <Link to="/explorer" className="btn-primary text-base">
              <Eye className="h-4 w-4 mr-2" />
              Explorar registros
            </Link>
            <Link to="/municipality" className="btn-secondary text-base">
              <Building2 className="h-4 w-4 mr-2" />
              Soy Municipio
              <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-12 mt-16 pt-8 border-t border-white/[0.06] animate-slide-up stagger-4">
            {[
              { value: '0', label: 'Registros inmutables', icon: Database },
              { value: '0', label: 'Municipios', icon: Building2 },
              { value: 'Polygon', label: 'Red blockchain', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-neon-cyan" />
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-display text-white font-bold">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/40 mt-0.5 font-body">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating decorative element */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 animate-float">
          <div className="relative w-[400px] h-[400px]">
            <div className="absolute inset-0 border border-neon-cyan/20 rounded-3xl rotate-6" />
            <div className="absolute inset-0 border border-neon-magenta/20 rounded-3xl -rotate-3" />
            <div className="absolute inset-4 glass-card flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                  <Fingerprint className="h-10 w-10 text-neon-cyan" />
                </div>
                <div className="font-mono text-xs text-neon-cyan/60">HASH SHA-256</div>
                <div className="font-mono text-[10px] text-white/30 px-8 break-all">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa5d0...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="relative">
        <div className="mb-16">
          <span className="section-label mb-4 block animate-fade-in">Fundamentos</span>
          <h2 className="text-title font-display text-white mb-4 animate-slide-up">
            Los pilares de la confianza pública
          </h2>
          <p className="text-white/50 max-w-xl mb-12 animate-slide-up stagger-1">
            Tres principios técnicos que hacen posible la transparencia radical.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: 'Inmutabilidad',
              desc: 'Una vez registrado, un gasto no puede ser alterado ni eliminado. La blockchain garantiza permanencia absoluta.',
              accent: 'neon-cyan',
              number: '01',
            },
            {
              icon: ShieldCheck,
              title: 'Verificación',
              desc: 'Avalistas institucionales — Tribunales de Cuentas, ONGs, Universidades — validan cada registro antes de su inmutabilización.',
              accent: 'success',
              number: '02',
            },
            {
              icon: Eye,
              title: 'Transparencia',
              desc: 'Todo ciudadano puede explorar, verificar y auditar los registros sin autenticación. Información verdaderamente pública.',
              accent: 'neon-magenta',
              number: '03',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              className="glass-card-hover p-8 relative overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${0.1 + i * 0.15}s` }}
            >
              {/* Corner accent */}
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-${pillar.accent}/10 rounded-bl-[80px] -mr-10 -mt-10 transition-all group-hover:scale-110`}
              />

              {/* Number */}
              <div className={`text-5xl font-display font-bold text-${pillar.accent}/20 mb-6`}>
                {pillar.number}
              </div>

              <div
                className={`w-14 h-14 rounded-2xl bg-${pillar.accent}/10 border border-${pillar.accent}/30 flex items-center justify-center mb-6`}
              >
                <pillar.icon
                  className={`h-6 w-6 text-${pillar.accent}`}
                  style={{
                    color:
                      pillar.accent === 'neon-cyan'
                        ? '#00f0ff'
                        : pillar.accent === 'success'
                          ? '#00ff88'
                          : '#ff006e',
                  }}
                />
              </div>

              <h3 className="text-xl font-display text-white font-semibold mb-3">{pillar.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed font-body">{pillar.desc}</p>

              {/* Hover line */}
              <div
                className={`absolute bottom-0 left-0 h-[2px] bg-${pillar.accent} w-0 group-hover:w-full transition-all duration-500`}
                style={{
                  backgroundColor:
                    pillar.accent === 'neon-cyan'
                      ? '#00f0ff'
                      : pillar.accent === 'success'
                        ? '#00ff88'
                        : '#ff006e',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section className="relative">
        <div className="mb-16">
          <span className="section-label mb-4 block">Proceso</span>
          <h2 className="text-title font-display text-white mb-4">
            Del registro a la inmutabilidad
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: Building2,
              step: '01',
              title: 'Registro',
              desc: 'El municipio carga el gasto con documentación respaldatoria.',
            },
            {
              icon: FileCheck,
              step: '02',
              title: 'Hash',
              desc: 'Se genera una huella digital única (SHA-256) del registro completo.',
            },
            {
              icon: ShieldCheck,
              step: '03',
              title: 'Validación',
              desc: 'Un avalista institucional examina y aprueba el registro.',
            },
            {
              icon: Landmark,
              step: '04',
              title: 'On-chain',
              desc: 'El hash se ancla en blockchain. Eternamente verificable.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="brutal-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-neon-cyan">{item.step}</span>
                  <item.icon className="h-5 w-5 text-white/30" />
                </div>

                <h3 className="text-lg font-display text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 font-body leading-relaxed">{item.desc}</p>
              </div>

              {/* Connector */}
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-neon-cyan/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Technical Features ── */}
      <section className="relative">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[150px] -mr-40 -mt-40" />

          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label mb-4 block">Tecnología</span>
              <h2 className="text-title font-display text-white mb-6">
                Arquitectura descentralizada
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed">
                Los datos viven off-chain para eficiencia y costo, pero sus hashes y metadatos
                críticos se anclan on-chain para garantizar inmutabilidad y verificabilidad pública.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Red principal', value: 'Polygon PoS', icon: Radio },
                  { label: 'Almacenamiento', value: 'IPFS + PostgreSQL', icon: Database },
                  { label: 'Hashing', value: 'SHA-256', icon: Fingerprint },
                ].map((tech, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                      <tech.icon className="h-5 w-5 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 font-mono uppercase">{tech.label}</p>
                      <p className="text-white font-semibold">{tech.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="brutal-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
                  <span className="text-xs font-mono text-neon-cyan uppercase tracking-wider">
                    Live Network
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 bg-void-900 rounded-lg border border-white/10">
                    <div className="flex justify-between text-white/40 mb-2">
                      <span>Block Height</span>
                      <span className="text-white">60,234,891</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-neon-cyan rounded-full" />
                    </div>
                  </div>

                  <div className="p-4 bg-void-900 rounded-lg border border-white/10">
                    <div className="flex justify-between text-white/40 mb-2">
                      <span>Gas Price</span>
                      <span className="text-white">25 Gwei</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-neon-magenta rounded-full" />
                    </div>
                  </div>

                  <div className="p-4 bg-void-900 rounded-lg border border-white/10">
                    <div className="flex justify-between text-white/40 mb-1">
                      <span>Last Tx</span>
                      <span className="text-success">Confirmed</span>
                    </div>
                    <div className="text-[10px] text-white/30 truncate">0x3f8a...9e2d</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-void-800 to-neon-magenta/20" />
          <div className="absolute inset-0 bg-void-900/80 backdrop-blur-sm" />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid opacity-20" />

          <div className="relative p-12 md:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                Sistema Activo
              </span>
            </div>

            <h2 className="text-title font-display text-white mb-6">
              Transparencia voluntaria, confianza real
            </h2>

            <p className="text-base text-white/50 max-w-lg mx-auto mb-10 font-body">
              Ningún municipio está obligado a participar. Pero quien lo hace, demuestra
              públicamente su compromiso con la democracia transparente.
            </p>

            <Link to="/explorer" className="btn-brutal text-base inline-flex">
              <Search className="h-4 w-4 mr-2" />
              Explorar registros públicos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
