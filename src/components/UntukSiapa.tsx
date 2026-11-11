import React, { useState } from 'react';
import { Coffee, Utensils, Cake, ArrowRight, Check } from 'lucide-react';

interface UntukSiapaProps {
  onRegisterClick: () => void;
  onExploreStoreByCategory: (cat: 'cafe' | 'resto' | 'bakery') => void;
}

export const UntukSiapa: React.FC<UntukSiapaProps> = ({ onRegisterClick, onExploreStoreByCategory }) => {
  const [activeCategory, setActiveCategory] = useState<'cafe' | 'resto' | 'bakery'>('cafe');

  const categories = [
    {
      id: 'cafe' as const,
      name: 'Cafe & Coffee Shop',
      tagline: 'Solusi pesan antar kopi & non-kopi tanpa potongan aplikasi ojek online',
      icon: Coffee,
      image: '/src/assets/images/cafe_kopi_aren_1794352693498.jpg',
      benefits: [
        'Dukungan varian literan (1 Liter / 500ml) & botolan',
        'Pilihan es, susu oats/almond, dan level gula tanpa salah catat',
        'Pelanggan bisa pesan dari meja cafe via QR Code tanpa panggil barista',
        'Pesanan take-away / drive-thru cepat siap saat pelanggan tiba',
      ],
      sampleMenu: [
        { name: 'Es Kopi Susu Gula Aren', price: 'Rp 18.000', note: 'Best Seller 420+ cup/minggu' },
        { name: 'Matcha Uji Kyoto Latte', price: 'Rp 24.000', note: 'Opsi Oat Milk & Less Sugar' },
        { name: 'Artisan Butter Croissant', price: 'Rp 24.000', note: 'Fresh from the oven' },
      ],
      demoStoreSlug: 'kopi-toast-senja',
    },
    {
      id: 'resto' as const,
      name: 'Warung Makan & Restoran',
      tagline: 'Kirim makanan berat panas & cepat dengan kurir sendiri di radius lokal',
      icon: Utensils,
      image: '/src/assets/images/food_ayam_geprek_1794352693423.jpg',
      benefits: [
        'Level kepedasan sambal & pilihan bagian daging (dada/paha) rapi',
        'Tambahan lauk pauk (tahu, tempe, telur dadar, sayur asam)',
        'Ongkir flat murah ke kantor, kampus, dan perumahan sekitar',
        'Kertas pesanan bisa langsung diprint ke printer Bluetooth dapur',
      ],
      sampleMenu: [
        { name: 'Paket Ayam Geprek Sambal Korek', price: 'Rp 23.000', note: 'Level 1 - Level 5' },
        { name: 'Nasi Goreng Spesial Babat', price: 'Rp 27.000', note: 'Wangi smoky kuali wok' },
        { name: 'Es Teh Manis Melati Jumbo', price: 'Rp 5.000', note: 'Gula tebu murni' },
      ],
      demoStoreSlug: 'geprek-mas-dwi',
    },
    {
      id: 'bakery' as const,
      name: 'Bakery, Kue & Usaha Rumahan',
      tagline: 'Terima Pre-Order (PO) dan pesanan harian tanpa perlu toko fisik mewah',
      icon: Cake,
      image: '/src/assets/images/bakery_toast_pastry_1794352694749.jpg',
      benefits: [
        'Atur jadwal pengiriman atau sistem Pre-Order H-1 dengan jelas',
        'Bisa terima pesanan hampers lebaran, natal, atau tumpeng mini',
        'Pembayaran full di muka via QRIS / transfer bank tanpa risiko kabur',
        'Link toko gampang ditaruh di bio media sosial & status WhatsApp',
      ],
      sampleMenu: [
        { name: 'Roti Panggang Kaya & Keju', price: 'Rp 22.000', note: 'Butter New Zealand' },
        { name: 'Fudgy Brownies Shiny Crust', price: 'Rp 65.000', note: 'Cokelat Belgia asli' },
        { name: 'Paket Bento Katering Mini', price: 'Rp 35.000', note: 'Min. Order 10 pax' },
      ],
      demoStoreSlug: 'roti-dapur-nyonya',
    },
  ];

  const current = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <section id="untuk-siapa" className="py-16 md:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Target & Penerapan</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-balance">
            Dirancang Spesifik untuk Karakter Bisnis Kuliner di Indonesia
          </h2>
          <p className="text-stone-600 mt-3 text-base sm:text-lg">
            Setiap jenis usaha kuliner memiliki cara kerja unik. Lihat bagaimana PesanKuliner menyesuaikan dengan bisnis Anda.
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-stone-100 rounded-2xl gap-1 sm:gap-2 border border-stone-200">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Category Display */}
        <div className="bg-stone-50 rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            {/* Left Column: Visual Photo */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden shadow-md aspect-4/3 relative bg-stone-200">
                <img
                  src={current.image}
                  alt={current.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-semibold bg-stone-900/70 backdrop-blur-xs px-3 py-1 rounded-md">
                    Contoh Penerapan: {current.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Capabilities & Menu Showcase */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
                  {current.name}
                </h3>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                  {current.tagline}
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                {current.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-stone-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Sample Menu Showcase */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
                <p className="text-xs font-bold text-stone-900 mb-3 uppercase tracking-wider">
                  Contoh Tampilan Menu di Toko:
                </p>
                <div className="space-y-2">
                  {current.sampleMenu.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">{item.name}</span>
                        <span className="text-[11px] text-stone-500">{item.note}</span>
                      </div>
                      <span className="font-extrabold text-amber-700">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onRegisterClick}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
                >
                  Daftarkan Toko {current.name}
                </button>
                <button
                  onClick={() => onExploreStoreByCategory(current.id)}
                  className="px-5 py-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold rounded-xl text-xs sm:text-sm transition-all"
                >
                  Buka Toko Contoh Ini →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
