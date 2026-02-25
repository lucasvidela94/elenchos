import { Link, Outlet, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, Building2, ShieldCheck, Home, Menu, X, Hexagon } from 'lucide-react';
import { useState } from 'react';

function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium font-body
                               bg-neon-cyan text-void-900 rounded-lg font-semibold
                               hover:shadow-neon-cyan hover:scale-[1.02] transition-all duration-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-void-900 animate-pulse" />
                    Conectar Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium font-body
                               text-danger bg-danger/10 border border-danger/30 rounded-lg
                               hover:bg-danger/20 transition-colors"
                  >
                    Red incorrecta
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium font-body
                               border border-white/10 rounded-lg bg-white/5
                               hover:border-white/20 hover:bg-white/10 transition-colors"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain'}
                        src={chain.iconUrl}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium font-mono
                               border border-neon-cyan/30 rounded-lg bg-neon-cyan/10
                               hover:border-neon-cyan/50 hover:bg-neon-cyan/20 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/explorer', label: 'Explorador', icon: Search },
    { path: '/municipality', label: 'Municipio', icon: Building2 },
    { path: '/validator', label: 'Avalista', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-void-900 flex flex-col relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[150px] animate-glow-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-magenta/8 rounded-full blur-[120px] animate-glow-pulse"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 bg-void-900/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between h-[72px] items-center">
            {/* Logo + Nav */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                {/* Logo mark */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <Hexagon className="absolute w-10 h-10 text-neon-cyan stroke-[1.5]" />
                  <span className="relative text-neon-cyan font-display text-lg font-bold">E</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-magenta rounded-full border-2 border-void-900 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-display font-bold text-white tracking-tight leading-none">
                    ELENCHOS
                  </span>
                  <span className="text-[10px] font-mono text-neon-cyan/70 uppercase tracking-[0.25em] leading-tight">
                    On-Chain Audit
                  </span>
                </div>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex ml-10 gap-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`nav-link ${isActive(path) ? 'nav-link-active' : ''}`}
                  >
                    <Icon className="h-4 w-4 mr-1.5 inline opacity-70" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <WalletButton />
              </div>

              <button
                className="md:hidden p-2 rounded-lg text-white/60 hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-void-800/95 backdrop-blur-xl px-5 py-4 space-y-1 animate-slide-up">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(path)
                    ? 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30'
                    : 'text-white/70 hover:bg-white/5'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/[0.06] sm:hidden">
              <WalletButton />
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-void-950 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <Hexagon className="absolute w-8 h-8 text-neon-cyan/50 stroke-[1.5]" />
                  <span className="relative text-neon-cyan/80 font-display text-sm font-bold">
                    E
                  </span>
                </div>
                <span className="text-base font-display font-bold text-white tracking-tight">
                  ELENCHOS
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/40 max-w-sm font-body">
                Registro público de auditoría gubernamental en blockchain. Transparencia radical
                mediante tecnología descentralizada.
              </p>
              <div className="flex gap-3 pt-2">
                <div className="badge-neon">Polygon PoS</div>
                <div className="badge bg-white/5 text-white/50 border border-white/10">
                  MIT License
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-neon-cyan uppercase tracking-[0.15em] mb-4">
                Navegación
              </h3>
              <ul className="space-y-3">
                {[
                  { to: '/explorer', label: 'Explorador Público' },
                  { to: '/municipality', label: 'Panel Municipio' },
                  { to: '/validator', label: 'Panel Avalista' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-white/50 hover:text-neon-cyan transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-neon-cyan uppercase tracking-[0.15em] mb-4">
                Sistema
              </h3>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Red: Polygon Mainnet
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                  Contrato: Verificado
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-magenta" />
                  Último bloque: #60M+
                </li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30">
            <p className="font-mono">&copy; {new Date().getFullYear()} Elenchos — Software libre</p>
            <p className="font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              Inmutable · Verificable · Público
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
