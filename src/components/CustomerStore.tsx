import React, { useState } from 'react';
import {
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  Clock,
  MapPin,
  Plus,
  Minus,
  X,
  MessageCircle,
  QrCode,
  CheckCircle2,
  ArrowLeft,
  Share2,
  ChevronRight,
  ShieldCheck,
  Search,
  SearchX,
  RotateCcw,
  Sparkles,
  Gift,
  Award,
  Crown,
  Coins,
  Star,
  Tag,
  Percent,
  Check,
} from 'lucide-react';
import {
  Store,
  Product,
  CartItem,
  Order,
  VariantOption,
  LoyaltyReward,
  LoyaltyMember,
  calculateTieredDeliveryFee,
} from '../types';
import { GoogleMapsDeliveryPicker } from './GoogleMapsDeliveryPicker';

interface CustomerStoreProps {
  store: Store;
  products: Product[];
  rewards?: LoyaltyReward[];
  loyaltyMembers?: LoyaltyMember[];
  onPlaceOrder: (order: Order) => void;
  onBackToHome: () => void;
  onOpenAdmin: () => void;
}

export const CustomerStore: React.FC<CustomerStoreProps> = ({
  store,
  products,
  rewards = [],
  loyaltyMembers = [],
  onPlaceOrder,
  onBackToHome,
  onOpenAdmin,
}) => {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'takeaway' | 'dine_in'>('delivery');
  const [tableNumber, setTableNumber] = useState<string>('Meja 01');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);

  // Variant Modal State
  const [selectedVariants, setSelectedVariants] = useState<{ [variantName: string]: VariantOption }>({});
  const [modalQuantity, setModalQuantity] = useState(1);

  // Customer Loyalty Program State
  const [lookupPhone, setLookupPhone] = useState<string>('');
  const [showLoyaltyModal, setShowLoyaltyModal] = useState<boolean>(false);
  const [showRewardsCatalog, setShowRewardsCatalog] = useState<boolean>(false);
  const [appliedReward, setAppliedReward] = useState<LoyaltyReward | null>(null);
  const [loyaltyToastMessage, setLoyaltyToastMessage] = useState<string | null>(null);

  // Checkout Drawer State
  const [showCheckoutDrawer, setShowCheckoutDrawer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cod'>('qris');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Active rewards for this store
  const storeRewards = rewards.filter(
    (r) => (r.storeId === store.id || r.storeId === 'store-1') && r.isAvailable
  );

  // Find active member by customerPhone or lookupPhone
  const activePhone = (customerPhone.trim() || lookupPhone.trim());
  const activeMember = loyaltyMembers.find(
    (m) => m.phone === activePhone && (m.storeId === store.id || m.storeId === 'store-1')
  );

  const storeProducts = products.filter((p) => p.storeId === store.id || p.storeId === 'store-1');

  // Real-time product search filtering
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const isProductMatch = (product: Product, query: string) => {
    if (!query) return true;
    const nameMatch = product.name.toLowerCase().includes(query);
    const descMatch = product.description.toLowerCase().includes(query);
    const categoryMatch = product.category.toLowerCase().includes(query);
    const variantMatch = product.variants?.some(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.options.some((opt) => opt.label.toLowerCase().includes(query))
    );
    return Boolean(nameMatch || descMatch || categoryMatch || variantMatch);
  };

  // Products matching search query across all categories
  const totalMatchesAcrossCategories = storeProducts.filter((p) =>
    isProductMatch(p, trimmedQuery)
  ).length;

  const filteredProducts = storeProducts.filter((p) => {
    // 1. Category filter
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'kopi'
        ? p.category === 'kopi' || p.category === 'minuman'
        : p.category === selectedCategory;

    if (!matchesCategory) return false;

    // 2. Real-time search query filter
    return isProductMatch(p, trimmedQuery);
  });

  // Helper to highlight matching keywords in text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <mark key={i} className="bg-amber-100 text-amber-900 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleOpenProductModal = (product: Product) => {
    setActiveProductForModal(product);
    setModalQuantity(1);

    // Set default variants if available
    const initialVariants: { [variantName: string]: VariantOption } = {};
    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.options.length > 0) {
          initialVariants[v.name] = v.options[0];
        }
      });
    }
    setSelectedVariants(initialVariants);
  };

  const calculateModalItemPrice = () => {
    if (!activeProductForModal) return 0;
    let base = activeProductForModal.price;
    Object.values(selectedVariants).forEach((opt) => {
      base += opt.priceDelta;
    });
    return base * modalQuantity;
  };

  const handleAddToCartFromModal = () => {
    if (!activeProductForModal) return;

    const basePerItem =
      activeProductForModal.price +
      Object.values(selectedVariants).reduce((sum, opt) => sum + opt.priceDelta, 0);

    const newItem: CartItem = {
      product: activeProductForModal,
      quantity: modalQuantity,
      selectedVariants: { ...selectedVariants },
      totalItemPrice: basePerItem * modalQuantity,
    };

    setCart((prev) => [...prev, newItem]);
    setActiveProductForModal(null);
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);

  // Calculate tiered delivery fee based on selected distance (KM)
  const tieredDeliveryResult =
    deliveryType === 'delivery'
      ? calculateTieredDeliveryFee(deliveryDistanceKm, store.deliveryPricing)
      : {
          fee: 0,
          distance: 0,
          breakdown: deliveryType === 'dine_in' ? `Makan di Tempat (${tableNumber})` : 'Ambil Sendiri di Toko (Rp 0)',
        };

  const currentDeliveryFee = tieredDeliveryResult.fee;

  // Loyalty points ratio and discount calculation
  const pointsRatio = store.loyaltyConfig?.pointsPerAmount || 1000;
  const pointsToEarn = Math.max(1, Math.floor(cartSubtotal / pointsRatio));

  let loyaltyDiscount = 0;
  if (appliedReward) {
    if (appliedReward.rewardType === 'discount_amount') {
      loyaltyDiscount = appliedReward.discountValue;
    } else if (appliedReward.rewardType === 'discount_percent') {
      loyaltyDiscount = Math.round((cartSubtotal * appliedReward.discountValue) / 100);
    } else if (appliedReward.rewardType === 'free_delivery') {
      loyaltyDiscount = currentDeliveryFee;
    } else if (appliedReward.rewardType === 'free_product') {
      loyaltyDiscount = appliedReward.discountValue;
    }
  }
  loyaltyDiscount = Math.min(loyaltyDiscount, cartSubtotal + currentDeliveryFee);
  const cartTotal = Math.max(0, cartSubtotal + currentDeliveryFee - loyaltyDiscount);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon isi nama dan nomor telepon Anda!');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Mohon isi alamat lengkap pengantaran!');
      return;
    }
    if (deliveryType === 'dine_in' && !tableNumber.trim()) {
      alert('Mohon tentukan nomor meja Anda!');
      return;
    }

    const orderNumber = `#PK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      storeId: store.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      tableNumber: deliveryType === 'dine_in' ? tableNumber.trim() : undefined,
      deliveryAddress:
        deliveryType === 'delivery'
          ? deliveryAddress.trim()
          : deliveryType === 'dine_in'
          ? `Makan di Tempat (${tableNumber.trim()})`
          : 'Ambil di Toko',
      deliveryDistanceKm: deliveryType === 'delivery' ? deliveryDistanceKm : 0,
      deliveryBreakdown: tieredDeliveryResult.breakdown,
      notes: orderNotes.trim() || undefined,
      items: cart.map((item) => {
        const variantSummary = Object.entries(item.selectedVariants)
          .map(([k, v]) => `${v.label}`)
          .join(' · ');
        return {
          productId: item.product.id,
          productName: item.product.name,
          variantSummary: variantSummary || 'Original',
          price: item.totalItemPrice / item.quantity,
          quantity: item.quantity,
        };
      }),
      subtotal: cartSubtotal,
      deliveryFee: currentDeliveryFee,
      total: cartTotal,
      paymentMethod,
      status: 'new',
      pointsEarned: pointsToEarn,
      appliedReward: appliedReward
        ? {
            rewardId: appliedReward.id,
            title: appliedReward.title,
            discountAmount: loyaltyDiscount,
            pointsCost: appliedReward.pointsCost,
          }
        : undefined,
      createdAt: 'Baru saja',
    };

    onPlaceOrder(newOrder);
    setCart([]);
    setAppliedReward(null);
    setShowCheckoutDrawer(false);
    setOrderSuccess(newOrder);
  };

  const generateWhatsAppOrderText = (order: Order) => {
    let msg = `*PESANAN BARU - ${order.orderNumber}*\n`;
    msg += `Halo ${store.name}, saya ingin memesan:\n\n`;

    order.items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.quantity}x ${item.productName}*\n`;
      if (item.variantSummary && item.variantSummary !== 'Original') {
        msg += `   └ Varian: ${item.variantSummary}\n`;
      }
      msg += `   └ Subtotal: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });

    msg += `\n------------------------\n`;
    msg += `Subtotal Menu: Rp ${order.subtotal.toLocaleString('id-ID')}\n`;
    if (order.deliveryType === 'delivery') {
      msg += `Ongkir Delivery (${order.deliveryDistanceKm || 1} KM Google Maps): Rp ${order.deliveryFee.toLocaleString('id-ID')}\n`;
      if (order.deliveryBreakdown) {
        msg += `   └ Skema: ${order.deliveryBreakdown}\n`;
      }
    } else if (order.deliveryType === 'dine_in') {
      msg += `Layanan: *Makan di Tempat (Dine-In)*\n`;
      msg += `Nomor Meja: *${order.tableNumber || 'Meja'}*\n`;
      msg += `Ongkir: Rp 0 (Makan di Tempat)\n`;
    } else {
      msg += `Layanan: Ambil Sendiri di Toko (Rp 0)\n`;
    }
    msg += `*TOTAL PEMBAYARAN: Rp ${order.total.toLocaleString('id-ID')}*\n`;
    msg += `Metode Bayar: *${order.paymentMethod === 'qris' ? 'QRIS' : 'Tunai COD'}*\n\n`;

    msg += `*Data Pelanggan:*\n`;
    msg += `Nama: ${order.customerName}\n`;
    msg += `WhatsApp: ${order.customerPhone}\n`;
    if (order.deliveryType === 'delivery') {
      msg += `Alamat Pengantaran: ${order.deliveryAddress} (Jarak Sesuai Google Maps: ±${order.deliveryDistanceKm || 1} KM)\n`;
    } else if (order.deliveryType === 'dine_in') {
      msg += `Lokasi Meja: *${order.tableNumber || 'Meja'}*\n`;
    }
    if (order.notes) {
      msg += `Catatan: ${order.notes}\n`;
    }
    msg += `\nMohon konfirmasi pesanan saya. Terima kasih!`;

    return encodeURIComponent(msg);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-28">
      {/* Top Testing Navigation Bar for Sandbox Review */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="text-stone-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="text-stone-600">|</span>
          <span className="font-mono text-amber-400">
            pesankuliner.id/{store.slug}
          </span>
        </div>

        <button
          onClick={onOpenAdmin}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-md text-[11px] transition-colors"
        >
          Masuk Dashboard Admin Toko
        </button>
      </div>

      <div className="max-w-xl mx-auto bg-stone-50 min-h-screen shadow-md border-x border-stone-200 flex flex-col">
        {/* Store Profile Header */}
        <div className="bg-white border-b border-stone-200 p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <img
              src={store.logoUrl}
              alt={store.name}
              referrerPolicy="no-referrer"
              className="w-18 h-18 rounded-2xl object-cover border border-stone-200 shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black text-stone-900 truncate">
                  {store.name}
                </h1>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-stone-500 mt-0.5 truncate">{store.categoryLabel}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {store.openingHours}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {store.city} (Radius {store.deliveryRadiusKm} KM)
                </span>
              </div>
            </div>
          </div>

          {/* Delivery vs Takeaway vs Makan di Tempat Switcher */}
          <div className="mt-4 grid grid-cols-3 bg-stone-100 p-1 rounded-xl text-xs font-bold border border-stone-200 gap-1">
            <button
              onClick={() => setDeliveryType('delivery')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                deliveryType === 'delivery'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Delivery (Google Maps)</span>
            </button>
            <button
              onClick={() => setDeliveryType('takeaway')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                deliveryType === 'takeaway'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ambil Sendiri</span>
            </button>
            <button
              onClick={() => setDeliveryType('dine_in')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                deliveryType === 'dine_in'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Makan di Tempat</span>
            </button>
          </div>

          {/* CUSTOMER LOYALTY PROGRAM BANNER & MEMBER WIDGET */}
          <div className="mt-3.5 pt-3 border-t border-stone-200">
            {activeMember ? (
              <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white rounded-2xl p-3.5 border border-amber-500/30 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
                      <Crown className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-amber-100">{activeMember.name}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {activeMember.tier} Member
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-300">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          {activeMember.points} Poin
                        </span>
                        <span className="text-stone-500">·</span>
                        <span className="text-stone-400 text-[11px]">{activeMember.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowRewardsCatalog(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Tukar ({storeRewards.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLoyaltyModal(true)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-all cursor-pointer"
                      title="Kartu Member Digital"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </div>

                {appliedReward && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reward terpasang: <strong>{appliedReward.title}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedReward(null)}
                      className="text-stone-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-3 border border-amber-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-amber-950">
                          Program Poin Loyalitas {store.name}
                        </span>
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-900">
                          1 Poin / Rp 1.000
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 mt-0.5 leading-tight">
                        Kumpulkan poin setiap transaksi & tukarkan voucher diskon atau menu gratis.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setShowLoyaltyModal(true)}
                      className="text-[11px] font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Cek Poin
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRewardsCatalog(true)}
                      className="text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Gift className="w-3 h-3" />
                      <span>Katalog Hadiah ({storeRewards.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Product Search Bar */}
        <div className="p-4 bg-white border-b border-stone-200 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu favorit (kopi, ayam geprek, roti, dll)..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-100 hover:bg-stone-100/80 focus:bg-white text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm font-medium rounded-xl border border-transparent focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Chips or Search Feedback */}
          {searchQuery ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                Ditemukan <strong className="text-amber-700 font-bold">{filteredProducts.length}</strong> menu untuk "{searchQuery}"
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-stone-500 no-scrollbar py-0.5">
              <span className="shrink-0 text-stone-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Cepat cari:
              </span>
              {['Es Kopi', 'Ayam Geprek', 'Toast', 'Croissant', 'Matcha'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSearchQuery(chip)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-stone-600 rounded-lg shrink-0 border border-stone-200/80 transition-all font-medium active:scale-95 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-stone-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'all', label: 'Semua Menu' },
            { id: 'kopi', label: 'Kopi & Minuman' },
            { id: 'makanan', label: 'Makanan Utama' },
            { id: 'bakery', label: 'Bakery & Toast' },
          ].map((cat) => {
            const count = storeProducts.filter((p) => {
              const matchesCat =
                cat.id === 'all'
                  ? true
                  : cat.id === 'kopi'
                  ? p.category === 'kopi' || p.category === 'minuman'
                  : p.category === cat.id;
              return matchesCat && isProductMatch(p, trimmedQuery);
            }).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat.label}</span>
                {trimmedQuery && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat.id
                        ? 'bg-stone-700 text-stone-200'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Product Cards List */}
        <div className="p-4 space-y-3 flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-12 px-6 text-center bg-white rounded-2xl border border-stone-200/80 shadow-2xs my-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <SearchX className="w-7 h-7" />
              </div>
              <div className="max-w-xs mx-auto space-y-1">
                <h3 className="font-bold text-stone-900 text-base">Menu Tidak Ditemukan</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Tidak ada menu yang cocok dengan kata kunci{' '}
                  <span className="font-semibold text-stone-800 font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                    "{searchQuery}"
                  </span>
                  {selectedCategory !== 'all' && ` di kategori ${selectedCategory}`}
                </p>
              </div>

              {/* If there are matches in other categories */}
              {selectedCategory !== 'all' && totalMatchesAcrossCategories > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left sm:text-center">
                  <p className="font-medium">
                    Ditemukan <strong>{totalMatchesAcrossCategories}</strong> menu dengan kata kunci ini di kategori lain!
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Lihat di Semua Menu
                  </button>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Pencarian</span>
                  </button>
                )}
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Tampilkan Semua Kategori
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100">
                <p className="text-[11px] text-stone-400 mb-2">Coba kata kunci populer berikut:</p>
                <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                  {['Kopi', 'Ayam', 'Roti', 'Matcha', 'Teh'].map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery(suggested);
                      }}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 text-[11px] rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs flex gap-3.5 items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-stone-900 text-sm leading-snug">
                    {renderHighlightedText(product.name, trimmedQuery)}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {renderHighlightedText(product.description, trimmedQuery)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-extrabold text-amber-700 text-sm">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    {product.variants && product.variants.length > 0 && (
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                        Ada pilihan varian
                      </span>
                    )}
                  </div>
                </div>

              <div className="relative shrink-0 flex flex-col items-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border border-stone-100 bg-stone-100"
                />
                <button
                  onClick={() => handleOpenProductModal(product)}
                  disabled={!product.isAvailable}
                  className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{product.isAvailable ? 'Tambah' : 'Habis'}</span>
                </button>
              </div>
            </div>
          )))}
        </div>

        {/* Footer info inside store */}
        <div className="p-4 text-center text-xs text-stone-400 border-t border-stone-200">
          <p>Didukung oleh platform PesanKuliner</p>
          <p className="text-[11px] mt-0.5">0% Komisi · Pesanan Langsung Masuk ke Akun Admin Toko</p>
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-4 max-w-xl mx-auto pointer-events-none">
          <button
            onClick={() => setShowCheckoutDrawer(true)}
            className="w-full pointer-events-auto bg-stone-900 hover:bg-stone-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm transition-transform active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <span>
                Lihat Pesanan (
                {deliveryType === 'delivery'
                  ? 'Delivery'
                  : deliveryType === 'dine_in'
                  ? `Makan di Tempat · ${tableNumber}`
                  : 'Ambil Sendiri'}
                )
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">Rp {cartTotal.toLocaleString('id-ID')}</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </div>
          </button>
        </div>
      )}

      {/* MODAL: CUSTOMIZE PRODUCT VARIANTS */}
      {activeProductForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActiveProductForModal(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <img
                src={activeProductForModal.imageUrl}
                alt={activeProductForModal.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-bold text-stone-900 text-sm truncate">
                  {activeProductForModal.name}
                </h3>
                <p className="font-extrabold text-amber-700 text-xs">
                  Rp {activeProductForModal.price.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Variants options list */}
            <div className="overflow-y-auto py-3 space-y-4 flex-1 text-xs">
              {activeProductForModal.variants?.map((variant) => (
                <div key={variant.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">{variant.name}</span>
                    <span className="text-[10px] text-stone-400">Pilih salah satu</span>
                  </div>
                  <div className="space-y-1.5">
                    {variant.options.map((opt) => {
                      const isSelected = selectedVariants[variant.name]?.label === opt.label;
                      return (
                        <div
                          key={opt.label}
                          onClick={() =>
                            setSelectedVariants({
                              ...selectedVariants,
                              [variant.name]: opt,
                            })
                          }
                          className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 font-bold text-stone-900'
                              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="text-amber-800 text-[11px]">
                            {opt.priceDelta > 0
                              ? `+Rp ${opt.priceDelta.toLocaleString('id-ID')}`
                              : 'Gratis'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity selector */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="font-bold text-stone-800">Jumlah Pesanan:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to cart CTA */}
            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={handleAddToCartFromModal}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-between px-4 transition-all"
              >
                <span>Masukkan ke Keranjang</span>
                <span>Rp {calculateModalItemPrice().toLocaleString('id-ID')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT DRAWER / MODAL */}
      {showCheckoutDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white rounded-t-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Rincian & Checkout Pesanan</h3>
                <p className="text-xs text-stone-500">
                  {deliveryType === 'delivery'
                    ? 'Antar langsung ke alamat (Google Maps)'
                    : deliveryType === 'dine_in'
                    ? `Makan di Tempat (${tableNumber})`
                    : 'Ambil sendiri di toko'}
                </p>
              </div>
              <button
                onClick={() => setShowCheckoutDrawer(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="overflow-y-auto py-3 space-y-4 flex-1 text-xs">
              {/* Items in Cart */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <p className="font-bold text-stone-700">Daftar Menu ({cart.length} item):</p>
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-stone-800 pb-2 border-b border-stone-200/50 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold">
                        {item.quantity}x {item.product.name}
                      </span>
                      <p className="text-[11px] text-stone-500">
                        {Object.values(item.selectedVariants)
                          .map((v) => v.label)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        Rp {item.totalItemPrice.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(idx)}
                        className="text-stone-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Contact */}
              <div className="space-y-3">
                <p className="font-bold text-stone-900 text-sm">Informasi Pemesan</p>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 font-semibold text-xs">
                      Nomor WhatsApp / HP Kontak *
                    </label>
                    {activeMember ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600" />
                        Member {activeMember.tier}: {activeMember.points} Poin
                      </span>
                    ) : customerPhone.trim() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        +15 Poin Bonus Member Baru
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081299887766"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono outline-none focus:border-amber-600"
                  />
                  {activeMember && (
                    <p className="text-[11px] text-amber-800 mt-1 font-medium">
                      Hai <strong>{activeMember.name}</strong>! Saldo poinmu: <strong>{activeMember.points} Poin</strong>. Kamu bisa tukarkan hadiah di bawah!
                    </p>
                  )}
                </div>

                {/* Dine-in Option: Table Number Selection */}
                {deliveryType === 'dine_in' && (
                  <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
                        <span>Pilih Nomor Meja Makan di Tempat *</span>
                      </label>
                      <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        {tableNumber}
                      </span>
                    </div>

                    {/* Quick Table Number Chips */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {[
                        'Meja 01',
                        'Meja 02',
                        'Meja 03',
                        'Meja 04',
                        'Meja 05',
                        'Meja 06',
                        'Meja 07',
                        'Meja 08',
                        'Meja 09',
                        'Meja 10',
                        'Meja 11',
                        'Meja 12',
                      ].map((tbl) => (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => setTableNumber(tbl)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            tableNumber === tbl
                              ? 'bg-amber-600 border-amber-700 text-white shadow-xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400'
                          }`}
                        >
                          {tbl}
                        </button>
                      ))}
                    </div>

                    {/* Custom Table Location Text Input */}
                    <div className="pt-1">
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">
                        Atau tulis nomor meja / posisi duduk khusus:
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Contoh: Meja Outdoor 03, VIP Lt. 2, Meja Bar Pojok"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="text-[10px] text-stone-600 bg-white/90 p-2 rounded-xl border border-amber-100 flex items-center justify-between">
                      <span>🍽️ Pelayan cafe/resto akan langsung mengantar pesanan ke meja Anda.</span>
                      <span className="font-extrabold text-emerald-700">Ongkir Rp 0</span>
                    </div>
                  </div>
                )}

                {/* Delivery Option: Address + Real-Time Google Maps Distance Picker */}
                {deliveryType === 'delivery' && (
                  <>
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Alamat Lengkap Pengantaran *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan (misal: Pagar hitam depan musholla)"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-none focus:border-amber-600"
                      />
                    </div>

                    {/* Google Maps Distance Picker with Tiered Pricing */}
                    <GoogleMapsDeliveryPicker
                      store={store}
                      selectedDistanceKm={deliveryDistanceKm}
                      onDistanceChange={(km, snippet) => {
                        setDeliveryDistanceKm(km);
                        if (snippet && !deliveryAddress.trim()) {
                          setDeliveryAddress(snippet);
                        }
                      }}
                      currentAddress={deliveryAddress}
                      onAddressChange={setDeliveryAddress}
                    />
                  </>
                )}

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Contoh: Jangan terlalu manis / Sambal dipisah ya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm outline-none"
                  />
                </div>
              </div>

              {/* LOYALTY REWARD REDEMPTION IN DRAWER */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Tukar Poin Hadiah Loyalitas</span>
                  </div>
                  {activeMember ? (
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                      Poin Kamu: {activeMember.points}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-800">
                      Tersedia {storeRewards.length} Reward
                    </span>
                  )}
                </div>

                {appliedReward ? (
                  <div className="bg-white p-3 rounded-xl border border-emerald-300 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-stone-900">{appliedReward.title}</p>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            {appliedReward.pointsCost} Poin
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Potongan hemat: Rp {loyaltyDiscount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedReward(null)}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Batalkan Reward"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRewardsCatalog(true)}
                    className="w-full py-2.5 px-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {activeMember && activeMember.points >= 20
                        ? `Pilih & Tukar Reward (Saldo: ${activeMember.points} Poin)`
                        : `Lihat Katalog Reward (${storeRewards.length} Pilihan Hadiah)`}
                    </span>
                  </button>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <p className="font-bold text-stone-900 text-sm">Pilih Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-amber-50 border-amber-500 font-bold text-stone-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <QrCode className="w-4 h-4" />
                      <span className="font-bold">QRIS Instan</span>
                    </div>
                    <span className="text-[10px] text-stone-500">GoPay, BCA, OVO, ShopeePay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-50 border-amber-500 font-bold text-stone-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <Bike className="w-4 h-4" />
                      <span className="font-bold">Tunai COD</span>
                    </div>
                    <span className="text-[10px] text-stone-500">Bayar saat makanan tiba</span>
                  </button>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Menu:</span>
                  <span className="tabular-nums">Rp {cartSubtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>
                    Ongkir (
                    {deliveryType === 'delivery'
                      ? `Delivery ${deliveryDistanceKm} KM (Google Maps)`
                      : deliveryType === 'dine_in'
                      ? `Makan di Tempat (${tableNumber})`
                      : 'Ambil Sendiri'}
                    ):
                  </span>
                  <span className="tabular-nums font-semibold text-stone-900">
                    Rp {currentDeliveryFee.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Loyalty Reward Applied Discount Line */}
                {appliedReward && loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-100/70 px-2 py-1.5 rounded-lg border border-emerald-300">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-emerald-700" />
                      Diskon Reward ({appliedReward.title}):
                    </span>
                    <span className="tabular-nums">-Rp {loyaltyDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-900 font-bold text-sm pt-1.5 border-t border-stone-200">
                  <span>Total Pembayaran:</span>
                  <span className="text-amber-700 tabular-nums text-base">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Point Earning Notification */}
                <div className="mt-1 pt-1.5 border-t border-stone-200 flex items-center justify-between text-[11px] text-amber-900 font-medium">
                  <span className="flex items-center gap-1 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Poin yang akan diperoleh:
                  </span>
                  <span className="font-extrabold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                    +{pointsToEarn} Poin Loyalitas
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pesan Sekarang (Langsung Masuk ke Admin)</span>
                </button>
                <p className="text-[11px] text-stone-500 text-center mt-1.5 flex items-center justify-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pesanan langsung terkirim ke Akun Admin Toko & diproses secara instan (tanpa WhatsApp).</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER SUCCESS WITH POINTS CELEBRATION */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pesanan Berhasil Terkirim ke Admin
              </span>
              <h3 className="text-xl font-black text-stone-900 mt-2">
                Terima Kasih, {orderSuccess.customerName}!
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Nomor Pesanan: {orderSuccess.orderNumber}
              </p>
            </div>

            {/* Loyalty Points Earned Badge Box */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 p-4 rounded-2xl shadow-md text-left space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                      Poin Loyalitas Didapatkan
                    </p>
                    <p className="text-lg font-black text-stone-950">
                      +{orderSuccess.pointsEarned || pointsToEarn} Poin ⭐
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-white/30 px-2 py-0.5 rounded-full text-stone-900">
                  {orderSuccess.customerPhone}
                </span>
              </div>
              <p className="text-xs text-stone-900/90 leading-tight">
                Poin otomatis ditambahkan ke saldo nomor WhatsApp Anda dan dapat ditukarkan di pesanan berikutnya!
              </p>
              {orderSuccess.appliedReward && (
                <div className="pt-2 border-t border-amber-700/20 text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Reward digunakan: {orderSuccess.appliedReward.title} (-Rp {orderSuccess.appliedReward.discountAmount.toLocaleString('id-ID')})</span>
                </div>
              )}
            </div>

            {/* QRIS Display if selected */}
            {orderSuccess.paymentMethod === 'qris' && (
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-center space-y-2">
                <p className="text-xs font-bold text-stone-900">Scan QRIS Toko untuk Pembayaran:</p>
                <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-stone-300 shadow-xs flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-20 h-20 text-stone-900 mx-auto" />
                    <span className="text-[9px] font-bold text-stone-600 block mt-1">QRIS NASIONAL</span>
                  </div>
                </div>
                <p className="text-xs font-black text-amber-900 tabular-nums">
                  Nominal: Rp {orderSuccess.total.toLocaleString('id-ID')}
                </p>
              </div>
            )}

            {/* Action Buttons: Direct to Admin Dashboard */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  onOpenAdmin();
                }}
                className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Masuk ke Akun Admin Toko (Lihat Pesanan Masuk)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2.5 text-stone-600 hover:text-stone-900 text-xs font-semibold cursor-pointer"
              >
                Tetap di Halaman Toko & Pesan Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REWARDS CATALOG MODAL */}
      {showRewardsCatalog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">
                    Katalog Hadiah & Tukar Poin
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tukarkan poin loyalitas Anda dengan diskon & menu lezat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRewardsCatalog(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Points Banner in Catalog */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between text-xs">
              <div>
                <p className="text-[11px] text-stone-400">Saldo Poin Anda Saat Ini:</p>
                <p className="text-base font-black text-amber-400">
                  {activeMember ? `${activeMember.points} Poin ⭐ (${activeMember.tier} Member)` : 'Belum memasukkan No. HP'}
                </p>
              </div>
              {!activeMember && (
                <button
                  type="button"
                  onClick={() => {
                    setShowRewardsCatalog(false);
                    setShowLoyaltyModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all"
                >
                  Cek Poin No. HP
                </button>
              )}
            </div>

            {/* Rewards List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {storeRewards.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-sm">
                  Belum ada reward aktif saat ini.
                </div>
              ) : (
                storeRewards.map((reward) => {
                  const hasEnoughPoints = activeMember ? activeMember.points >= reward.pointsCost : false;
                  const isSelected = appliedReward?.id === reward.id;

                  return (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200'
                          : 'border-stone-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-stone-900">
                              {reward.title}
                            </span>
                            {reward.badgeLabel && (
                              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                {reward.badgeLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {reward.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-bold pt-1">
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {reward.pointsCost} Poin
                            </span>
                            <span className="text-stone-500 text-[11px]">
                              {reward.rewardType === 'discount_amount'
                                ? `Potongan Rp ${reward.discountValue.toLocaleString('id-ID')}`
                                : reward.rewardType === 'discount_percent'
                                ? `Diskon ${reward.discountValue}%`
                                : reward.rewardType === 'free_delivery'
                                ? 'Gratis Ongkir'
                                : `Menu Gratis: ${reward.freeProductTitle || 'Menu'}`}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 self-center">
                          {isSelected ? (
                            <button
                              type="button"
                              onClick={() => setAppliedReward(null)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Terpasang</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={Boolean(activeMember && !hasEnoughPoints)}
                              onClick={() => {
                                setAppliedReward(reward);
                                setShowRewardsCatalog(false);
                                if (cart.length > 0) {
                                  setShowCheckoutDrawer(true);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                !activeMember
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : hasEnoughPoints
                                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-xs'
                                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              }`}
                            >
                              {!activeMember
                                ? 'Pilih Reward'
                                : hasEnoughPoints
                                ? 'Tukar & Pakai'
                                : `Kurang ${reward.pointsCost - (activeMember.points || 0)} Poin`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
              <span>* Poin akan dipotong saat pesanan dibuat</span>
              <button
                type="button"
                onClick={() => setShowRewardsCatalog(false)}
                className="font-bold text-stone-700 hover:text-stone-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DIGITAL LOYALTY MEMBER CARD & PHONE LOOKUP */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden space-y-4">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  Kartu Member Loyalitas {store.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLoyaltyModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 space-y-4">
              {/* Phone lookup input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Cek Status / Masukkan Nomor WhatsApp Anda:
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={lookupPhone}
                    onChange={(e) => {
                      setLookupPhone(e.target.value);
                      if (!customerPhone) setCustomerPhone(e.target.value);
                    }}
                    placeholder="Contoh: 081234567890"
                    className="flex-1 px-3.5 py-2.5 bg-stone-100 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (lookupPhone) setCustomerPhone(lookupPhone);
                    }}
                    className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    Periksa
                  </button>
                </div>
              </div>

              {/* Digital VIP Membership Card */}
              <div className="bg-gradient-to-tr from-amber-950 via-stone-900 to-amber-900 text-white rounded-2xl p-5 border border-amber-500/40 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      VIP Culinary Member
                    </p>
                    <p className="font-black text-sm text-amber-100">{store.name}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                    {activeMember ? `${activeMember.tier} TIER` : 'MEMBER BARU'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-stone-400">Nama Pemegang:</p>
                    <p className="font-extrabold text-base text-white">
                      {activeMember ? activeMember.name : (customerName || 'Pelanggan Setia')}
                    </p>
                    <p className="text-[11px] font-mono text-amber-300/80 mt-0.5">
                      {activeMember ? activeMember.phone : (customerPhone || lookupPhone || 'No. HP Terdaftar')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-stone-400">Total Saldo:</p>
                    <p className="text-2xl font-black text-amber-400 tabular-nums">
                      {activeMember ? activeMember.points : 15}
                    </p>
                    <p className="text-[10px] text-stone-400">Poin Loyalitas ⭐</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-300">
                  <span>1 Poin didapat tiap Rp 1.000 belanja</span>
                  <span className="font-mono">PesanKuliner Indonesia</span>
                </div>
              </div>

              {/* Tier Breakdown Perks */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-2">
                <p className="font-bold text-stone-800">Tingkatan Tier & Keuntungan:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-amber-800">🥉 Bronze (0 - 99 Poin)</span>
                    <p className="text-stone-500 text-[10px] mt-0.5">Kumpulkan poin & tukar voucher potongan harga</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-slate-700">🥈 Silver (100+ Poin)</span>
                    <p className="text-stone-500 text-[10px] mt-0.5">Akses voucher gratis ongkir & snack gratis</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-amber-600">🥇 Gold (250+ Poin)</span>
                    <p className="text-stone-500 text-[10px] mt-0.5">Diskon 20% menu & promo eksklusif member</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-purple-700">💎 Platinum (500+ Poin)</span>
                    <p className="text-stone-500 text-[10px] mt-0.5">Prioritas dapur & free hidangan spesial ulang tahun</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowLoyaltyModal(false);
                  setShowRewardsCatalog(true);
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Lihat Katalog Hadiah ({storeRewards.length} Reward)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
