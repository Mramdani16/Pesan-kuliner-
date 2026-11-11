import React, { useState } from 'react';
import { ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'Apakah pembeli wajib install aplikasi atau login terlebih dahulu?',
      a: 'Sama sekali tidak perlu! Pembeli cukup mengeklik link toko online Anda (atau scan QR code di meja). Website langsung terbuka cepat di browser HP pelanggan tanpa perlu registrasi, install APK, atau memasukkan password yang menyulitkan.',
    },
    {
      q: 'Berapa biaya layanannya? Apakah ada potongan komisi per pesanan?',
      a: 'Tidak ada potongan komisi (0% Fee)! Kami menyediakan Paket Gratis Rp 0 selamanya yang bisa langsung digunakan jualan. Seluruh omzet dari makanan, minuman, dan ongkir yang dibayarkan pelanggan 100% menjadi hak milik pemilik toko.',
    },
    {
      q: 'Bagaimana cara pesanan masuk? Apakah langsung terhubung ke WhatsApp?',
      a: 'Ya, betul sekali! Saat pembeli selesai memilih menu, varian, dan mengisi alamat pengantaran, sistem otomatis memformat rincian pesanan dengan sangat rapi dan membuka chat WhatsApp langsung ke nomor kasir atau pemilik toko. Anda tinggal menekan tombol balas untuk konfirmasi.',
    },
    {
      q: 'Bagaimana pengaturan kurir delivery dan penentuan ongkirnya?',
      a: 'Anda memiliki kendali penuh. Anda bisa menentukan radius maksimal pengantaran (misal 5 KM), menetapkan tarif ongkos kirim flat (misal Rp 8.000), atau gratis ongkir jika mencapai minimal belanja tertentu. Pengantaran bisa dilakukan oleh kurir internal toko Anda sendiri atau memesan kurir instan lokal.',
    },
    {
      q: 'Bagaimana pelanggan melakukan pembayaran (QRIS / Tunai COD)?',
      a: 'Anda bisa mengaktifkan pembayaran QRIS Statis/Dinamis toko Anda serta opsi Tunai saat makanan sampai (COD). Jika pembeli memilih QRIS, kode QR toko Anda langsung tampil di layar HP pembeli untuk di-scan menggunakan GoPay, OVO, Dana, ShopeePay, BCA, maupun mobile banking lainnya.',
    },
    {
      q: 'Apakah bisa digunakan untuk cetak struk pesanan ke printer thermal Bluetooth?',
      a: 'Bisa! Di dashboard admin toko, setiap pesanan yang masuk memiliki tombol "Cetak Struk" yang kompatibel dengan printer kasir Bluetooth thermal ukuran standar 58mm dan 80mm.',
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Tanya Jawab</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-balance">
            Pertanyaan yang Sering Diajukan Pemilik Usaha
          </h2>
          <p className="text-stone-600 mt-3 text-base">
            Pelajari bagaimana PesanKuliner mempermudah operasional harian warung, cafe, dan resto Anda.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'bg-amber-50/40 border-amber-300 shadow-2xs' : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-sm sm:text-base text-stone-600 leading-relaxed border-t border-amber-200/50">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Support Callout */}
        <div className="mt-12 p-6 bg-stone-900 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold">Masih punya pertanyaan lain seputar toko Anda?</h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
                Tim spesialis kuliner kami siap memandu via chat WhatsApp setiap hari.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20PesanKuliner,%20saya%20mau%20tanya-tanya%20seputar%20buka%20toko%20online%20cafe/makanan"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp CS</span>
          </a>
        </div>
      </div>
    </section>
  );
};
