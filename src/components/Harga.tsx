import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle } from 'lucide-react';

interface HargaProps {
  onRegisterClick: () => void;
}

export const Harga: React.FC<HargaProps> = ({ onRegisterClick }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="harga" className="py-16 md:py-24 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Biaya Transparan</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-balance">
            Pilihan Paket Adil Tanpa Potongan Komisi Penjualan
          </h2>
          <p className="text-stone-600 mt-3 text-base sm:text-lg">
            Mulai gratis sekarang. Upgrade ke Paket Juara kapan saja jika omzet dan cabang usaha Anda bertumbuh.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex p-1 bg-stone-200/80 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Bayar Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Bayar Tahunan</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Tier 1: Paket Gratis (Mulai) */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Paket Mulai</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Cocok untuk Rintisan
                </span>
              </div>

              <h3 className="text-2xl font-bold text-stone-900 mb-2">Gratis Selamanya</h3>
              <p className="text-sm text-stone-600 mb-6">
                Coba buka toko online dan terima pesanan WhatsApp tanpa modal sepeserpun.
              </p>

              <div className="mb-6 pb-6 border-b border-stone-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-stone-900">Rp 0</span>
                  <span className="text-stone-500 text-sm">/bulan</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Tanpa kartu kredit, gratis tanpa batas waktu</p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-700 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>0% potongan komisi</strong> per pesanan</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Katalog menu hingga <strong>20 produk</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Link toko unik: <code className="bg-stone-100 px-1 py-0.5 rounded text-xs">pesankuliner.id/tokomu</code></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kustomisasi varian (ukuran, topping, level pedas)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kirim pesanan langsung ke <strong>WhatsApp toko</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pembayaran QRIS & COD</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Download file QR Code untuk meja cafe</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all text-center"
            >
              Daftar Paket Gratis Sekarang
            </button>
          </div>

          {/* Tier 2: Paket Juara UMKM (Berbayar) */}
          <div className="bg-gradient-to-b from-amber-500/10 to-white rounded-3xl p-8 border-2 border-amber-500 shadow-md flex flex-col justify-between relative">
            {/* Top highlight badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-extrabold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PALING DIMINATI CAFE & RESTO</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 mt-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Paket Juara</span>
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Untuk Cafe & Usaha Berkembang
                </span>
              </div>

              <h3 className="text-2xl font-bold text-stone-900 mb-2">Juara Kuliner</h3>
              <p className="text-sm text-stone-600 mb-6">
                Fitur lengkap untuk maksimalkan omzet delivery dan cetak struk langsung di kasir.
              </p>

              <div className="mb-6 pb-6 border-b border-amber-200/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-stone-900">
                    {billingCycle === 'yearly' ? 'Rp 39.000' : 'Rp 49.000'}
                  </span>
                  <span className="text-stone-500 text-sm">/bulan</span>
                </div>
                <p className="text-xs text-amber-900 font-medium mt-1">
                  {billingCycle === 'yearly' ? 'Ditagih Rp 468.000/tahun (Hemat Rp 120.000)' : 'Dapat dibatalkan kapan saja'}
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-800 mb-8">
                <li className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Semua fitur di Paket Gratis</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Unlimited Menu Produk</strong> tanpa batas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dukungan <strong>Custom Domain</strong> (contoh: tokoku.com)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Cetak Struk Bluetooth</strong> thermal 58mm & 80mm</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Laporan omzet penjualan lengkap & <strong>ekspor Excel</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Manajemen multi-admin (Kasir, Barista, Kurir)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Prioritas CS WhatsApp 24/7 & panduan setup</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-600/30 transition-all text-center"
            >
              Mulai 14 Hari Uji Coba Gratis
            </button>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-stone-400" />
          <span>Ingin konsultasi kebutuhan khusus cabang atau waralaba? Hubungi WhatsApp tim kami di footer.</span>
        </div>
      </div>
    </section>
  );
};
