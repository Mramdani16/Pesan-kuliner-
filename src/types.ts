export interface VariantOption {
  label: string;
  priceDelta: number;
}

export interface ProductVariant {
  name: string;
  required: boolean;
  options: VariantOption[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: 'kopi' | 'makanan' | 'bakery' | 'minuman';
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  variants?: ProductVariant[];
}

export interface DeliveryPricingConfig {
  baseFirstKmFee: number; // default: 5000 (Kilometer Awal)
  secondKmFee: number; // default: 3000 (Kilometer ke-2)
  subsequentKmFee: number; // default: 2000 (Kilometer ke-3 dan seterusnya Flat/KM)
}

// Helper to calculate tiered delivery fee
export const calculateTieredDeliveryFee = (
  distanceKm: number,
  pricing?: Partial<DeliveryPricingConfig>
): { fee: number; distance: number; breakdown: string } => {
  const firstKm = pricing?.baseFirstKmFee ?? 5000;
  const secondKm = pricing?.secondKmFee ?? 3000;
  const nextKm = pricing?.subsequentKmFee ?? 2000;

  if (distanceKm <= 0) {
    return { fee: 0, distance: 0, breakdown: 'Ambil Sendiri di Toko (Rp 0)' };
  }

  // Rounded up to nearest whole kilometer for delivery pricing
  const km = Math.max(1, Math.ceil(distanceKm));

  if (km === 1) {
    return {
      fee: firstKm,
      distance: 1,
      breakdown: `1 KM pertama: Rp ${firstKm.toLocaleString('id-ID')}`,
    };
  }

  if (km === 2) {
    const fee = firstKm + secondKm;
    return {
      fee,
      distance: 2,
      breakdown: `KM 1 (Rp ${firstKm.toLocaleString('id-ID')}) + KM 2 (Rp ${secondKm.toLocaleString('id-ID')})`,
    };
  }

  // km >= 3: First KM + Second KM + (km - 2) * nextKm
  const extraKm = km - 2;
  const fee = firstKm + secondKm + extraKm * nextKm;
  return {
    fee,
    distance: km,
    breakdown: `KM 1-2 (Rp ${(firstKm + secondKm).toLocaleString('id-ID')}) + ${extraKm} KM x Rp ${nextKm.toLocaleString('id-ID')}`,
  };
};

export interface LoyaltyProgramConfig {
  isActive: boolean;
  pointsPerAmount: number; // e.g. 1 point per Rp 1.000 spent (default)
  minRedeemPoints: number; // minimum points required for redemption
  newMemberBonusPoints: number; // welcome bonus points upon registration
}

export interface LoyaltyReward {
  id: string;
  storeId: string;
  title: string;
  description: string;
  pointsCost: number;
  rewardType: 'discount_amount' | 'discount_percent' | 'free_product' | 'free_delivery';
  discountValue: number; // e.g. Rp 10.000 or 15%
  freeProductTitle?: string;
  isAvailable: boolean;
  badgeLabel?: string;
}

export interface LoyaltyMember {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  points: number;
  lifetimePoints: number;
  totalSpent: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinedAt: string;
  lastTransactionAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  category: 'cafe' | 'resto' | 'bakery' | 'umkm';
  categoryLabel: string;
  logoUrl: string;
  whatsapp: string;
  address: string;
  city: string;
  openingHours: string;
  email: string;
  deliveryFee: number; // base fallback fee
  deliveryRadiusKm: number;
  deliveryPricing?: DeliveryPricingConfig; // Tiered delivery fee system
  loyaltyConfig?: LoyaltyProgramConfig; // Loyalty reward configuration
  minOrder: number;
  isQrisActive: boolean;
  isCodActive: boolean;
  plan: 'free' | 'pro';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants: { [variantName: string]: VariantOption };
  totalItemPrice: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantSummary: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'delivery' | 'takeaway' | 'dine_in';
  tableNumber?: string;
  deliveryAddress: string;
  deliveryDistanceKm?: number;
  deliveryBreakdown?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'qris' | 'cod';
  status: 'new' | 'cooking' | 'delivering' | 'completed' | 'cancelled';
  pointsEarned?: number;
  appliedReward?: {
    rewardId: string;
    title: string;
    discountAmount: number;
    pointsCost: number;
  };
  createdAt: string;
}

// Sample initial stores for demo
export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Kopi & Toast Senja',
    slug: 'kopi-toast-senja',
    category: 'cafe',
    categoryLabel: 'Cafe & Coffee Shop',
    logoUrl: '/src/assets/images/cafe_kopi_aren_1794352693498.jpg',
    whatsapp: '081234567890',
    address: 'Jl. Gandaria Tengah II No. 14, Kebayoran Baru',
    city: 'Jakarta Selatan',
    openingHours: '08:00 - 22:00 WIB',
    email: 'senjakopi@gmail.com',
    deliveryFee: 5000,
    deliveryRadiusKm: 6,
    deliveryPricing: {
      baseFirstKmFee: 5000,
      secondKmFee: 3000,
      subsequentKmFee: 2000,
    },
    loyaltyConfig: {
      isActive: true,
      pointsPerAmount: 1000,
      minRedeemPoints: 20,
      newMemberBonusPoints: 15,
    },
    minOrder: 20000,
    isQrisActive: true,
    isCodActive: true,
    plan: 'free',
    createdAt: '2026-11-01',
  },
  {
    id: 'store-2',
    name: 'Ayam Geprek Sambal Korek Mas Dwi',
    slug: 'geprek-mas-dwi',
    category: 'resto',
    categoryLabel: 'Warung Makan & Resto',
    logoUrl: '/src/assets/images/food_ayam_geprek_1794352693423.jpg',
    whatsapp: '081398765432',
    address: 'Jl. Kaliurang KM 5.2, Pogung Baru',
    city: 'Yogyakarta',
    openingHours: '10:00 - 21:30 WIB',
    email: 'masdwi.kuliner@gmail.com',
    deliveryFee: 5000,
    deliveryRadiusKm: 5,
    deliveryPricing: {
      baseFirstKmFee: 5000,
      secondKmFee: 3000,
      subsequentKmFee: 2000,
    },
    minOrder: 15000,
    isQrisActive: true,
    isCodActive: true,
    plan: 'pro',
    createdAt: '2026-10-25',
  },
  {
    id: 'store-3',
    name: 'Roti & Pastry Dapur Nyonya',
    slug: 'roti-dapur-nyonya',
    category: 'bakery',
    categoryLabel: 'Bakery & Usaha Rumahan',
    logoUrl: '/src/assets/images/bakery_toast_pastry_1794352694749.jpg',
    whatsapp: '082155443322',
    address: 'Jl. Riau No. 88, Citarum',
    city: 'Bandung',
    openingHours: '07:30 - 20:00 WIB',
    email: 'dapurnyonya.bdg@gmail.com',
    deliveryFee: 5000,
    deliveryRadiusKm: 8,
    deliveryPricing: {
      baseFirstKmFee: 5000,
      secondKmFee: 3000,
      subsequentKmFee: 2000,
    },
    minOrder: 30000,
    isQrisActive: true,
    isCodActive: true,
    plan: 'free',
    createdAt: '2026-11-05',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Store 1 Products (Cafe)
  {
    id: 'prod-1',
    storeId: 'store-1',
    name: 'Es Kopi Susu Gula Aren Senja',
    category: 'kopi',
    price: 18000,
    description: 'Espresso double shot blend robusta-arabika pilihan dengan susu segar dan gula aren organik cair khas Senja.',
    imageUrl: '/src/assets/images/cafe_kopi_aren_1794352693498.jpg',
    isAvailable: true,
    variants: [
      {
        name: 'Ukuran',
        required: true,
        options: [
          { label: 'Regular (12oz)', priceDelta: 0 },
          { label: 'Large (16oz)', priceDelta: 4000 },
          { label: 'Literan (1 Liter)', priceDelta: 52000 },
        ],
      },
      {
        name: 'Tingkat Manis & Es',
        required: true,
        options: [
          { label: 'Normal (100%)', priceDelta: 0 },
          { label: 'Less Sugar (50%)', priceDelta: 0 },
          { label: 'No Sugar', priceDelta: 0 },
        ],
      },
      {
        name: 'Tambahan Topping',
        required: false,
        options: [
          { label: 'Tanpa Topping', priceDelta: 0 },
          { label: 'Extra Espresso Shot', priceDelta: 5000 },
          { label: 'Grass Jelly (Cincau)', priceDelta: 3000 },
        ],
      },
    ],
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    name: 'Roti Panggang Butter Kaya & Keju',
    category: 'bakery',
    price: 22000,
    description: 'Roti tawar tebal dipanggang renyah dengan lelehan unsalted butter, selai kaya Singapura, dan parutan keju cheddar melimpah.',
    imageUrl: '/src/assets/images/bakery_toast_pastry_1794352694749.jpg',
    isAvailable: true,
    variants: [
      {
        name: 'Tipe Roti',
        required: true,
        options: [
          { label: 'Roti Gandum Sehat', priceDelta: 2000 },
          { label: 'Roti Putih Classic', priceDelta: 0 },
        ],
      },
      {
        name: 'Extra Topping',
        required: false,
        options: [
          { label: 'Tanpa Tambahan', priceDelta: 0 },
          { label: 'Extra Keju Kraft', priceDelta: 4000 },
          { label: 'Taburan Cokelat Meses', priceDelta: 3000 },
        ],
      },
    ],
  },
  {
    id: 'prod-3',
    storeId: 'store-1',
    name: 'Artisan Butter Croissant',
    category: 'bakery',
    price: 24000,
    description: 'Pastry khas Perancis yang dipanggang segar setiap pagi dengan lapisan butter renyah di luar dan lembut di dalam.',
    imageUrl: '/src/assets/images/bakery_toast_pastry_1794352694749.jpg',
    isAvailable: true,
  },
  {
    id: 'prod-4',
    storeId: 'store-1',
    name: 'Matcha Uji Latte Dingin',
    category: 'minuman',
    price: 24000,
    description: 'Bubuk matcha impor dari Uji Kyoto dipadukan dengan fresh milk creamy dan sedikit sentuhan vanilla.',
    imageUrl: '/src/assets/images/cafe_kopi_aren_1794352693498.jpg',
    isAvailable: true,
  },

  // Store 2 Products (Resto / Warung)
  {
    id: 'prod-5',
    storeId: 'store-2',
    name: 'Paket Ayam Geprek Sambal Korek + Nasi',
    category: 'makanan',
    price: 23000,
    description: 'Ayam krispi renyah digeprek dengan sambal korek bawang asli cabe rawit merah segar, lengkap dengan nasi hangat & timun.',
    imageUrl: '/src/assets/images/food_ayam_geprek_1794352693423.jpg',
    isAvailable: true,
    variants: [
      {
        name: 'Level Kepedasan',
        required: true,
        options: [
          { label: 'Level 1 (Cabe 3)', priceDelta: 0 },
          { label: 'Level 2 Sedang (Cabe 6)', priceDelta: 0 },
          { label: 'Level 3 Pedas (Cabe 10)', priceDelta: 2000 },
          { label: 'Level 5 Nampol (Cabe 20)', priceDelta: 4000 },
        ],
      },
      {
        name: 'Pilihan Bagian Ayam',
        required: true,
        options: [
          { label: 'Paha Atas / Dada', priceDelta: 2000 },
          { label: 'Paha Bawah', priceDelta: 0 },
          { label: 'Sayap', priceDelta: -2000 },
        ],
      },
      {
        name: 'Tambahan Lauk',
        required: false,
        options: [
          { label: 'Tanpa Tambahan', priceDelta: 0 },
          { label: 'Tahu & Tempe Goreng', priceDelta: 4000 },
          { label: 'Telur Dadar Krispi', priceDelta: 5000 },
          { label: 'Keju Mozzarella Bakar', priceDelta: 7000 },
        ],
      },
    ],
  },
  {
    id: 'prod-6',
    storeId: 'store-2',
    name: 'Nasi Goreng Spesial Babat & Telur',
    category: 'makanan',
    price: 27000,
    description: 'Nasi goreng harum beraroma smoky dengan potongan babat empuk, suwiran ayam, bakso sapi, dan telur ceplok mata sapi.',
    imageUrl: '/src/assets/images/hero_indonesian_cafe_1794352692880.jpg',
    isAvailable: true,
  },
  {
    id: 'prod-7',
    storeId: 'store-2',
    name: 'Es Teh Manis Jumbo Melati',
    category: 'minuman',
    price: 5000,
    description: 'Seduhan teh melati tradisional dengan gula tebu asli, disajikan dingin segar dalam gelas jumbo.',
    imageUrl: '/src/assets/images/cafe_kopi_aren_1794352693498.jpg',
    isAvailable: true,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#PK-8821',
    storeId: 'store-1',
    customerName: 'Bima Satria',
    customerPhone: '081299887766',
    deliveryType: 'delivery',
    deliveryAddress: 'Jl. Kramat Pela No. 42, Kebayoran Baru (Pagar Abu-abu)',
    notes: 'Tolong es dipisah ya mas, terima kasih',
    items: [
      {
        productId: 'prod-1',
        productName: 'Es Kopi Susu Gula Aren Senja',
        variantSummary: 'Large (16oz) · Less Sugar · Extra Espresso',
        price: 27000,
        quantity: 2,
      },
      {
        productId: 'prod-2',
        productName: 'Roti Panggang Butter Kaya & Keju',
        variantSummary: 'Roti Putih Classic · Extra Keju',
        price: 26000,
        quantity: 1,
      },
    ],
    subtotal: 80000,
    deliveryFee: 8000,
    total: 88000,
    paymentMethod: 'qris',
    status: 'cooking',
    createdAt: '10 menit yang lalu',
  },
  {
    id: 'ord-102',
    orderNumber: '#PK-8820',
    storeId: 'store-1',
    customerName: 'Anisa Maharani',
    customerPhone: '081311223344',
    deliveryType: 'takeaway',
    deliveryAddress: 'Ambil di Toko',
    items: [
      {
        productId: 'prod-3',
        productName: 'Artisan Butter Croissant',
        variantSummary: 'Original',
        price: 24000,
        quantity: 3,
      },
      {
        productId: 'prod-4',
        productName: 'Matcha Uji Latte Dingin',
        variantSummary: 'Dingin Normal',
        price: 24000,
        quantity: 1,
      },
    ],
    subtotal: 96000,
    deliveryFee: 0,
    total: 96000,
    paymentMethod: 'cod',
    status: 'delivering',
    createdAt: '35 menit yang lalu',
  },
  {
    id: 'ord-103',
    orderNumber: '#PK-8819',
    storeId: 'store-1',
    customerName: 'Dimas Pratama',
    customerPhone: '085712345678',
    deliveryType: 'delivery',
    deliveryAddress: 'Apartemen Pakubuwono Terrace Tower B Lt. 12 No. 08',
    items: [
      {
        productId: 'prod-1',
        productName: 'Es Kopi Susu Gula Aren Senja',
        variantSummary: 'Literan (1 Liter) · Normal',
        price: 70000,
        quantity: 1,
      },
    ],
    subtotal: 70000,
    deliveryFee: 8000,
    total: 78000,
    paymentMethod: 'qris',
    status: 'completed',
    createdAt: '2 jam yang lalu',
  },
  {
    id: 'ord-104',
    orderNumber: '#PK-8822',
    storeId: 'store-1',
    customerName: 'Reza Rahardian',
    customerPhone: '081288990011',
    deliveryType: 'dine_in',
    tableNumber: 'Meja 05',
    deliveryAddress: 'Makan di Tempat (Meja 05)',
    notes: 'Minta ekstra sedotan dan tisu ya kak',
    items: [
      {
        productId: 'prod-1',
        productName: 'Es Kopi Susu Gula Aren Senja',
        variantSummary: 'Regular (12oz) · Less Sugar (50%)',
        price: 18000,
        quantity: 2,
      },
      {
        productId: 'prod-2',
        productName: 'Roti Panggang Butter Kaya & Keju',
        variantSummary: 'Roti Putih Classic · Extra Keju Kraft',
        price: 26000,
        quantity: 1,
      },
    ],
    subtotal: 62000,
    deliveryFee: 0,
    total: 62000,
    paymentMethod: 'qris',
    status: 'cooking',
    createdAt: '5 menit yang lalu',
  },
];

export const INITIAL_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew-1',
    storeId: 'store-1',
    title: 'Voucher Diskon Rp 10.000',
    description: 'Potongan langsung Rp 10.000 untuk total pesanan menu favorit.',
    pointsCost: 50,
    rewardType: 'discount_amount',
    discountValue: 10000,
    isAvailable: true,
    badgeLabel: 'Paling Populer',
  },
  {
    id: 'rew-2',
    storeId: 'store-1',
    title: 'Gratis Ongkir Delivery',
    description: 'Bebas biaya pengantaran kurir toko untuk pesanan pesan antar.',
    pointsCost: 35,
    rewardType: 'free_delivery',
    discountValue: 8000,
    isAvailable: true,
    badgeLabel: 'Hemat Kirim',
  },
  {
    id: 'rew-3',
    storeId: 'store-1',
    title: 'Diskon 20% Minuman',
    description: 'Potongan harga 20% untuk subtotal produk makanan atau minuman.',
    pointsCost: 75,
    rewardType: 'discount_percent',
    discountValue: 20,
    isAvailable: true,
    badgeLabel: 'Hemat 20%',
  },
  {
    id: 'rew-4',
    storeId: 'store-1',
    title: 'Free 1x Roti Panggang Kaya',
    description: 'Klaim gratis 1 porsi Roti Panggang Butter Kaya & Keju renyah.',
    pointsCost: 100,
    rewardType: 'free_product',
    discountValue: 26000,
    freeProductTitle: 'Roti Panggang Butter Kaya & Keju',
    isAvailable: true,
    badgeLabel: 'Menu Gratis',
  },
];

export const INITIAL_MEMBERS: LoyaltyMember[] = [
  {
    id: 'mem-1',
    storeId: 'store-1',
    name: 'Budi Santoso',
    phone: '081234567890',
    points: 145,
    lifetimePoints: 345,
    totalSpent: 345000,
    tier: 'Gold',
    joinedAt: '12 Okt 2026',
    lastTransactionAt: 'Hari ini, 10:15 WIB',
  },
  {
    id: 'mem-2',
    storeId: 'store-1',
    name: 'Siti Rahma',
    phone: '081987654321',
    points: 80,
    lifetimePoints: 180,
    totalSpent: 180000,
    tier: 'Silver',
    joinedAt: '18 Okt 2026',
    lastTransactionAt: 'Kemarin, 14:20 WIB',
  },
  {
    id: 'mem-3',
    storeId: 'store-1',
    name: 'Dimas Pratama',
    phone: '085712345678',
    points: 40,
    lifetimePoints: 90,
    totalSpent: 90000,
    tier: 'Bronze',
    joinedAt: '01 Nov 2026',
    lastTransactionAt: '2 jam yang lalu',
  },
  {
    id: 'mem-4',
    storeId: 'store-1',
    name: 'Reza Rahardian',
    phone: '081288990011',
    points: 62,
    lifetimePoints: 162,
    totalSpent: 162000,
    tier: 'Silver',
    joinedAt: '05 Nov 2026',
    lastTransactionAt: '5 menit yang lalu',
  },
];
