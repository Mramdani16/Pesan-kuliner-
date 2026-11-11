import React, { useState } from 'react';
import { UtensilsCrossed, MessageCircle, ShieldCheck, FileText, X } from 'lucide-react';

interface FooterProps {
  onRegisterClick: () => void;
  onDemoStoreClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRegisterClick, onDemoStoreClick }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Summary (col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                PesanKuliner
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              Platform toko online & delivery lokal mandiri untuk Cafe, Restoran, Warung, dan UMKM Makanan di seluruh Indonesia. 0% potongan komisi pesanan.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20PesanKuliner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-2 rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bantuan Resmi: WhatsApp +62 812-3456-7890</span>
              </a>
            </div>
          </div>

          {/* Quick Nav (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigasi Halaman</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>
                <a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja 3 Langkah</a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-white transition-colors">Fitur Varian & Kurir</a>
              </li>
              <li>
                <a href="#untuk-siapa" className="hover:text-white transition-colors">Untuk Cafe & Resto</a>
              </li>
              <li>
                <a href="#harga" className="hover:text-white transition-colors">Daftar Paket Gratis</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Pertanyaan Umum (FAQ)</a>
              </li>
            </ul>
          </div>

          {/* Interactive Demo & Legal (col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Akses Langsung</h4>
            <div className="space-y-2.5">
              <button
                onClick={onRegisterClick}
                className="w-full text-left px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between"
              >
                <span>Daftarkan Toko Baru (5 Menit)</span>
                <span>→</span>
              </button>
              <button
                onClick={onDemoStoreClick}
                className="w-full text-left px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between border border-stone-700"
              >
                <span>Buka Demo Toko Pembeli</span>
                <span>→</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-stone-200 underline underline-offset-4"
              >
                Kebijakan Privasi
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-stone-200 underline underline-offset-4"
              >
                Syarat & Ketentuan
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} PesanKuliner Indonesia. Dibuat dengan bangga untuk memajukan UMKM Kuliner Nusantara.</p>
          <div className="flex items-center gap-4">
            <span>Server Cepat & Responsif</span>
            <span>·</span>
            <span>Enkripsi Aman</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-amber-700 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-lg">Kebijakan Privasi PesanKuliner</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                Di PesanKuliner, kami sangat menghargai privasi para pemilik toko cafe, resto, dan seluruh pelanggan Anda di Indonesia.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">1. Data yang Dikumpulkan</h4>
              <p>
                Informasi yang dikumpulkan saat pendaftaran toko meliputi nama usaha, alamat pengantaran, jam operasional, email, dan nomor WhatsApp toko untuk keperluan perutean pesanan.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">2. Penggunaan Data Pesanan</h4>
              <p>
                Data pesanan dari pembeli (seperti nama, rincian menu, dan catatan pengantaran) langsung dikirimkan ke nomor WhatsApp toko pemilik tanpa diperjualbelikan kepada pihak ketiga manapun.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">3. Keamanan Transaksi</h4>
              <p>
                Kami tidak menyimpan kode PIN atau kredensial perbankan pengguna. Pembayaran QRIS dilakukan langsung melalui standar QRIS nasional Bank Indonesia ke rekening pemilik usaha.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-200 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-amber-700 font-bold">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg">Syarat & Ketentuan Layanan</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                Dengan mendaftarkan toko di PesanKuliner, Anda menyetujui ketentuan pemakaian layanan platform kami:
              </p>
              <h4 className="font-bold text-stone-900 text-sm">1. Kepemilikan Usaha</h4>
              <p>
                Pengguna bertanggung jawab penuh atas keaslian produk makanan, minuman, sertifikasi halal/higienitas, dan operasional pengantaran yang dijalankan.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">2. Kebijakan Komisi 0%</h4>
              <p>
                PesanKuliner tidak memungut komisi persentase atas omzet jualan harian pemilik toko dalam Paket Gratis.
              </p>
              <h4 className="font-bold text-stone-900 text-sm">3. Komunikasi WhatsApp</h4>
              <p>
                Layanan pengiriman pesan pesanan memanfaatkan WhatsApp Web/App di perangkat pemilik dan pembeli sesuai kebijakan penggunaan Meta WhatsApp.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-200 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
