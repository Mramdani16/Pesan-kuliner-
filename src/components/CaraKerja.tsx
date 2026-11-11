import React, { useState } from 'react';
import { Store, Coffee, MessageSquare, ArrowRight, Check, Link2, Sliders, Smartphone } from 'lucide-react';

interface CaraKerjaProps {
  onRegisterClick: () => void;
}

export const CaraKerja: React.FC<CaraKerjaProps> = ({ onRegisterClick }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      number: '01',
      title: 'Daftar Toko & Buat Link Unik',
      short: 'Registrasi Cepat',
      desc: 'Cukup masukkan nama toko, nomor WhatsApp, dan alamat. Anda langsung mendapatkan link toko siap sebar seperti pesankuliner.id/namatokomu dalam 2 menit.',
      icon: Store,
      previewTitle: 'Link Toko Mandiri Langsung Aktif',
      previewContent: (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-800 font-semibold mb-1">Alamat Link Toko Online Anda:</p>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-300">
              <span className="text-xs sm:text-sm font-mono font-bold text-stone-900 truncate">
                https://pesankuliner.id/kopi-senja
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-2 shrink-0">
                Aktif
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs text-stone-600">
            <p className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Bisa langsung ditaruh di bio Instagram & TikTok
            </p>
            <p className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Download QR code otomatis untuk ditempel di meja cafe
            </p>
            <p className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Tanpa perlu beli domain atau sewa hosting tambahan
            </p>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Tambah Produk & Atur Varian',
      short: 'Kelola Menu Mudah',
      desc: 'Masukkan menu makanan & minuman Anda beserta foto, harga, dan varian yang fleksibel: pilihan porsi, level pedas, takaran es/gula, hingga aneka topping ekstra.',
      icon: Coffee,
      previewTitle: 'Kustomisasi Varian Menu Fleksibel',
      previewContent: (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="font-bold text-stone-900">Ayam Geprek Sambal Korek</span>
              <span className="font-extrabold text-amber-700">Rp 23.000</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-stone-50 rounded-lg">
                <span className="font-semibold text-stone-700 block mb-1">Varian Level Pedas:</span>
                <span className="text-stone-500">Level 1, Level 2, Level 3 (+2rb), Level 5 (+4rb)</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg">
                <span className="font-semibold text-stone-700 block mb-1">Extra Topping:</span>
                <span className="text-stone-500">Tahu & Tempe (+4rb), Telur Dadar (+5rb), Mozzarella (+7rb)</span>
              </div>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Stok habis? Cukup matikan toggle tanpa perlu hapus menu!</span>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Terima Pesanan Rapi di WhatsApp',
      short: 'Notifikasi Otomatis',
      desc: 'Ketika pelanggan checkout, rincian pesanan, alamat antar, total harga, dan bukti bayar langsung dikirim dalam format pesan WhatsApp yang siap diproses dapur.',
      icon: MessageSquare,
      previewTitle: 'Format Pesanan WhatsApp Otomatis',
      previewContent: (
        <div className="bg-emerald-950/5 border border-emerald-200/80 p-3 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 pb-1 border-b border-emerald-200/60 text-emerald-800 font-bold">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Pesan Masuk dari +62 812-9988-7766</span>
          </div>
          <div className="font-mono text-[11px] leading-relaxed text-stone-700 bg-white p-2.5 rounded-lg border border-emerald-100">
            <p className="font-bold text-stone-900">Halo Kopi Senja, saya mau pesan:</p>
            <p>1x Es Kopi Susu Aren (Large, Less Sugar) = Rp 22.000</p>
            <p>1x Roti Kaya Butter (Extra Keju) = Rp 26.000</p>
            <p className="text-stone-400">----------------------------</p>
            <p>Ongkir Delivery: Rp 8.000</p>
            <p className="font-bold text-emerald-700">TOTAL: Rp 56.000</p>
            <p className="mt-1">Tipe: Delivery Lokal (Jl. Gandaria No. 12)</p>
            <p>Metode Bayar: QRIS (Sudah transfer)</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="cara-kerja" className="py-16 md:py-24 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Cara Kerja Sederhana</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-balance">
            3 Langkah Mudah Mulai Jualan Online & Terima Order Delivery
          </h2>
          <p className="text-stone-600 mt-3 text-base sm:text-lg">
            Dirancang khusus untuk pemilik cafe & UMKM kuliner di Indonesia agar tidak perlu keahlian teknis sedikitpun.
          </p>
        </div>

        {/* 3 Step Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Step Selector Column */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx + 1;
              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(idx + 1)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900">
                          {step.title}
                        </h3>
                        {isSelected && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                            Langkah Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all"
              >
                <span>Daftarkan Toko Sekarang</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Step Live Visual Simulation */}
          <div className="lg:col-span-6">
            <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl border border-stone-800">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 text-xs">
                <span className="text-stone-400">Pratinjau Langkah {steps[activeStep - 1].number}</span>
                <span className="text-amber-400 font-semibold">{steps[activeStep - 1].short}</span>
              </div>

              <div className="mt-5 bg-white text-stone-900 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                    {steps[activeStep - 1].previewTitle}
                  </h4>
                  <span className="text-xs font-mono text-stone-400">PesanKuliner App</span>
                </div>

                {steps[activeStep - 1].previewContent}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
                <span>Klik langkah 1, 2, atau 3 di sebelah kiri untuk melihat simulasi.</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setActiveStep(num)}
                      className={`w-6 h-6 rounded-md text-xs font-bold transition-colors ${
                        activeStep === num ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
