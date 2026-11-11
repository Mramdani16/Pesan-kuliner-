import React, { useState } from 'react';
import { Store as StoreIcon, Coffee, Utensils, Cake, Upload, Check, ArrowRight, Eye, EyeOff, Sparkles, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { Store } from '../types';

interface RegistrasiTokoProps {
  onRegisterSuccess: (store: Store) => void;
  onCancel: () => void;
}

export const RegistrasiToko: React.FC<RegistrasiTokoProps> = ({ onRegisterSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<'cafe' | 'resto' | 'bakery' | 'umkm'>('cafe');
  const [logoUrl, setLogoUrl] = useState('/src/assets/images/cafe_kopi_aren_1794352693498.jpg');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [openingHours, setOpeningHours] = useState('08:00 - 22:00 WIB');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customLogoPreview, setCustomLogoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredStore, setRegisteredStore] = useState<Store | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-generate slug as user types name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug || 'toko-anda');
  };

  const presetLogos = [
    { label: 'Kopi & Cafe', url: '/src/assets/images/cafe_kopi_aren_1794352693498.jpg' },
    { label: 'Makanan / Ayam', url: '/src/assets/images/food_ayam_geprek_1794352693423.jpg' },
    { label: 'Bakery / Roti', url: '/src/assets/images/bakery_toast_pastry_1794352694749.jpg' },
    { label: 'Warung & Resto', url: '/src/assets/images/hero_indonesian_cafe_1794352692880.jpg' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoPreview(reader.result);
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !email.trim() || !password.trim()) {
      alert('Mohon lengkapi semua data wajib (Nama Toko, WhatsApp, Email, dan Password)!');
      return;
    }

    setIsSubmitting(true);

    const categoryLabels = {
      cafe: 'Cafe & Coffee Shop',
      resto: 'Makanan & Resto (Kelontong/Makanan)',
      bakery: 'Bakery & Kue',
      umkm: 'Usaha Kuliner Rumahan',
    };

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: name.trim(),
      slug: slug || 'toko-kuliner',
      category,
      categoryLabel: categoryLabels[category],
      logoUrl: customLogoPreview || logoUrl,
      whatsapp: whatsapp.replace(/[^0-9]/g, ''),
      address: address.trim() || 'Jl. Utama Usaha No. 1',
      city: city.trim() || 'Indonesia',
      openingHours: openingHours.trim() || '08:00 - 22:00 WIB',
      email: email.trim(),
      deliveryFee: 5000,
      deliveryRadiusKm: 6,
      deliveryPricing: {
        baseFirstKmFee: 5000,
        secondKmFee: 3000,
        subsequentKmFee: 2000,
      },
      minOrder: 15000,
      isQrisActive: true,
      isCodActive: true,
      plan: 'free',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setRegisteredStore(newStore);
    }, 600);
  };

  const copyStoreLink = () => {
    if (!registeredStore) return;
    const link = `https://pesankuliner.id/${registeredStore.slug}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // SUCCESS STATE AFTER REGISTRATION
  if (registeredStore) {
    return (
      <div className="py-12 md:py-20 px-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Selamat, Toko Anda Siap Jualan!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3">
              {registeredStore.name} Berhasil Didaftarkan
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Website toko online & sistem delivery mandiri Anda sudah aktif dan siap menerima pesanan via WhatsApp.
            </p>
          </div>

          {/* Unique Link Card */}
          <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 text-left space-y-2">
            <p className="text-xs font-bold text-amber-900">Link Unik Toko Online Anda:</p>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-amber-300">
              <span className="font-mono text-xs sm:text-sm font-bold text-stone-900 flex-1 truncate">
                https://pesankuliner.id/{registeredStore.slug}
              </span>
              <button
                onClick={copyStoreLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800">
              Bagikan link ini di bio Instagram, TikTok, WhatsApp Story, atau cetak QR code di meja pelanggan.
            </p>
          </div>

          {/* Action to Dashboard or Live Store View */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => onRegisterSuccess(registeredStore)}
              className="w-full py-4 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Buka Dashboard Admin Toko</span>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Depan</span>
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Daftarkan Toko Kuliner Anda
        </h1>
        <p className="text-stone-600 mt-2 text-sm sm:text-base">
          Mulai dalam 5 menit. Dapatkan link website sendiri, kelola pesanan delivery, dan terima pembayaran QRIS langsung tanpa potongan komisi.
        </p>
      </div>

      {/* Main Registration Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-lg space-y-8">
        {/* Section 1: Informasi Dasar Toko */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-amber-600" />
            <span>1. Informasi Toko & Brand</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Toko / Usaha Kuliner <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Kopi & Toast Senja, Ayam Geprek Mas Dwi"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
            />
          </div>

          {/* Generated Slug preview */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Link Unik Toko Anda Nanti:</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 truncate">
              pesankuliner.id/{slug || 'nama-toko-anda'}
            </span>
          </div>

          {/* Jenis Usaha Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Jenis Usaha Kuliner <span className="text-amber-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'cafe' as const, label: 'Cafe & Kopi', icon: Coffee },
                { id: 'resto' as const, label: 'Kelontong / Makanan', icon: Utensils },
                { id: 'bakery' as const, label: 'Bakery & Kue', icon: Cake },
                { id: 'umkm' as const, label: 'Kuliner Rumahan', icon: StoreIcon },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-stone-900'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo Selection / Upload */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Pilih Logo / Foto Utama Toko
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {presetLogos.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setLogoUrl(p.url);
                    setCustomLogoPreview(null);
                  }}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 text-center ${
                    logoUrl === p.url && !customLogoPreview
                      ? 'border-amber-600 ring-2 ring-amber-500/30'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-16 object-cover rounded-lg mb-1"
                  />
                  <span className="text-[11px] font-semibold text-stone-700 block truncate">{p.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Upload Logo Sendiri</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {customLogoPreview && (
                <span className="text-xs text-emerald-700 font-medium">✓ Logo kustom terpilih</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Kontak & Operasional */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>2. Kontak WhatsApp & Jam Buka</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp Toko <span className="text-amber-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all font-mono"
              />
              <p className="text-[11px] text-stone-500 mt-1">Nomor ini menerima notifikasi pesanan pelanggan secara otomatis.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Jam Operasional Toko
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="08:00 - 22:00 WIB (Senin - Minggu)"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Alamat Lengkap Toko / Dapur
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Gandaria Tengah II No. 14, RT 02/05"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta Selatan"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Akun Login Dashboard Toko */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>3. Akun Pemilik Toko (Login Dashboard)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Pemilik <span className="text-amber-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pemilik@cafesaya.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password Toko <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 active:scale-99 text-white font-black rounded-xl text-base shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <span>Menyiapkan Toko Anda...</span>
            ) : (
              <>
                <span>Daftarkan Toko Sekarang (Gratis)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs text-stone-500 text-center mt-3">
            Dengan mendaftar, Anda menyetujui Paket Gratis tanpa biaya komisi penjualan dari PesanKuliner.
          </p>
        </div>
      </form>
    </div>
  );
};
