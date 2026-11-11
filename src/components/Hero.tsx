import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, QrCode, Bike, ShoppingBag, Plus, Sparkles, MessageCircle } from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  onRegisterClick: () => void;
  onExploreDemoStore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onExploreDemoStore }) => {
  const [activeTab, setActiveTab] = useState<'kopi' | 'makanan'>('kopi');
  const [mockCartCount, setMockCartCount] = useState(2);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const handleQuickAdd = (itemName: string) => {
    setMockCartCount((prev) => prev + 1);
    setAddedNotice(`"${itemName}" ditambahkan ke pesanan!`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-amber-50/70 via-stone-50 to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Primary CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-md border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Solusi Toko Online & Delivery Mandiri UMKM Kuliner Indonesia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] text-balance">
              Buka toko online sendiri dalam{' '}
              <span className="text-amber-600 underline decoration-amber-300 decoration-wavy decoration-2 underline-offset-8">
                5 menit
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl leading-relaxed">
              Khusus Cafe, Warung Makan, dan Usaha Kuliner di Indonesia. Terima pesanan delivery & take-away langsung via WhatsApp. 
              <strong className="text-stone-900 font-semibold"> 0% komisi</strong>, terima pembayaran QRIS & COD, tanpa ribet download aplikasi untuk pembeli.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl shadow-lg shadow-amber-600/25 transition-all text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/50"
              >
                <span>Daftarkan Toko</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreDemoStore}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-all text-center"
              >
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <span>Coba Demo Toko Cafe</span>
              </button>
            </div>

            {/* Trust Markers / Quantitative Evidence */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-stone-700">
              <div>
                <p className="text-2xl font-black text-stone-900 tracking-tight">0%</p>
                <p className="text-xs text-stone-500 mt-0.5">Potongan Komisi Order</p>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 tracking-tight">5 Mnt</p>
                <p className="text-xs text-stone-500 mt-0.5">Siap Jualan & Share Link</p>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 tracking-tight">1.800+</p>
                <p className="text-xs text-stone-500 mt-0.5">Cafe & Resto Terdaftar</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Tanpa biaya pendaftaran
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Pelanggan tidak perlu login
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Format pesanan WhatsApp rapi
              </span>
            </div>
          </div>

          {/* Right Column: Interactive App Screen Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-stone-900 rounded-[2.5rem] p-3 shadow-2xl ring-1 ring-stone-900/10">
              {/* Phone Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-stone-700 rounded-full" />
              </div>

              {/* Inside Screen Container */}
              <div className="relative bg-stone-50 rounded-[2rem] overflow-hidden border border-stone-200 h-[640px] flex flex-col text-stone-900">
                {/* Store Header Bar inside phone */}
                <div className="bg-stone-900 text-white p-4 pt-7 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">pesankuliner.id/senja</p>
                      <h3 className="text-base font-bold">Kopi & Toast Senja</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/40">
                      Buka (08:00 - 22:00)
                    </span>
                  </div>

                  {/* Delivery vs Pickup switch inside phone */}
                  <div className="mt-3 grid grid-cols-2 bg-stone-800 p-0.5 rounded-lg text-xs font-medium">
                    <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-amber-600 text-white shadow-xs">
                      <Bike className="w-3.5 h-3.5" />
                      <span>Delivery Lokal</span>
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-stone-300 hover:text-white">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ambil Sendiri</span>
                    </button>
                  </div>
                </div>

                {/* Subcategory interactive buttons */}
                <div className="px-3 py-2 bg-white border-b border-stone-200 flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('kopi')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeTab === 'kopi'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Kopi & Minuman
                  </button>
                  <button
                    onClick={() => setActiveTab('makanan')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      activeTab === 'makanan'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Makanan & Pastry
                  </button>
                </div>

                {/* Notice banner if item added */}
                {addedNotice && (
                  <div className="mx-3 mt-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{addedNotice}</span>
                  </div>
                )}

                {/* Phone Menu List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                  {activeTab === 'kopi' ? (
                    <>
                      {/* Product 1 */}
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex gap-2.5 shadow-2xs">
                        <img
                          src="/src/assets/images/cafe_kopi_aren_1794352693498.jpg"
                          alt="Es Kopi Susu Aren"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 truncate">Es Kopi Susu Aren</p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">Espresso double shot & gula aren murni</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-extrabold text-amber-700">Rp 18.000</span>
                            <button
                              onClick={() => handleQuickAdd('Es Kopi Susu Aren')}
                              className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2 py-1 rounded-md text-[11px] active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product 2 */}
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex gap-2.5 shadow-2xs">
                        <img
                          src="/src/assets/images/hero_indonesian_cafe_1794352692880.jpg"
                          alt="Matcha Latte Dingin"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 truncate">Matcha Latte Uji</p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">Matcha premium Kyoto creamy</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-extrabold text-amber-700">Rp 24.000</span>
                            <button
                              onClick={() => handleQuickAdd('Matcha Latte Uji')}
                              className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2 py-1 rounded-md text-[11px] active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Product 3 */}
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex gap-2.5 shadow-2xs">
                        <img
                          src="/src/assets/images/bakery_toast_pastry_1794352694749.jpg"
                          alt="Roti Panggang Butter Kaya"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 truncate">Roti Butter Kaya & Keju</p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">Panggang renyah isi butter & selai kaya</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-extrabold text-amber-700">Rp 22.000</span>
                            <button
                              onClick={() => handleQuickAdd('Roti Butter Kaya')}
                              className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2 py-1 rounded-md text-[11px] active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product 4 */}
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex gap-2.5 shadow-2xs">
                        <img
                          src="/src/assets/images/food_ayam_geprek_1794352693423.jpg"
                          alt="Ayam Geprek Sambal Korek"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 truncate">Ayam Geprek Sambal Korek</p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">Pilihan Level 1-5 pedas nampol</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-extrabold text-amber-700">Rp 23.000</span>
                            <button
                              onClick={() => handleQuickAdd('Ayam Geprek')}
                              className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2 py-1 rounded-md text-[11px] active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment Badge inside mockup */}
                  <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-stone-700 font-medium">
                      <QrCode className="w-4 h-4 text-amber-700" />
                      <span>Bayar via QRIS / Tunai COD</span>
                    </div>
                    <span className="font-bold text-amber-800">0% Potongan</span>
                  </div>
                </div>

                {/* Bottom Checkout Bar inside phone */}
                <div className="p-3 bg-white border-t border-stone-200">
                  <button
                    onClick={onExploreDemoStore}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-between shadow-sm active:scale-98 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {mockCartCount}
                      </span>
                      <span className="text-xs">Lihat Keranjang</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">Rp {(mockCartCount * 18000).toLocaleString('id-ID')}</span>
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-1.5">Pesanan langsung dikirim ke WhatsApp toko</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
