import React from 'react';
import { Store, UtensilsCrossed, LayoutDashboard, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onRegisterClick: () => void;
  onDashboardClick: () => void;
  onDemoStoreClick: () => void;
  currentView: 'landing' | 'register' | 'dashboard' | 'store';
  onNavigateHome: () => void;
  hasRegisteredStore: boolean;
  storeName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  onDashboardClick,
  onDemoStoreClick,
  currentView,
  onNavigateHome,
  hasRegisteredStore,
  storeName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={onNavigateHome}
          className="text-left group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/20 group-hover:bg-amber-700 transition-colors shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0">
            PesanKuliner
          </span>
        </button>

        {/* Zone 2: Navigation Links (clean single-line text links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          {currentView === 'landing' ? (
            <>
              <a
                href="#cara-kerja"
                className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
              >
                Cara Kerja
              </a>
              <a
                href="#fitur"
                className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
              >
                Fitur
              </a>
              <a
                href="#untuk-siapa"
                className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
              >
                Untuk Siapa
              </a>
              <a
                href="#harga"
                className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
              >
                Harga
              </a>
              <a
                href="#faq"
                className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
              >
                FAQ
              </a>
            </>
          ) : (
            <button
              onClick={onNavigateHome}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 text-amber-700"
            >
              ← Kembali ke Beranda
            </button>
          )}

          <button
            onClick={onDemoStoreClick}
            className="flex items-center gap-1.5 text-stone-600 hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lihat Contoh Toko</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasRegisteredStore ? (
            <button
              onClick={onDashboardClick}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                currentView === 'dashboard'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-600" />
              <span>Dashboard {storeName ? `(${storeName})` : 'Toko'}</span>
            </button>
          ) : null}

          <button
            onClick={onRegisterClick}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl shadow-sm shadow-amber-600/30 transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Daftarkan Toko
          </button>
        </div>
      </div>
    </header>
  );
};
