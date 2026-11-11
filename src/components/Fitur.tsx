import React from 'react';
import { Sliders, Bike, QrCode, BarChart3, CheckCircle, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

interface FiturProps {
  onRegisterClick: () => void;
}

export const Fitur: React.FC<FiturProps> = ({ onRegisterClick }) => {
  return (
    <section id="fitur" className="py-16 md:py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Fitur Lengkap UMKM</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-balance">
            Segala Kebutuhan Operasional Cafe & Usaha Kuliner dalam Satu Platform
          </h2>
          <p className="text-stone-600 mt-3 text-base sm:text-lg">
            Tidak ada lagi pesanan salah catat di WhatsApp atau pusing hitung ongkir dan rekap omzet manual.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Feature 1: Produk dengan Varian (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">
                1. Produk dengan Varian & Opsi Fleksibel
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
                Kustomisasi pesanan pembeli tanpa batasan. Dukung pilihan ukuran (Regular/Large), level kepedasan makanan, takaran gula & es, hingga aneka topping ekstra dengan penambahan harga otomatis.
              </p>
            </div>

            {/* Interactive Visual Card inside Feature 1 */}
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80">
              <p className="text-xs font-semibold text-stone-500 mb-2">Simulasi Pengaturan Varian Menu:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 block">Es Kopi Susu Gula Aren</span>
                    <span className="text-stone-500 text-[11px]">Varian: Regular (Rp 18k) · Large (Rp 22k) · 1 Liter (Rp 70k)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                    +3 Varian
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 block">Ayam Geprek Sambal Korek</span>
                    <span className="text-stone-500 text-[11px]">Level Pedas (1-5) · Extra Mozzarella (+7k) · Telur Dadar (+5k)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                    +4 Topping
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Delivery & Kurir (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">
                2. Pengaturan Delivery & Kurir Mandiri
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Kuasai pengantaran lokal di area Anda. Tentukan radius antar (misal maksimal 5 km dari toko), atur ongkos kirim flat atau per kilometer, serta opsi ambil sendiri (take-away / pick-up).
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">Radius Jangkauan Antar:</span>
                <span className="font-bold text-stone-900">Maks. 6 KM</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">Tarif Ongkir Toko:</span>
                <span className="font-bold text-amber-700">Rp 8.000 Flat</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-medium text-stone-700">Opsi Ambil Sendiri (Takeaway):</span>
                <span className="font-bold text-emerald-700">Gratis (Rp 0)</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Pembayaran QRIS & COD (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">
                3. Pembayaran QRIS & COD Instan
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Dukung pembayaran digital masa kini. Pembeli bisa scan QRIS dari BCA, Mandiri, GoPay, OVO, ShopeePay, atau pilih bayar tunai (COD) saat kurir tiba.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-stone-800 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dana langsung masuk ke rekening bank/QRIS Anda</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>0% potongan per transaksi dari PesanKuliner</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pilihan upload bukti transfer sebelum checkout</span>
              </div>
            </div>
          </div>

          {/* Feature 4: Laporan Penjualan (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">
                4. Laporan Penjualan & Rekap Harian Otomatis
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
                Setiap transaksi otomatis dicatat dalam sistem. Anda bisa melihat total omzet hari ini, produk paling laris, riwayat pesanan per pelanggan, dan ekspor laporan ke Excel kapan saja.
              </p>
            </div>

            {/* Dashboard Analytics Preview */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="grid grid-cols-3 gap-3 pb-3 border-b border-stone-800 text-center">
                <div>
                  <span className="text-[11px] text-stone-400 block">Omzet Hari Ini</span>
                  <span className="text-base sm:text-lg font-bold text-amber-400 tabular-nums">Rp 1.480.000</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Total Pesanan</span>
                  <span className="text-base sm:text-lg font-bold text-white tabular-nums">38 Order</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Menu Terlaris</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400">Kopi Senja</span>
                </div>
              </div>
              <div className="pt-3 flex items-center justify-between text-xs text-stone-400">
                <span>Rekap otomatis tiap malam, bebas stres tutup buku kasir.</span>
                <span className="text-amber-400 font-semibold">Laporan Lengkap →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
