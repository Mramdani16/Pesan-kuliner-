import React, { useState, useEffect, useRef } from 'react';
import {
  Store as StoreIcon,
  ShoppingBag,
  Clock,
  Bike,
  QrCode,
  BarChart3,
  Sliders,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  Phone,
  Printer,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  X,
  Calendar,
  Layers,
  Send,
  Radio,
  CheckCheck,
  Users,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sparkles,
  ChefHat,
  Bot,
  Play,
  MessageSquare,
  MessageCircle,
  FileSpreadsheet,
  FileText,
  Eye,
  UtensilsCrossed,
  Gift,
  Award,
  Crown,
  Coins,
  Star,
  Tag,
  Percent,
  Pencil,
  Trash2,
  UserPlus,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import {
  Store,
  Order,
  Product,
  ProductVariant,
  LoyaltyReward,
  LoyaltyMember,
  LoyaltyProgramConfig,
  calculateTieredDeliveryFee,
} from '../types';

// Browser-native AudioContext chime for incoming order bell
const playOrderChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (pleasant notification)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Second chime bell tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);
  } catch {
    // Non-fatal: AudioContext blocked until interaction
  }
};

// Reusable visual status badge for tables, reports, and modals
const renderOrderStatusBadge = (status: Order['status'], isCompact: boolean = false) => {
  switch (status) {
    case 'new':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wider ${
            isCompact
              ? 'text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 border border-rose-300'
              : 'text-xs bg-rose-100/90 text-rose-800 px-2.5 py-1 border border-rose-300 shadow-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse inline-block" />
          Pesanan Baru
        </span>
      );
    case 'cooking':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wider ${
            isCompact
              ? 'text-[10px] bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-xs bg-amber-100 text-amber-900 px-2.5 py-1 border border-amber-300 shadow-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Sedang Dimasak
        </span>
      );
    case 'delivering':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wider ${
            isCompact
              ? 'text-[10px] bg-sky-100 text-sky-900 border border-sky-300'
              : 'text-xs bg-sky-100 text-sky-900 px-2.5 py-1 border border-sky-300 shadow-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
          Pengantaran
        </span>
      );
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wider ${
            isCompact
              ? 'text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 border border-emerald-300 shadow-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
          Selesai
        </span>
      );
    case 'cancelled':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wider ${
            isCompact
              ? 'text-[10px] bg-stone-100 text-stone-700 border border-stone-300'
              : 'text-xs bg-stone-100 text-stone-700 px-2.5 py-1 border border-stone-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
          Dibatalkan
        </span>
      );
  }
};

interface DashboardAdminProps {
  store: Store;
  orders: Order[];
  products: Product[];
  rewards?: LoyaltyReward[];
  loyaltyMembers?: LoyaltyMember[];
  onAddReward?: (reward: LoyaltyReward) => void;
  onUpdateReward?: (reward: LoyaltyReward) => void;
  onDeleteReward?: (rewardId: string) => void;
  onToggleReward?: (rewardId: string) => void;
  onAdjustMemberPoints?: (phone: string, deltaPoints: number, reason?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onToggleProductAvailability: (productId: string) => void;
  onAddProduct: (product: Product) => void;
  onPlaceOrder?: (order: Order) => void;
  onViewCustomerStore: (slug: string) => void;
  onUpdateStoreSettings: (updatedStore: Store) => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  store,
  orders,
  products,
  rewards = [],
  loyaltyMembers = [],
  onAddReward,
  onUpdateReward,
  onDeleteReward,
  onToggleReward,
  onAdjustMemberPoints,
  onUpdateOrderStatus,
  onToggleProductAvailability,
  onAddProduct,
  onPlaceOrder,
  onViewCustomerStore,
  onUpdateStoreSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'reports' | 'whatsapp' | 'loyalty' | 'settings'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'new' | 'cooking' | 'delivering' | 'completed'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Loyalty Program State in Admin
  const storeRewards = rewards.filter((r) => r.storeId === store.id || r.storeId === 'store-1');
  const storeMembers = loyaltyMembers.filter((m) => m.storeId === store.id || m.storeId === 'store-1');

  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [rewardForm, setRewardForm] = useState<{
    title: string;
    description: string;
    pointsCost: number;
    rewardType: LoyaltyReward['rewardType'];
    discountValue: number;
    freeProductTitle: string;
    badgeLabel: string;
    isAvailable: boolean;
  }>({
    title: '',
    description: '',
    pointsCost: 50,
    rewardType: 'discount_amount',
    discountValue: 10000,
    freeProductTitle: '',
    badgeLabel: 'Populer',
    isAvailable: true,
  });

  const [showAdjustPointsModal, setShowAdjustPointsModal] = useState<LoyaltyMember | null>(null);
  const [adjustPointsDelta, setAdjustPointsDelta] = useState<number>(20);
  const [adjustPointsReason, setAdjustPointsReason] = useState<string>('Bonus loyalitas kasir');

  const [loyaltyConfigForm, setLoyaltyConfigForm] = useState<LoyaltyProgramConfig>({
    isActive: store.loyaltyConfig?.isActive ?? true,
    pointsPerAmount: store.loyaltyConfig?.pointsPerAmount ?? 1000,
    minRedeemPoints: store.loyaltyConfig?.minRedeemPoints ?? 20,
    newMemberBonusPoints: store.loyaltyConfig?.newMemberBonusPoints ?? 15,
  });
  const [savedLoyaltyNotice, setSavedLoyaltyNotice] = useState(false);

  // Real-time Incoming Order Alert & Toast states
  const [newOrderToast, setNewOrderToast] = useState<Order | null>(null);
  const [activeNewOrderModal, setActiveNewOrderModal] = useState<Order | null>(null);
  const [isSoundAlertActive, setIsSoundAlertActive] = useState<boolean>(true);
  const [isAutoModalAlert, setIsAutoModalAlert] = useState<boolean>(false);
  const prevOrdersRef = useRef<Order[]>(orders);
  const isInitialMount = useRef(true);

  // Monitor incoming orders in real-time
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevOrdersRef.current = orders;
      return;
    }

    const prevIds = new Set(prevOrdersRef.current.map((o) => o.id));
    const newIncoming = orders.filter((o) => !prevIds.has(o.id));

    if (newIncoming.length > 0) {
      const latestOrder = newIncoming[0];

      // Play chime sound if enabled
      if (isSoundAlertActive) {
        playOrderChime();
      }

      // Trigger Toast notification
      setNewOrderToast(latestOrder);

      // Trigger modal directly if store owner enabled auto-modal
      if (isAutoModalAlert) {
        setActiveNewOrderModal(latestOrder);
      }
    }

    prevOrdersRef.current = orders;
  }, [orders, isSoundAlertActive, isAutoModalAlert]);

  // Auto-dismiss toast notification after 9 seconds
  useEffect(() => {
    if (!newOrderToast) return;
    const timer = setTimeout(() => {
      setNewOrderToast(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [newOrderToast]);

  // Simulate an incoming live customer order for testing
  const handleSimulateIncomingOrder = () => {
    const sampleCustomers = [
      { name: 'Rizky Ramadhan', phone: '081234567890', address: 'Jl. Senopati No. 45, Kebayoran Baru' },
      { name: 'Siti Nurhaliza', phone: '081398765432', address: 'Apartemen Sudirman Tower Lt. 15 No. 8' },
      { name: 'Farhan Wicaksono', phone: '085711223344', address: 'Jl. Gandaria Tengah IV No. 12' },
      { name: 'Nabila Putri', phone: '082155443322', address: 'Jl. Kemang Timur Raya No. 27' },
      { name: 'Bagas Pratama', phone: '087812345678', address: 'Jl. Tebet Barat Dalam Raya No. 9' },
    ];
    const pickedCust = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const randType = Math.random();
    const simType: 'delivery' | 'dine_in' | 'takeaway' =
      randType < 0.45 ? 'delivery' : randType < 0.78 ? 'dine_in' : 'takeaway';
    const isDelivery = simType === 'delivery';
    const isDineIn = simType === 'dine_in';
    const simTableNum = isDineIn ? `Meja ${('0' + (Math.floor(Math.random() * 12) + 1)).slice(-2)}` : undefined;
    const orderNum = `#PK-${Math.floor(1000 + Math.random() * 9000)}`;

    const availableProds = products.length > 0 ? products : [];
    const p1 = availableProds[Math.floor(Math.random() * availableProds.length)];
    const p2 = availableProds[Math.floor(Math.random() * availableProds.length)];

    const items = [
      {
        productId: p1.id,
        productName: p1.name,
        variantSummary: p1.variants?.[0]?.options?.[0]?.label || 'Regular',
        price: p1.price,
        quantity: Math.floor(Math.random() * 2) + 1,
      },
    ];

    if (p2 && p2.id !== p1.id && Math.random() > 0.4) {
      items.push({
        productId: p2.id,
        productName: p2.name,
        variantSummary: p2.variants?.[0]?.options?.[0]?.label || 'Original',
        price: p2.price,
        quantity: 1,
      });
    }

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const simDistance = isDelivery ? Math.floor(Math.random() * 5) + 1 : 0; // 1 to 5 KM Google Maps
    const simTieredFee = isDelivery
      ? calculateTieredDeliveryFee(simDistance, store.deliveryPricing)
      : {
          fee: 0,
          distance: 0,
          breakdown: isDineIn ? `Makan di Tempat (${simTableNum})` : 'Ambil Sendiri di Toko (Rp 0)',
        };

    const fee = simTieredFee.fee;
    const total = subtotal + fee;

    const newSimulatedOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      storeId: store.id,
      customerName: pickedCust.name,
      customerPhone: pickedCust.phone,
      deliveryType: simType,
      tableNumber: simTableNum,
      deliveryAddress: isDelivery
        ? `${pickedCust.address} (±${simDistance} KM Google Maps)`
        : isDineIn
        ? `Makan di Tempat (${simTableNum})`
        : 'Ambil di Toko',
      deliveryDistanceKm: simDistance,
      deliveryBreakdown: simTieredFee.breakdown,
      notes: isDineIn
        ? 'Minta sambal & sedotan ekstra ya mas'
        : Math.random() > 0.5
        ? 'Tolong packing rapi ya kak, terima kasih!'
        : undefined,
      items,
      subtotal,
      deliveryFee: fee,
      total,
      paymentMethod: Math.random() > 0.35 ? 'qris' : 'cod',
      status: 'new',
      createdAt: 'Baru saja',
    };

    if (onPlaceOrder) {
      onPlaceOrder(newSimulatedOrder);
    }
  };
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  // New product form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'kopi' | 'makanan' | 'bakery' | 'minuman'>('makanan');
  const [newProductPrice, setNewProductPrice] = useState('25000');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [hasVariants, setHasVariants] = useState(true);

  // Settings form states (Tiered Delivery Pricing)
  const [deliveryRadius, setDeliveryRadius] = useState(store.deliveryRadiusKm);
  const [firstKmFee, setFirstKmFee] = useState<number>(store.deliveryPricing?.baseFirstKmFee ?? 5000);
  const [secondKmFee, setSecondKmFee] = useState<number>(store.deliveryPricing?.secondKmFee ?? 3000);
  const [subsequentKmFee, setSubsequentKmFee] = useState<number>(store.deliveryPricing?.subsequentKmFee ?? 2000);
  const [adminSimulatedKm, setAdminSimulatedKm] = useState<number>(3);
  const [isQrisActive, setIsQrisActive] = useState(store.isQrisActive);
  const [isCodActive, setIsCodActive] = useState(store.isCodActive);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Visualization Chart states (Recharts)
  const [chartView, setChartView] = useState<'both' | 'revenue' | 'orders'>('both');
  const [weeklyPeriod, setWeeklyPeriod] = useState<'current' | 'previous'>('current');

  // WhatsApp Business API & Broadcast states
  const [isAutoWaEnabled, setIsAutoWaEnabled] = useState(true);
  const [waTabSubView, setWaTabSubView] = useState<'auto-reminders' | 'broadcast' | 'api-settings'>('auto-reminders');
  const [waToast, setWaToast] = useState<string | null>(null);

  // Auto Reminder Message Templates
  const [waTemplates, setWaTemplates] = useState({
    new: 'Halo kak {{nama}}, pesananmu {{no_pesanan}} telah diterima oleh {{nama_toko}} dan segera kami proses! Total pembayaran: {{total}}. Pantau statusnya secara langsung di link toko kami.',
    cooking: 'Halo kak {{nama}}, kabar baik! Pesananmu {{no_pesanan}} sedang disiapkan dan dimasak hangat oleh dapur {{nama_toko}}. Mohon ditunggu ya! 🔥',
    delivering: 'Halo kak {{nama}}, pesananmu {{no_pesanan}} sudah selesai dikemas dan sekarang sedang diantar kurir kami menuju: {{alamat}}. Mohon standby ya! 🛵',
    completed: 'Pesanan {{no_pesanan}} telah tiba! Selamat menikmati sajian lezat dari {{nama_toko}}. Terima kasih banyak atas kunjungannya, kami tunggu pesanan berikutnya! ❤️',
  });

  // Broadcast Promotion states
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'weekly' | 'coffee' | 'food'>('all');
  const [broadcastTitle, setBroadcastTitle] = useState('Promo Spesial Weekend: Diskon 20% & Gratis Ongkir');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Halo Sahabat Kuliner! Ada kabar gembira khusus akhir pekan ini di {{nama_toko}} 🎉\n\nDapatkan DISKON 20% untuk semua menu favorit + GRATIS ONGKIR hingga radius 5 KM!\n\nKode Promo: *KULINERHEMAT*\nYuk pesan sekarang sebelum kehabisan menu favoritmu!'
  );
  const [broadcastButtonText, setBroadcastButtonText] = useState('Buka Menu & Pesan Sekarang');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastSuccessNotice, setBroadcastSuccessNotice] = useState<string | null>(null);

  // Broadcast campaign history
  const [broadcastHistory, setBroadcastHistory] = useState([
    {
      id: 'bc-1',
      title: 'Flash Sale Jumat Berkah Kopi & Camilan',
      target: 'Semua Pelanggan (234 kontak)',
      sentAt: 'Jumat lalu, 11:30 WIB',
      sentCount: 234,
      deliveredRate: '99.1%',
      readRate: '88.5%',
      status: 'success',
    },
    {
      id: 'bc-2',
      title: 'Peluncuran Menu Baru Croissant & Aren Latte',
      target: 'Pelanggan Kategori Kopi (142 kontak)',
      sentAt: '3 hari yang lalu',
      sentCount: 142,
      deliveredRate: '98.6%',
      readRate: '91.2%',
      status: 'success',
    },
  ]);

  // WhatsApp Business API Config
  const [wabaId, setWabaId] = useState('109845729182374');
  const [phoneNumberId, setPhoneNumberId] = useState('6281234567890');
  const [apiToken, setApiToken] = useState('EAAG...MetaCloudAPI_Prod_Active');
  const [isApiConnected, setIsApiConnected] = useState(true);

  // Quick WhatsApp manual reminder modal state
  const [selectedOrderForWaModal, setSelectedOrderForWaModal] = useState<Order | null>(null);

  // Helper for Order Status change with automatic WhatsApp reminder
  const handleStatusChangeWithWa = (order: Order, newStatus: Order['status']) => {
    onUpdateOrderStatus(order.id, newStatus);
    if (isAutoWaEnabled) {
      const statusLabels: Record<string, string> = {
        cooking: 'Sedang Dimasak',
        delivering: 'Dalam Pengiriman Kurir',
        completed: 'Selesai & Diterima',
      };
      setWaToast(
        `✓ Notifikasi WhatsApp Business API terkirim otomatis ke ${order.customerName} (${order.customerPhone}): Status "${statusLabels[newStatus]}"`
      );
      setTimeout(() => setWaToast(null), 4500);
    }
  };

  // Helper to trigger broadcast
  const handleTriggerBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setBroadcastProgress(15);

    const targetCounts = {
      all: 234,
      weekly: 78,
      coffee: 142,
      food: 92,
    };
    const targetCount = targetCounts[broadcastTarget];

    const timer1 = setTimeout(() => setBroadcastProgress(55), 400);
    const timer2 = setTimeout(() => setBroadcastProgress(88), 800);
    const timer3 = setTimeout(() => {
      setBroadcastProgress(100);
      setIsBroadcasting(false);
      setBroadcastSuccessNotice(
        `Berhasil menyiarkan promosi via WhatsApp Business API ke ${targetCount} nomor pelanggan!`
      );

      const targetLabels = {
        all: `Semua Pelanggan (${targetCount} kontak)`,
        weekly: `Pelanggan Minggu Ini (${targetCount} kontak)`,
        coffee: `Pelanggan Kategori Kopi (${targetCount} kontak)`,
        food: `Pelanggan Kategori Makanan (${targetCount} kontak)`,
      };

      setBroadcastHistory((prev) => [
        {
          id: `bc-${Date.now()}`,
          title: broadcastTitle,
          target: targetLabels[broadcastTarget],
          sentAt: 'Baru saja',
          sentCount: targetCount,
          deliveredRate: '100%',
          readRate: '94.2%',
          status: 'success',
        },
        ...prev,
      ]);

      setTimeout(() => setBroadcastSuccessNotice(null), 5000);
    }, 1200);
  };

  // Weekly analytics data (Senin - Minggu)
  const CURRENT_WEEK_DATA = [
    { day: 'Senin', shortDay: 'Sen', pendapatan: 540000, pesanan: 18, aov: 30000 },
    { day: 'Selasa', shortDay: 'Sel', pendapatan: 620000, pesanan: 21, aov: 29520 },
    { day: 'Rabu', shortDay: 'Rab', pendapatan: 750000, pesanan: 26, aov: 28840 },
    { day: 'Kamis', shortDay: 'Kam', pendapatan: 820000, pesanan: 29, aov: 28270 },
    { day: 'Jumat', shortDay: 'Jum', pendapatan: 1150000, pesanan: 39, aov: 29480 },
    { day: 'Sabtu', shortDay: 'Sab', pendapatan: 1680000, pesanan: 54, aov: 31110 },
    { day: 'Minggu', shortDay: 'Min', pendapatan: 1480000, pesanan: 47, aov: 31480 },
  ];

  const PREVIOUS_WEEK_DATA = [
    { day: 'Senin', shortDay: 'Sen', pendapatan: 450000, pesanan: 15, aov: 30000 },
    { day: 'Selasa', shortDay: 'Sel', pendapatan: 520000, pesanan: 18, aov: 28880 },
    { day: 'Rabu', shortDay: 'Rab', pendapatan: 610000, pesanan: 21, aov: 29040 },
    { day: 'Kamis', shortDay: 'Kam', pendapatan: 690000, pesanan: 24, aov: 28750 },
    { day: 'Jumat', shortDay: 'Jum', pendapatan: 990000, pesanan: 33, aov: 30000 },
    { day: 'Sabtu', shortDay: 'Sab', pendapatan: 1420000, pesanan: 46, aov: 30860 },
    { day: 'Minggu', shortDay: 'Min', pendapatan: 1280000, pesanan: 41, aov: 31210 },
  ];

  const activeWeeklyData = weeklyPeriod === 'current' ? CURRENT_WEEK_DATA : PREVIOUS_WEEK_DATA;
  const weeklyTotalRevenue = activeWeeklyData.reduce((acc, curr) => acc + curr.pendapatan, 0);
  const weeklyTotalOrders = activeWeeklyData.reduce((acc, curr) => acc + curr.pesanan, 0);
  const peakDay = [...activeWeeklyData].sort((a, b) => b.pendapatan - a.pendapatan)[0];

  const storeOrders = orders.filter((o) => o.storeId === store.id || o.storeId === 'store-1');
  const storeProducts = products.filter((p) => p.storeId === store.id || p.storeId === 'store-1');

  const filteredOrders = storeOrders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const copyStoreLink = () => {
    const link = `https://pesankuliner.id/${store.slug}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrintReceipt = (order: Order) => {
    setPrintNotice(`Struk pesanan ${order.orderNumber} berhasil dicetak ke printer Bluetooth thermal!`);
    setTimeout(() => setPrintNotice(null), 3000);
  };

  // State for formal Report Preview Modal
  const [showReportPreviewModal, setShowReportPreviewModal] = useState(false);

  // 1. GENERATE & DOWNLOAD CSV EXPORT
  const handleDownloadCSV = () => {
    try {
      const headers = [
        'No. Pesanan',
        'Waktu Pemesanan',
        'Nama Pelanggan',
        'No. WhatsApp',
        'Tipe Pengiriman',
        'Alamat Pengantaran',
        'Rincian Menu',
        'Subtotal (IDR)',
        'Ongkir (IDR)',
        'Total Transaksi (IDR)',
        'Metode Pembayaran',
        'Status Pesanan',
        'Catatan',
      ];

      const rows = storeOrders.map((ord) => [
        `"${ord.orderNumber}"`,
        `"${ord.createdAt}"`,
        `"${ord.customerName.replace(/"/g, '""')}"`,
        `"${ord.customerPhone}"`,
        `"${ord.deliveryType === 'dine_in' ? `Makan di Tempat (${ord.tableNumber || 'Meja'})` : ord.deliveryType === 'delivery' ? 'Delivery (Google Maps)' : 'Ambil Sendiri'}"`,
        `"${(ord.deliveryAddress || '-').replace(/"/g, '""')}"`,
        `"${ord.items.map((it) => `${it.quantity}x ${it.productName} (${it.variantSummary})`).join('; ').replace(/"/g, '""')}"`,
        ord.subtotal,
        ord.deliveryFee,
        ord.total,
        `"${ord.paymentMethod === 'qris' ? 'QRIS' : 'COD (Tunai)'}"`,
        `"${ord.status.toUpperCase()}"`,
        `"${(ord.notes || '-').replace(/"/g, '""')}"`,
      ]);

      // Add summary footer rows in CSV
      const summarySeparator = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
      const summaryRow1 = ['"RINGKASAN TOTAL"', '', '', '', '', '', '', totalRevenue, '', totalRevenue, '', `"${storeOrders.length} Order"`, ''];
      const summaryRow2 = ['"KOMISI PESANKULINER"', '', '', '', '', '', '', '0', '0', '0 (0% FEE)', '', '"100% UNTUK TOKO"', ''];

      const csvContent =
        '\uFEFF' +
        [
          headers.join(','),
          ...rows.map((r) => r.join(',')),
          summarySeparator.join(','),
          summaryRow1.join(','),
          summaryRow2.join(','),
        ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_Penjualan_${store.slug}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setWaToast(`✓ Berhasil mengunduh Laporan Penjualan format CSV (.csv) untuk ${store.name}!`);
      setTimeout(() => setWaToast(null), 4000);
    } catch (err) {
      console.error('CSV Export Error:', err);
      alert('Gagal mengekspor file CSV. Silakan coba kembali.');
    }
  };

  // 2. GENERATE & DOWNLOAD PDF EXPORT (jsPDF)
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner Background
      doc.setFillColor(28, 25, 23); // Stone-900
      doc.rect(0, 0, 210, 28, 'F');

      // Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('PESANKULINER - LAPORAN KEUANGAN & PENJUALAN', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(214, 211, 209);
      doc.text(
        `Toko: ${store.name.toUpperCase()}  |  Jenis: ${store.categoryLabel}  |  Kota: ${store.city}`,
        14,
        19
      );
      doc.text(`Waktu Cetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 14, 24);

      // Executive KPI Box
      doc.setFillColor(254, 243, 199); // Amber-100
      doc.setDrawColor(245, 158, 11); // Amber-500
      doc.roundedRect(14, 34, 182, 28, 3, 3, 'FD');

      doc.setTextColor(146, 64, 14); // Amber-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('RINGKASAN EKSEKUTIF OMZET & PESANAN', 20, 41);

      doc.setTextColor(28, 25, 23);
      doc.setFontSize(9.5);
      doc.text(`Total Omzet Tercatat: Rp ${totalRevenue.toLocaleString('id-ID')}`, 20, 49);
      doc.text(`Total Transaksi: ${storeOrders.length} Pesanan`, 88, 49);
      doc.text(`Pesanan Selesai: ${totalCompleted} Pesanan`, 142, 49);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Rata-rata Keranjang (AOV): Rp ${averageOrderValue.toLocaleString('id-ID')}`, 20, 56);
      doc.text(`Biaya Komisi Platform: Rp 0 (0% FEE)`, 88, 56);
      doc.text(`Hari Tersibuk: ${peakDay.day}`, 142, 56);

      // 1. Weekly Breakdown Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(28, 25, 23);
      doc.text('1. REKAP PENJUALAN MINGGUAN (HARI SENIN - MINGGU)', 14, 69);

      doc.setFillColor(231, 229, 228); // Stone-200
      doc.rect(14, 73, 182, 7, 'F');
      doc.setFontSize(8);
      doc.setTextColor(68, 64, 60);
      doc.text('Hari', 18, 78);
      doc.text('Volume Pesanan', 65, 78);
      doc.text('Rata-rata Order', 115, 78);
      doc.text('Total Pendapatan (IDR)', 155, 78);

      let currentY = 86;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      activeWeeklyData.forEach((item, index) => {
        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 249);
          doc.rect(14, currentY - 4.5, 182, 6, 'F');
        }
        doc.setTextColor(28, 25, 23);
        doc.text(item.day, 18, currentY);
        doc.text(`${item.pesanan} Pesanan`, 65, currentY);
        doc.text(`Rp ${item.aov.toLocaleString('id-ID')}`, 115, currentY);
        doc.text(`Rp ${item.pendapatan.toLocaleString('id-ID')}`, 155, currentY);
        currentY += 6.5;
      });

      // 2. Orders History Table
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(28, 25, 23);
      doc.text('2. HISTORI TRANSAKSI PESANAN TERBARU', 14, currentY);

      currentY += 4;
      doc.setFillColor(231, 229, 228);
      doc.rect(14, currentY, 182, 7, 'F');
      doc.setFontSize(8);
      doc.setTextColor(68, 64, 60);
      doc.text('No. Order', 18, currentY + 5);
      doc.text('Nama Pelanggan', 48, currentY + 5);
      doc.text('Pengiriman', 95, currentY + 5);
      doc.text('Metode', 130, currentY + 5);
      doc.text('Status', 152, currentY + 5);
      doc.text('Total (Rp)', 175, currentY + 5);

      currentY += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      storeOrders.forEach((ord, index) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 249);
          doc.rect(14, currentY - 4, 182, 6, 'F');
        }
        doc.setTextColor(28, 25, 23);
        doc.text(ord.orderNumber, 18, currentY);
        doc.text(ord.customerName.length > 20 ? ord.customerName.substring(0, 19) + '...' : ord.customerName, 48, currentY);
        const pdfDeliv = ord.deliveryType === 'dine_in' ? `Dine-In (${ord.tableNumber || 'Meja'})` : ord.deliveryType === 'delivery' ? 'Delivery' : 'Takeaway';
        doc.text(pdfDeliv.length > 15 ? pdfDeliv.substring(0, 14) + '..' : pdfDeliv, 95, currentY);
        doc.text(ord.paymentMethod.toUpperCase(), 130, currentY);
        doc.text(ord.status, 152, currentY);
        doc.text(`Rp ${ord.total.toLocaleString('id-ID')}`, 172, currentY);
        currentY += 6;
      });

      // Footer disclaimer & verification
      currentY += 8;
      if (currentY > 265) {
        doc.addPage();
        currentY = 20;
      }
      doc.setDrawColor(214, 211, 209);
      doc.line(14, currentY, 196, currentY);

      currentY += 6;
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108);
      doc.text(
        'Laporan resmi ini di-generate langsung dari database PesanKuliner Indonesia untuk pemilik toko.',
        14,
        currentY
      );
      doc.text(
        'Seluruh hak cipta terlindungi. Dokumen sah untuk arsip operasional, pembukuan, dan pelaporan pajak UMKM.',
        14,
        currentY + 4
      );

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`Laporan_Penjualan_${store.slug}_${dateStr}.pdf`);

      setWaToast(`✓ Berhasil mengunduh Laporan Penjualan resmi format PDF (.pdf) untuk ${store.name}!`);
      setTimeout(() => setWaToast(null), 4000);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Gagal mengekspor file PDF. Silakan gunakan format CSV.');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const dummyImage =
      newProductCategory === 'kopi'
        ? '/src/assets/images/cafe_kopi_aren_1794352693498.jpg'
        : newProductCategory === 'makanan'
        ? '/src/assets/images/food_ayam_geprek_1794352693423.jpg'
        : '/src/assets/images/bakery_toast_pastry_1794352694749.jpg';

    const defaultVariants: ProductVariant[] = hasVariants
      ? [
          {
            name: 'Pilihan Porsi / Ukuran',
            required: true,
            options: [
              { label: 'Regular', priceDelta: 0 },
              { label: 'Jumbo / Large', priceDelta: 5000 },
            ],
          },
        ]
      : [];

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      storeId: store.id,
      name: newProductName.trim(),
      category: newProductCategory,
      price: parseInt(newProductPrice) || 20000,
      description: newProductDesc.trim() || 'Menu favorit lezat khas ' + store.name,
      imageUrl: dummyImage,
      isAvailable: true,
      variants: defaultVariants,
    };

    onAddProduct(newProd);
    setShowAddProductModal(false);
    setNewProductName('');
    setNewProductDesc('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Store = {
      ...store,
      deliveryRadiusKm: Number(deliveryRadius),
      deliveryFee: Number(firstKmFee),
      deliveryPricing: {
        baseFirstKmFee: Number(firstKmFee),
        secondKmFee: Number(secondKmFee),
        subsequentKmFee: Number(subsequentKmFee),
      },
      isQrisActive,
      isCodActive,
    };
    onUpdateStoreSettings(updated);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  // Calculations for Reports
  const totalRevenue = storeOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const totalCompleted = storeOrders.filter((o) => o.status === 'completed').length;
  const averageOrderValue = storeOrders.length > 0 ? Math.round(totalRevenue / storeOrders.length) : 0;

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner / Merchant Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={store.logoUrl}
            alt={store.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">{store.name}</h1>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Toko Buka
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {store.categoryLabel} · {store.city} · Jam: {store.openingHours}
            </p>

            {/* Quick Link bar */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 truncate max-w-xs">
                pesankuliner.id/{store.slug}
              </span>
              <button
                onClick={copyStoreLink}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Live Order Simulator, Sound Bell Toggle, View Store */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSimulateIncomingOrder}
            className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Klik untuk mensimulasikan pesanan baru masuk secara real-time"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Simulasi Pesanan Baru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextState = !isSoundAlertActive;
              setIsSoundAlertActive(nextState);
              if (nextState) playOrderChime();
            }}
            className={`px-3 py-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSoundAlertActive
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
            }`}
            title={isSoundAlertActive ? 'Suara Bel Aktif (Klik untuk Mute)' : 'Suara Bel Mati (Klik untuk Nyalakan)'}
          >
            {isSoundAlertActive ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
            <span className="hidden sm:inline">
              {isSoundAlertActive ? 'Bel Aktif' : 'Bel Bisu'}
            </span>
          </button>

          <button
            onClick={() => onViewCustomerStore(store.slug)}
            className="w-full sm:w-auto px-4 sm:px-5 py-3 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Lihat Toko Pembeli</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Business API Toast Notification */}
      {waToast && (
        <div className="mb-6 p-4 bg-emerald-700 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-semibold animate-fadeIn border border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800/80 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-emerald-300" />
            </div>
            <span>{waToast}</span>
          </div>
          <button
            onClick={() => setWaToast(null)}
            className="text-emerald-200 hover:text-white p-1 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Print toast notification */}
      {printNotice && (
        <div className="mb-6 p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-semibold animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 shrink-0" />
            <span>{printNotice}</span>
          </div>
          <button onClick={() => setPrintNotice(null)} className="text-emerald-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 text-xs sm:text-sm border-b border-stone-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pesanan Masuk</span>
          <span className="bg-amber-500 text-stone-900 text-[11px] font-black px-1.5 py-0.2 rounded-full">
            {storeOrders.filter((o) => o.status === 'new' || o.status === 'cooking').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'products'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kelola Menu & Varian ({storeProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'reports'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Laporan Penjualan</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>WhatsApp Marketing & API</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
            Auto
          </span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'loyalty'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Loyalitas & Reward</span>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">
            {storeRewards.length} Reward
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'settings'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Pengaturan Delivery & QRIS</span>
        </button>
      </div>

      {/* TAB 1: PESANAN MASUK (LIVE ORDERS) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Real-Time Alert Banner / Tester */}
          <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 p-4 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-stone-900">
                    Sistem Notifikasi Pesanan Masuk Real-Time Aktif
                  </p>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Toast pop-up interaktif & suara bel kasir otomatis berbunyi saat pembeli menyelesaikan pesanan di menu toko online Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSimulateIncomingOrder}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulasikan Pesanan Masuk</span>
              </button>
            </div>
          </div>

          {/* Visual Status KPI Summary Cards */}
          {(() => {
            const newOrdersCount = storeOrders.filter((o) => o.status === 'new').length;
            const cookingOrdersCount = storeOrders.filter((o) => o.status === 'cooking').length;
            const deliveringOrdersCount = storeOrders.filter((o) => o.status === 'delivering').length;
            const inProgressOrdersCount = cookingOrdersCount + deliveringOrdersCount;
            const completedOrdersCount = storeOrders.filter((o) => o.status === 'completed').length;

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Status Card 1: Pesanan Baru */}
                  <div
                    onClick={() => setOrderFilter('new')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                      orderFilter === 'new'
                        ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-200'
                        : 'bg-white border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs relative">
                        <Bell className="w-5 h-5" />
                        {newOrdersCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white"></span>
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs uppercase tracking-wide text-rose-800">
                            Pesanan Baru
                          </span>
                          {newOrdersCount > 0 && (
                            <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse">
                              Segera Proses
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Menunggu konfirmasi dapur</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-rose-600 tabular-nums">
                      {newOrdersCount}
                    </span>
                  </div>

                  {/* Status Card 2: Sedang Diproses */}
                  <div
                    onClick={() => setOrderFilter('cooking')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                      orderFilter === 'cooking' || orderFilter === 'delivering'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                        : 'bg-white border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                        <ChefHat className="w-5 h-5 text-stone-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs uppercase tracking-wide text-amber-900">
                            Sedang Diproses
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                            Aktif
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {cookingOrdersCount} Dimasak · {deliveringOrdersCount} Dikirim
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-amber-600 tabular-nums">
                      {inProgressOrdersCount}
                    </span>
                  </div>

                  {/* Status Card 3: Selesai */}
                  <div
                    onClick={() => setOrderFilter('completed')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                      orderFilter === 'completed'
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-200'
                        : 'bg-white border-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs uppercase tracking-wide text-emerald-900">
                            Pesanan Selesai
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                            Sukses
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Pesanan telah diterima</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 tabular-nums">
                      {completedOrdersCount}
                    </span>
                  </div>
                </div>

                {/* Order Status Filters with Counts */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      id: 'all' as const,
                      label: 'Semua Pesanan',
                      count: storeOrders.length,
                      pillStyle: 'bg-stone-200 text-stone-800',
                    },
                    {
                      id: 'new' as const,
                      label: '🔴 Pesanan Baru',
                      count: newOrdersCount,
                      pillStyle: 'bg-rose-600 text-white',
                    },
                    {
                      id: 'cooking' as const,
                      label: '🟡 Sedang Dimasak',
                      count: cookingOrdersCount,
                      pillStyle: 'bg-amber-500 text-stone-950 font-black',
                    },
                    {
                      id: 'delivering' as const,
                      label: '🔵 Dalam Pengiriman',
                      count: deliveringOrdersCount,
                      pillStyle: 'bg-sky-600 text-white',
                    },
                    {
                      id: 'completed' as const,
                      label: '🟢 Selesai',
                      count: completedOrdersCount,
                      pillStyle: 'bg-emerald-600 text-white',
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        orderFilter === f.id
                          ? 'bg-stone-900 text-white shadow-xs scale-102 ring-2 ring-stone-900/20'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${f.pillStyle}`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            );
          })()}

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Tidak ada pesanan di kategori ini</h3>
              <p className="text-xs text-stone-500 mt-1">
                Bagikan link toko Anda untuk mulai menerima orderan baru dari pelanggan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrders.map((order) => {
                const isNew = order.status === 'new';
                const isCooking = order.status === 'cooking';
                const isDelivering = order.status === 'delivering';
                const isCompleted = order.status === 'completed';
                const isCancelled = order.status === 'cancelled';

                // High-visibility card border & background tint
                const cardBorderClass = isNew
                  ? 'border-2 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-200/50 bg-gradient-to-b from-rose-50/70 via-white to-white'
                  : isCooking
                  ? 'border-2 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-200 bg-gradient-to-b from-amber-50/60 via-white to-white'
                  : isDelivering
                  ? 'border-2 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-200 bg-gradient-to-b from-sky-50/60 via-white to-white'
                  : isCompleted
                  ? 'border-2 border-emerald-500/90 shadow-xs bg-gradient-to-b from-emerald-50/40 via-white to-white'
                  : 'border border-stone-300 bg-stone-50/80 opacity-70';

                return (
                  <div
                    key={order.id}
                    className={`rounded-3xl p-5 ${cardBorderClass} flex flex-col justify-between space-y-4 overflow-hidden relative transition-all`}
                  >
                    <div>
                      {/* 1. TOP STATUS RIBBON BANNER */}
                      {isNew && (
                        <div className="bg-rose-600 text-white px-4 py-2 rounded-t-2xl -mt-5 -mx-5 mb-3.5 flex items-center justify-between text-xs font-black shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                            </span>
                            <Bell className="w-4 h-4 text-rose-100 animate-bounce" />
                            <span className="tracking-wide">STATUS: PESANAN BARU</span>
                          </div>
                          <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Perlu Respons
                          </span>
                        </div>
                      )}

                      {isCooking && (
                        <div className="bg-amber-500 text-stone-950 px-4 py-2 rounded-t-2xl -mt-5 -mx-5 mb-3.5 flex items-center justify-between text-xs font-black shadow-xs">
                          <div className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-stone-950 animate-bounce" />
                            <span className="tracking-wide">STATUS: SEDANG DIMASAK</span>
                          </div>
                          <span className="text-[10px] bg-stone-950/15 text-stone-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Dapur Memproses
                          </span>
                        </div>
                      )}

                      {isDelivering && (
                        <div className="bg-sky-600 text-white px-4 py-2 rounded-t-2xl -mt-5 -mx-5 mb-3.5 flex items-center justify-between text-xs font-black shadow-xs">
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-sky-100 animate-pulse" />
                            <span className="tracking-wide">STATUS: DALAM PENGANTARAN</span>
                          </div>
                          <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Menuju Alamat
                          </span>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="bg-emerald-600 text-white px-4 py-2 rounded-t-2xl -mt-5 -mx-5 mb-3.5 flex items-center justify-between text-xs font-black shadow-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                            <span className="tracking-wide">STATUS: PESANAN SELESAI</span>
                          </div>
                          <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Transaksi Sukses
                          </span>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="bg-stone-500 text-white px-4 py-2 rounded-t-2xl -mt-5 -mx-5 mb-3.5 flex items-center justify-between text-xs font-black shadow-xs">
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-stone-200" />
                            <span className="tracking-wide">STATUS: DIBATALKAN</span>
                          </div>
                        </div>
                      )}

                      {/* 2. ORDER HEADER & STATUS BADGE */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-stone-900 text-base">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium">
                              · {order.createdAt}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {order.deliveryType === 'delivery' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                <Bike className="w-3 h-3" /> Delivery ({order.deliveryDistanceKm || 1} KM Google Maps)
                              </span>
                            ) : order.deliveryType === 'dine_in' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <UtensilsCrossed className="w-3 h-3" /> Makan di Tempat ({order.tableNumber || 'Meja'})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                                <ShoppingBag className="w-3 h-3" /> Ambil Sendiri
                              </span>
                            )}
                          </div>
                        </div>

                        {/* HIGH-CONTRAST DISTINCTIVE STATUS BADGE */}
                        {isNew && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-rose-600 text-white shadow-xs animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                            <span>Pesanan Baru</span>
                          </span>
                        )}
                        {isCooking && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-amber-500 text-stone-950 shadow-xs">
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Sedang Dimasak</span>
                          </span>
                        )}
                        {isDelivering && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-sky-600 text-white shadow-xs">
                            <Bike className="w-3.5 h-3.5" />
                            <span>Dalam Pengantaran</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-stone-200 text-stone-700">
                            <span>Dibatalkan</span>
                          </span>
                        )}
                      </div>

                      {/* 3. VISUAL 3-STEP PIPELINE PROGRESS TRACKER */}
                      <div className="mt-3 px-3 py-2 bg-stone-100/90 rounded-xl border border-stone-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          {/* Step 1: Pesanan Baru */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isNew
                                  ? 'bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isNew ? '1' : '✓'}
                            </span>
                            <span
                              className={
                                isNew
                                  ? 'text-rose-700 font-black'
                                  : 'text-stone-700 font-semibold'
                              }
                            >
                              Baru
                            </span>
                          </div>

                          {/* Connecting Line 1 */}
                          <div
                            className={`flex-1 h-1 mx-2 rounded-full ${
                              !isNew && !isCancelled ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          />

                          {/* Step 2: Sedang Diproses */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isCooking || isDelivering
                                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                                  : isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isCompleted ? '✓' : '2'}
                            </span>
                            <span
                              className={
                                isCooking || isDelivering
                                  ? 'text-amber-900 font-black'
                                  : isCompleted
                                  ? 'text-stone-700 font-semibold'
                                  : 'text-stone-400'
                              }
                            >
                              {isDelivering ? 'Pengantaran' : 'Dimasak'}
                            </span>
                          </div>

                          {/* Connecting Line 2 */}
                          <div
                            className={`flex-1 h-1 mx-2 rounded-full ${
                              isCompleted ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          />

                          {/* Step 3: Selesai */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isCompleted ? '✓' : '3'}
                            </span>
                            <span
                              className={
                                isCompleted
                                  ? 'text-emerald-800 font-black'
                                  : 'text-stone-400'
                              }
                            >
                              Selesai
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-stone-900">
                          <span>{order.customerName}</span>
                          <span className="text-stone-500 font-normal">{order.customerPhone}</span>
                        </div>
                        <p className="text-stone-600 text-[11px]">
                          <strong>
                            {order.deliveryType === 'delivery'
                              ? 'Antar ke:'
                              : order.deliveryType === 'dine_in'
                              ? 'Nomor Meja:'
                              : 'Ambil di Toko:'}
                          </strong>{' '}
                          {order.deliveryType === 'dine_in'
                            ? `${order.tableNumber || 'Meja'} · Santap di Meja Toko`
                            : order.deliveryAddress}
                        </p>
                        {order.notes && (
                          <p className="text-amber-800 text-[11px] italic bg-amber-50 p-1 rounded">
                            Catatan: {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="mt-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs flex justify-between items-start">
                            <div>
                              <span className="font-bold text-stone-900">
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="text-[11px] text-stone-500 block">
                                {item.variantSummary}
                              </span>
                            </div>
                            <span className="font-semibold text-stone-800 text-[11px]">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Price & Payment */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-stone-500 block text-[11px]">
                            {order.paymentMethod === 'qris' ? 'Bayar QRIS' : 'Bayar Tunai COD'}
                          </span>
                          <span className="text-stone-400 text-[10px]">
                            {order.deliveryType === 'delivery'
                              ? `(Ongkir ${order.deliveryDistanceKm ? `${order.deliveryDistanceKm} KM: ` : ''}Rp ${order.deliveryFee.toLocaleString('id-ID')})`
                              : order.deliveryType === 'dine_in'
                              ? `(Makan di Tempat ${order.tableNumber || ''}: Rp 0)`
                              : '(Ambil di Toko: Rp 0)'}
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-stone-900">
                          Rp {order.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {order.status === 'new' && (
                          <button
                            onClick={() => handleStatusChangeWithWa(order, 'cooking')}
                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition-all col-span-2 text-center flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                          >
                            <ChefHat className="w-4 h-4 text-white" />
                            <span>Terima & Mulai Masak</span>
                          </button>
                        )}
                        {order.status === 'cooking' && (
                          <button
                            onClick={() =>
                              handleStatusChangeWithWa(
                                order,
                                order.deliveryType === 'delivery' ? 'delivering' : 'completed'
                              )
                            }
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition-all col-span-2 text-center flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                          >
                            {order.deliveryType === 'delivery' ? (
                              <>
                                <Bike className="w-4 h-4 text-white" />
                                <span>Kirim ke Kurir (Dalam Pengantaran)</span>
                              </>
                            ) : order.deliveryType === 'dine_in' ? (
                              <>
                                <UtensilsCrossed className="w-4 h-4 text-white" />
                                <span>Sajikan ke {order.tableNumber || 'Meja'} (Selesai)</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4 text-white" />
                                <span>Serahkan ke Pembeli (Selesai)</span>
                              </>
                            )}
                          </button>
                        )}
                        {order.status === 'delivering' && (
                          <button
                            onClick={() => handleStatusChangeWithWa(order, 'completed')}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all col-span-2 text-center flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Tandai Sudah Diterima Pelanggan (Selesai)</span>
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <div className="w-full py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl col-span-2 text-center flex items-center justify-center gap-1.5 border border-emerald-200 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pesanan Telah Sukses Selesai & Lunas</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors text-[11px]"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          <span>Struk</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrderForWaModal(order)}
                          className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors text-[11px]"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kirim WA</span>
                        </button>
                        <a
                          href={`https://wa.me/62${order.customerPhone.replace(/^0/, '')}?text=Halo%20kak%20${encodeURIComponent(order.customerName)},%20pesanan%20${order.orderNumber}%20dari%20${encodeURIComponent(store.name)}%20sedang%20kami%20proses!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors text-[11px]"
                        >
                          <Phone className="w-3.5 h-3.5 text-stone-500" />
                          <span>Chat</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KELOLA MENU & VARIAN */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Katalog Menu Toko</h3>
              <p className="text-xs text-stone-500">
                Atur ketersediaan menu dan tambah varian rasa, porsi, dan topping.
              </p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Tambah Menu Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {storeProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 mb-3 bg-stone-100">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-opacity ${
                        prod.isAvailable ? 'opacity-100' : 'opacity-40 grayscale'
                      }`}
                    />
                    {!prod.isAvailable && (
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-rose-600 px-3 py-1 rounded-md shadow-xs">
                          STOK HABIS
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-stone-900 text-sm">{prod.name}</h4>
                    <span className="font-extrabold text-amber-700 text-sm whitespace-nowrap">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>

                  {/* Variants display */}
                  {prod.variants && prod.variants.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-100">
                      <p className="text-[11px] font-semibold text-stone-700">Varian Tersedia:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prod.variants.map((v, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium"
                          >
                            {v.name} ({v.options.length} opsi)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock Toggle */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600">Status Ketersediaan:</span>
                  <button
                    onClick={() => onToggleProductAvailability(prod.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                      prod.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {prod.isAvailable ? '✓ Tersedia' : '✕ Habis'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LAPORAN PENJUALAN */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Total Omzet Tercatat
              </span>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>0% potongan komisi untuk PesanKuliner</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Pesanan Selesai
              </span>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
                {totalCompleted} Pesanan
              </p>
              <span className="text-xs text-stone-500 mt-2 block">
                Tingkat pemenuhan 100% tepat waktu
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Rata-rata Keranjang (AOV)
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 tabular-nums">
                Rp {averageOrderValue.toLocaleString('id-ID')}
              </p>
              <span className="text-xs text-stone-500 mt-2 block">Per transaksi pesanan masuk</span>
            </div>
          </div>

          {/* RECHARTS DATA VISUALIZATION SECTION: PENDAPATAN MINGGUAN & JUMLAH PESANAN */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    Visualisasi Penjualan Mingguan
                  </h3>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Recharts Live
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Grafik total pendapatan omzet (Rp) dan jumlah pesanan masuk dari hari Senin hingga Minggu.
                </p>
              </div>

              {/* View Switcher & Period Selector */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Period Selector */}
                <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-semibold border border-stone-200">
                  <button
                    onClick={() => setWeeklyPeriod('current')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      weeklyPeriod === 'current'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Minggu Ini
                  </button>
                  <button
                    onClick={() => setWeeklyPeriod('previous')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      weeklyPeriod === 'previous'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Minggu Lalu
                  </button>
                </div>

                {/* Chart View Selector */}
                <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-semibold border border-stone-200">
                  <button
                    onClick={() => setChartView('both')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      chartView === 'both'
                        ? 'bg-amber-600 text-white shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Semua Grafik
                  </button>
                  <button
                    onClick={() => setChartView('revenue')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      chartView === 'revenue'
                        ? 'bg-amber-600 text-white shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Pendapatan (Rp)
                  </button>
                  <button
                    onClick={() => setChartView('orders')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      chartView === 'orders'
                        ? 'bg-amber-600 text-white shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Jumlah Pesanan
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Strip for Current Week */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs">
              <div>
                <span className="text-stone-500 block">Total Omzet Mingguan:</span>
                <span className="text-base sm:text-lg font-black text-amber-700 tabular-nums">
                  Rp {weeklyTotalRevenue.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  {weeklyPeriod === 'current' ? '↗ +18.1% vs minggu lalu' : 'Periode lalu'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Total Pesanan Masuk:</span>
                <span className="text-base sm:text-lg font-black text-stone-900 tabular-nums">
                  {weeklyTotalOrders} Order
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  {weeklyPeriod === 'current' ? '↗ +18.2% vs minggu lalu' : 'Periode lalu'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Hari Tersibuk (Peak):</span>
                <span className="text-base sm:text-lg font-bold text-stone-900">
                  {peakDay.day}
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  {peakDay.pesanan} pesanan · Rp {(peakDay.pendapatan / 1000).toFixed(0)}k
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Rata-rata Harian:</span>
                <span className="text-base sm:text-lg font-bold text-stone-900 tabular-nums">
                  Rp {Math.round(weeklyTotalRevenue / 7).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  ~{Math.round(weeklyTotalOrders / 7)} pesanan / hari
                </span>
              </div>
            </div>

            {/* Charts Grid */}
            <div
              className={`grid gap-6 ${
                chartView === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* CHART 1: TOTAL PENDAPATAN MINGGUAN (AreaChart) */}
              {(chartView === 'both' || chartView === 'revenue') && (
                <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <span>Grafik Total Pendapatan Mingguan (Rp)</span>
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Akumulasi omzet jualan dari kurir delivery dan takeaway
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      Total: Rp {(weeklyTotalRevenue / 1000000).toFixed(2)} Juta
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activeWeeklyData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                        <XAxis
                          dataKey="shortDay"
                          tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: '#d6d3d1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(val) =>
                            val >= 1000000
                              ? `Rp ${(val / 1000000).toFixed(1)}jt`
                              : `Rp ${(val / 1000).toFixed(0)}k`
                          }
                          tick={{ fill: '#78716c', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                                  <p className="font-bold text-amber-400 text-sm">{d.day}</p>
                                  <p className="text-stone-200">
                                    Pendapatan:{' '}
                                    <strong className="text-white text-sm">
                                      Rp {d.pendapatan.toLocaleString('id-ID')}
                                    </strong>
                                  </p>
                                  <p className="text-stone-400 text-[11px]">
                                    {d.pesanan} pesanan · Rata-rata Rp {d.aov.toLocaleString('id-ID')}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="pendapatan"
                          stroke="#b45309"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorPendapatan)"
                          activeDot={{ r: 6, fill: '#b45309', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                    <span>*Data dihitung otomatis dari pesanan selesai & dalam proses</span>
                    <span className="font-semibold text-stone-700">Puncak Omzet: Hari {peakDay.day}</span>
                  </div>
                </div>
              )}

              {/* CHART 2: JUMLAH PESANAN MASUK (BarChart) */}
              {(chartView === 'both' || chartView === 'orders') && (
                <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span>
                        <span>Grafik Jumlah Pesanan Masuk (Order)</span>
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Volume pesanan pelanggan via WhatsApp per hari
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-900 bg-stone-200/80 px-2 py-1 rounded">
                      Total: {weeklyTotalOrders} Order
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activeWeeklyData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                        <XAxis
                          dataKey="shortDay"
                          tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: '#d6d3d1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#78716c', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                          width={35}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                                  <p className="font-bold text-amber-400 text-sm">{d.day}</p>
                                  <p className="text-stone-200">
                                    Pesanan Masuk:{' '}
                                    <strong className="text-white text-sm">
                                      {d.pesanan} Pesanan
                                    </strong>
                                  </p>
                                  <p className="text-stone-400 text-[11px]">
                                    Omzet Hari Ini: Rp {d.pendapatan.toLocaleString('id-ID')}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="pesanan"
                          fill="#1c1917"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                    <span>*Order masuk tertinggi terjadi pada akhir pekan (weekend)</span>
                    <span className="font-semibold text-stone-700">Paling Ramai: {peakDay.pesanan} Order</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Orders Breakdown Table */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Rekap Transaksi Harian</h4>
                <p className="text-xs text-stone-500">Histori pesanan masuk dari pembeli</p>
              </div>

              {/* Export Actions: CSV, PDF & Preview */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Unduh CSV (.csv)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98"
                >
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Unduh PDF (.pdf)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReportPreviewModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-stone-600" />
                  <span>Pratinjau Cetak</span>
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-semibold">
                    <th className="py-2.5">No. Order</th>
                    <th className="py-2.5">Pelanggan</th>
                    <th className="py-2.5">Tipe Pengiriman</th>
                    <th className="py-2.5">Metode Bayar</th>
                    <th className="py-2.5 text-right">Total</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {storeOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/60">
                      <td className="py-3 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                      <td className="py-3">{ord.customerName}</td>
                      <td className="py-3 font-medium">
                        {ord.deliveryType === 'dine_in'
                          ? `Makan di Tempat (${ord.tableNumber || 'Meja'})`
                          : ord.deliveryType === 'delivery'
                          ? 'Delivery'
                          : 'Takeaway'}
                      </td>
                      <td className="py-3 uppercase font-semibold text-stone-600">{ord.paymentMethod}</td>
                      <td className="py-3 text-right font-bold text-stone-900 tabular-nums">
                        Rp {ord.total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right">
                        {renderOrderStatusBadge(ord.status, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WHATSAPP MARKETING & BROADCAST API */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* WhatsApp Header & Meta Connection Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/60 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>WhatsApp Business Cloud API</span>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        ✓ Terverifikasi Meta
                      </span>
                    </h3>
                    <p className="text-xs text-stone-300">
                      Otomatisasi pesan pengingat status order & siaran promosi langsung ke nomor WhatsApp pelanggan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Master Auto-Notification Switch */}
              <div className="flex items-center gap-3 bg-stone-800/90 p-3 rounded-2xl border border-stone-700/80 self-start md:self-auto">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">Auto Notifikasi Status</span>
                  <span className="text-[10px] text-stone-400">
                    {isAutoWaEnabled ? 'Aktif (Kirim Otomatis)' : 'Non-aktif (Manual)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoWaEnabled(!isAutoWaEnabled);
                    setWaToast(
                      isAutoWaEnabled
                        ? 'Notifikasi WhatsApp otomatis dinonaktifkan.'
                        : 'Notifikasi WhatsApp Business otomatis diaktifkan!'
                    );
                    setTimeout(() => setWaToast(null), 3000);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    isAutoWaEnabled ? 'bg-emerald-500' : 'bg-stone-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      isAutoWaEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Sub-navigation inside WhatsApp */}
            <div className="mt-6 pt-4 border-t border-stone-800/80 flex flex-wrap gap-2 text-xs font-bold">
              <button
                onClick={() => setWaTabSubView('auto-reminders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  waTabSubView === 'auto-reminders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Pengingat Status Otomatis</span>
              </button>

              <button
                onClick={() => setWaTabSubView('broadcast')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  waTabSubView === 'broadcast'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Promosi Pelanggan</span>
              </button>

              <button
                onClick={() => setWaTabSubView('api-settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  waTabSubView === 'api-settings'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Koneksi API & Kuota Meta</span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: AUTO REMINDERS TEMPLATES */}
          {waTabSubView === 'auto-reminders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">
                      Template Pesan Pengingat Status Pesanan
                    </h4>
                    <p className="text-xs text-stone-500">
                      Pesan otomatis dikirim via WhatsApp Business API saat status pesanan diubah oleh kasir atau dapur.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCheck className="w-4 h-4" />
                    <span>Format HSM Resmi Terverifikasi</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event 1: Pesanan Baru */}
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          1. Pesanan Baru Diterima
                        </span>
                        <span className="text-[11px] text-stone-400">Trigger: Saat Checkout</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">
                        Memberi kepastian instan ke pembeli bahwa pesanan telah tercatat di kasir toko.
                      </p>
                      <textarea
                        rows={3}
                        value={waTemplates.new}
                        onChange={(e) => setWaTemplates({ ...waTemplates, new: e.target.value })}
                        className="w-full p-3 rounded-xl border border-stone-300 text-xs font-medium bg-white outline-none focus:border-emerald-600 leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] text-stone-400">Tag: {'{{nama}}'}, {'{{no_pesanan}}'}</span>
                      <button
                        onClick={() => {
                          setWaToast(`Pesan uji coba "Pesanan Baru" terkirim ke WhatsApp toko!`);
                          setTimeout(() => setWaToast(null), 3000);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                      >
                        Tes Kirim API →
                      </button>
                    </div>
                  </div>

                  {/* Event 2: Sedang Dimasak */}
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                          2. Makanan Sedang Dimasak
                        </span>
                        <span className="text-[11px] text-stone-400">Trigger: Klik "Mulai Masak"</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">
                        Memberitahu pelanggan bahwa menu sedang diracik segar oleh barista/dapur.
                      </p>
                      <textarea
                        rows={3}
                        value={waTemplates.cooking}
                        onChange={(e) => setWaTemplates({ ...waTemplates, cooking: e.target.value })}
                        className="w-full p-3 rounded-xl border border-stone-300 text-xs font-medium bg-white outline-none focus:border-emerald-600 leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] text-stone-400">Tag: {'{{nama}}'}, {'{{nama_toko}}'}</span>
                      <button
                        onClick={() => {
                          setWaToast(`Pesan uji coba "Sedang Dimasak" terkirim ke WhatsApp toko!`);
                          setTimeout(() => setWaToast(null), 3000);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                      >
                        Tes Kirim API →
                      </button>
                    </div>
                  </div>

                  {/* Event 3: Dalam Pengantaran Kurir */}
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-300">
                          3. Dalam Pengantaran Kurir
                        </span>
                        <span className="text-[11px] text-stone-400">Trigger: Klik "Kirim ke Kurir"</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">
                        Mengingatkan pelanggan agar bersiap menerima kurir di lokasi tujuan.
                      </p>
                      <textarea
                        rows={3}
                        value={waTemplates.delivering}
                        onChange={(e) => setWaTemplates({ ...waTemplates, delivering: e.target.value })}
                        className="w-full p-3 rounded-xl border border-stone-300 text-xs font-medium bg-white outline-none focus:border-emerald-600 leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] text-stone-400">Tag: {'{{alamat}}'}, {'{{no_pesanan}}'}</span>
                      <button
                        onClick={() => {
                          setWaToast(`Pesan uji coba "Dalam Pengantaran" terkirim ke WhatsApp toko!`);
                          setTimeout(() => setWaToast(null), 3000);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                      >
                        Tes Kirim API →
                      </button>
                    </div>
                  </div>

                  {/* Event 4: Pesanan Selesai */}
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          4. Pesanan Telah Sampai / Selesai
                        </span>
                        <span className="text-[11px] text-stone-400">Trigger: Klik "Tandai Selesai"</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">
                        Ucapan terima kasih ramah dan ajakan memberi ulasan serta pesan kembali.
                      </p>
                      <textarea
                        rows={3}
                        value={waTemplates.completed}
                        onChange={(e) => setWaTemplates({ ...waTemplates, completed: e.target.value })}
                        className="w-full p-3 rounded-xl border border-stone-300 text-xs font-medium bg-white outline-none focus:border-emerald-600 leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] text-stone-400">Tag: {'{{nama}}'}, {'{{nama_toko}}'}</span>
                      <button
                        onClick={() => {
                          setWaToast(`Pesan uji coba "Pesanan Selesai" terkirim ke WhatsApp toko!`);
                          setTimeout(() => setWaToast(null), 3000);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                      >
                        Tes Kirim API →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Semua perubahan template otomatis tersimpan dan divalidasi ke Meta Cloud API.</span>
                  <button
                    onClick={() => {
                      setWaToast('Pengaturan template WhatsApp berhasil disimpan!');
                      setTimeout(() => setWaToast(null), 3000);
                    }}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl"
                  >
                    Simpan Template Pesan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: BROADCAST PROMOSI PELANGGAN */}
          {waTabSubView === 'broadcast' && (
            <div className="space-y-6">
              {/* Broadcast Success Notice */}
              {broadcastSuccessNotice && (
                <div className="p-4 bg-emerald-700 text-white rounded-2xl shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <CheckCheck className="w-5 h-5 text-emerald-300" />
                    <span>{broadcastSuccessNotice}</span>
                  </div>
                  <button onClick={() => setBroadcastSuccessNotice(null)} className="p-1 text-emerald-200 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Broadcast Composer (col-span-7) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-stone-900">
                      Buat Siaran Promosi WhatsApp (Broadcast Blast)
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Kirim promo akhir pekan, voucher diskon, atau info menu baru ke seluruh nomor pelanggan terdaftar dalam sekali klik.
                    </p>
                  </div>

                  {/* Preset Template Selectors */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Pilihan Cepat Template Promosi Kuliner:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBroadcastTitle('Promo Spesial Weekend: Diskon 20% & Gratis Ongkir');
                          setBroadcastMessage(
                            'Halo Sahabat Kuliner! Ada kabar gembira khusus akhir pekan ini di {{nama_toko}} 🎉\n\nDapatkan DISKON 20% untuk semua menu favorit + GRATIS ONGKIR hingga radius 5 KM!\n\nKode Promo: *KULINERHEMAT*\nYuk pesan sekarang sebelum kehabisan menu favoritmu!'
                          );
                          setBroadcastButtonText('Buka Menu & Pesan Sekarang');
                        }}
                        className="p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left text-xs font-semibold text-stone-800 transition-colors"
                      >
                        <span className="block font-bold text-amber-800 mb-0.5">☕ Promo Weekend</span>
                        <span className="text-[11px] text-stone-500 line-clamp-1">Diskon 20% + Gratis Ongkir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBroadcastTitle('Peluncuran Menu Baru: Artisan Toast & Kopi Susu');
                          setBroadcastMessage(
                            'Kabar baru untukmu! 🥐\n\n{{nama_toko}} baru saja merilis menu spesial: Roti Toast Butter Kaya & Iced Matcha Kyoto.\n\nKhusus hari ini, beli 1 Kopi Susu Aren GRATIS 1 Toast Mini! Pesan langsung melalui tautan resmi kami:'
                          );
                          setBroadcastButtonText('Lihat Menu Baru Kami');
                        }}
                        className="p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left text-xs font-semibold text-stone-800 transition-colors"
                      >
                        <span className="block font-bold text-amber-800 mb-0.5">🥐 Menu Baru</span>
                        <span className="text-[11px] text-stone-500 line-clamp-1">Buy 1 Get 1 Toast</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBroadcastTitle('Voucher Gajian Akhir Bulan: Cashback Rp 15.000');
                          setBroadcastMessage(
                            'Waktunya self-reward gajian! ✨\n\nMakan siang atau ngopi santai di {{nama_toko}} lebih hemat dengan Cashback Rp 15.000 (Min. belanja Rp 50.000).\n\nPembayaran bisa menggunakan QRIS atau COD kurir toko:'
                          );
                          setBroadcastButtonText('Klaim Voucher Sekarang');
                        }}
                        className="p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left text-xs font-semibold text-stone-800 transition-colors"
                      >
                        <span className="block font-bold text-amber-800 mb-0.5">💳 Voucher Gajian</span>
                        <span className="text-[11px] text-stone-500 line-clamp-1">Cashback Rp 15.000</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Target Penerima Broadcast:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'all' as const, label: 'Semua Kontak', count: '234' },
                        { id: 'weekly' as const, label: 'Minggu Ini', count: '78' },
                        { id: 'coffee' as const, label: 'Pecinta Kopi', count: '142' },
                        { id: 'food' as const, label: 'Makanan Berat', count: '92' },
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setBroadcastTarget(t.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            broadcastTarget === t.id
                              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-stone-900'
                              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          <span className="text-xs font-bold block">{t.label}</span>
                          <span className="text-[11px] text-emerald-700 font-semibold">{t.count} Nomor</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Composer Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Judul Kampanye (Internal) *
                      </label>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">Isi Pesan Siaran WhatsApp *</label>
                        <span className="text-[11px] text-stone-400">Gunakan *teks tebal* untuk penekanan</span>
                      </div>
                      <textarea
                        rows={6}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-stone-300 text-xs leading-relaxed outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Teks Tombol Aksi Pesan Cepat (Call-To-Action)
                      </label>
                      <input
                        type="text"
                        value={broadcastButtonText}
                        onChange={(e) => setBroadcastButtonText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Sending action */}
                  <div className="pt-2">
                    {isBroadcasting ? (
                      <div className="space-y-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-300">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                          <span className="flex items-center gap-2">
                            <Radio className="w-4 h-4 animate-spin text-emerald-600" />
                            Menyiarkan pesan via WhatsApp Business API...
                          </span>
                          <span>{broadcastProgress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-emerald-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                            style={{ width: `${broadcastProgress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-emerald-700 text-center">
                          Mengirim antrean pesan dengan enkripsi end-to-end Meta...
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleTriggerBroadcast}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-black rounded-xl text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Kirim Siaran Broadcast Sekarang</span>
                      </button>
                    )}
                    <p className="text-[11px] text-stone-400 text-center mt-2">
                      Sesuai kebijakan Meta WhatsApp: 0 spam, hanya dikirim ke pelanggan yang pernah berinteraksi.
                    </p>
                  </div>
                </div>

                {/* Right Column: Live WhatsApp Message Simulator (col-span-5) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[320px] bg-stone-900 rounded-[2.5rem] p-3 shadow-2xl border border-stone-800">
                    {/* Phone Screen Mockup */}
                    <div className="bg-[#EFEAE2] rounded-[2rem] overflow-hidden h-[540px] flex flex-col text-stone-900 relative">
                      {/* WhatsApp Chat Header */}
                      <div className="bg-[#075E54] text-white p-3 pt-6 pb-2.5 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={store.logoUrl}
                            alt={store.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-white/40 bg-white"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold truncate max-w-[140px]">
                                {store.name}
                              </span>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                            </div>
                            <span className="text-[10px] text-emerald-100/90 block">
                              Akun Bisnis Resmi
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages Canvas */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                        {/* Security Notice Bubble */}
                        <div className="bg-[#FFF9C4] text-[#5D4037] text-[10px] p-2 rounded-lg text-center shadow-2xs leading-snug">
                          🔒 Pesan ini dikirim dari Akun WhatsApp Business resmi {store.name}.
                        </div>

                        {/* Broadcast Message Balloon */}
                        <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs border border-stone-200/80 space-y-2 relative">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block pb-1 border-b border-stone-100">
                            📣 {broadcastTitle}
                          </span>

                          <p className="text-stone-800 text-[11px] leading-relaxed whitespace-pre-line">
                            {broadcastMessage.replace('{{nama_toko}}', store.name)}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400">
                            <span>pesankuliner.id/{store.slug}</span>
                            <div className="flex items-center gap-1">
                              <span>15:42</span>
                              <span className="text-sky-600 font-bold">✓✓</span>
                            </div>
                          </div>

                          {/* Quick Action Button */}
                          <div className="mt-2 pt-2 border-t border-stone-100">
                            <div className="w-full py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-[11px] text-center border border-emerald-200 flex items-center justify-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              <span>{broadcastButtonText}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phone Bottom bar */}
                      <div className="p-2 bg-stone-100 border-t border-stone-200 text-center text-[10px] text-stone-500">
                        Pratinjau Layar WhatsApp Pelanggan
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Broadcast Campaign Logs */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">Riwayat Broadcast WhatsApp Terkirim</h4>
                    <p className="text-xs text-stone-500">Histori kampanye siaran dan metrik keterbacaan pesan</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {broadcastHistory.length} Kampanye Selesai
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-semibold">
                        <th className="py-2.5">Judul Promosi</th>
                        <th className="py-2.5">Target Audiens</th>
                        <th className="py-2.5">Waktu Kirim</th>
                        <th className="py-2.5 text-center">Terkirim</th>
                        <th className="py-2.5 text-center">Tingkat Baca</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {broadcastHistory.map((bc) => (
                        <tr key={bc.id} className="hover:bg-stone-50/60">
                          <td className="py-3 font-bold text-stone-900">{bc.title}</td>
                          <td className="py-3 text-stone-600">{bc.target}</td>
                          <td className="py-3 text-stone-500">{bc.sentAt}</td>
                          <td className="py-3 text-center font-bold tabular-nums text-stone-800">
                            {bc.sentCount} nomor ({bc.deliveredRate})
                          </td>
                          <td className="py-3 text-center font-bold text-emerald-700 tabular-nums">
                            {bc.readRate}
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              ✓ Berhasil
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: API SETTINGS & QUOTA */}
          {waTabSubView === 'api-settings' && (
            <div className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div>
                <h4 className="text-lg font-bold text-stone-900">
                  Konfigurasi WhatsApp Business Cloud API (Meta)
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pengaturan kredensial resmi Meta for Developers untuk perutean pesan berkecepatan tinggi.
                </p>
              </div>

              {/* Health stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Status Server Meta
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-stone-900">Operasional Normal</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">Graph API v20.0</span>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Kuota Pesan Gratis Bulanan
                  </span>
                  <p className="text-sm font-black text-emerald-700 tabular-nums">
                    214 / 1.000 Percakapan
                  </p>
                  <span className="text-[11px] text-stone-400 mt-1 block">Tersedia 786 kuota bebas biaya</span>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Kecepatan Pengiriman
                  </span>
                  <p className="text-sm font-bold text-stone-900">~120 ms / pesan</p>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Tingkat sukses 99.8%</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    WhatsApp Business Account ID (WABA ID)
                  </label>
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp Pengirim Terverifikasi (Phone Number ID)
                  </label>
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Permanent Access Token (Meta System User)
                  </label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono font-medium outline-none"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCheck className="w-5 h-5 text-emerald-700" />
                    <div>
                      <p className="font-bold text-stone-900">Webhook Status: Aktif & Terverifikasi</p>
                      <p className="text-[11px] text-stone-500">Menerima callback laporan terkirim (delivered) & terbaca (read).</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    Live
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setWaToast('Koneksi WhatsApp Business Cloud API berhasil diuji dan diverifikasi!');
                    setTimeout(() => setWaToast(null), 3500);
                  }}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all"
                >
                  Uji Koneksi & Simpan Kredensial
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PENGATURAN DELIVERY & QRIS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
          <h3 className="text-lg font-bold text-stone-900 mb-1">Pengaturan Kurir Toko & Pembayaran</h3>
          <p className="text-xs text-stone-500 mb-6">
            Tentukan radius jangkauan delivery lokal dan cara pembeli membayar pesanan.
          </p>

          {savedSettingsNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Radius Maksimal Pengantaran (KM)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 outline-none"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Alamat pembeli di luar {deliveryRadius} KM akan diarahkan untuk ambil di toko (takeaway).
              </p>
            </div>

            {/* Skema Ongkos Kirim Berjenjang (KM Awal, KM ke-2, KM ke-3 dst Flat) */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-amber-700" />
                  <span>Sistem Ongkos Kirim Berjenjang (Berdasarkan Jarak KM)</span>
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Tarif dihitung otomatis sesuai jarak pengantaran dari toko ke alamat pemesan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. KM Pertama */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    1. Kilometer Awal (KM 1)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">Rp</span>
                    <input
                      type="number"
                      step="500"
                      value={firstKmFee}
                      onChange={(e) => setFirstKmFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 outline-none focus:border-amber-600"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Tarif dasar 1 KM pertama.</p>
                </div>

                {/* 2. KM ke-2 */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    2. Tambahan KM ke-2
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">Rp</span>
                    <input
                      type="number"
                      step="500"
                      value={secondKmFee}
                      onChange={(e) => setSecondKmFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 outline-none focus:border-amber-600"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Total 2 KM = Rp {(firstKmFee + secondKmFee).toLocaleString('id-ID')}
                  </p>
                </div>

                {/* 3. KM ke-3 dst */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    3. KM ke-3 dst (Flat / KM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">Rp</span>
                    <input
                      type="number"
                      step="500"
                      value={subsequentKmFee}
                      onChange={(e) => setSubsequentKmFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 outline-none focus:border-amber-600"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Biaya per KM berikutnya.</p>
                </div>
              </div>

              {/* Interactive Live Distance Simulator for the Merchant */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Simulasi Kalkulator Jarak Langsung:</span>
                  </span>
                  <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {adminSimulatedKm} KM → Rp{' '}
                    {calculateTieredDeliveryFee(adminSimulatedKm, {
                      baseFirstKmFee: firstKmFee,
                      secondKmFee,
                      subsequentKmFee,
                    }).fee.toLocaleString('id-ID')}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max={Math.max(6, deliveryRadius || 6)}
                  step="1"
                  value={adminSimulatedKm}
                  onChange={(e) => setAdminSimulatedKm(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                />

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-center text-[10px]">
                  {[1, 2, 3, 4, 5, 6].map((km) => {
                    const fee = calculateTieredDeliveryFee(km, {
                      baseFirstKmFee: firstKmFee,
                      secondKmFee,
                      subsequentKmFee,
                    }).fee;
                    return (
                      <div
                        key={km}
                        onClick={() => setAdminSimulatedKm(km)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                          adminSimulatedKm === km
                            ? 'bg-amber-600 text-white font-bold border-amber-700'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <span className="block">{km} KM</span>
                        <span className="block font-bold">Rp {fee / 1000}rb</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Metode Pembayaran yang Diterima
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-5 h-5 text-amber-700" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block">QRIS Nasional</span>
                    <span className="text-[11px] text-stone-500">GoPay, OVO, Dana, ShopeePay, BCA, dll.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isQrisActive}
                  onChange={(e) => setIsQrisActive(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Bike className="w-5 h-5 text-amber-700" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block">Bayar Tunai / COD</span>
                    <span className="text-[11px] text-stone-500">Pembeli membayar uang tunai ke kurir toko</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isCodActive}
                  onChange={(e) => setIsCodActive(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded"
                />
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all"
              >
                Simpan Perubahan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: PROGRAM LOYALITAS & REWARD */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-600/40 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      PesanKuliner Loyalty Engine
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Program Loyalitas & Reward Pelanggan
                    </h2>
                  </div>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Tingkatkan retensi & pesanan berulang (repeat orders). Pelanggan mendapatkan poin setiap kali bertransaksi, dan dapat menukarkannya dengan diskon belanja, gratis ongkir, atau menu gratis dari katalog tokomu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReward(null);
                    setRewardForm({
                      title: '',
                      description: '',
                      pointsCost: 50,
                      rewardType: 'discount_amount',
                      discountValue: 10000,
                      freeProductTitle: '',
                      badgeLabel: 'Populer',
                      isAvailable: true,
                    });
                    setShowAddRewardModal(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Reward Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1 font-bold">
                <span>Member Terdaftar</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
                {storeMembers.length}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Pelanggan dengan nomor aktif</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1 font-bold">
                <span>Total Poin Beredar</span>
                <Coins className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums">
                {storeMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Siap ditukarkan pelanggan</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1 font-bold">
                <span>Katalog Reward Aktif</span>
                <Gift className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
                {storeRewards.filter((r) => r.isAvailable).length}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Dari {storeRewards.length} total reward</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1 font-bold">
                <span>Reward Ditukarkan</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-purple-700 tabular-nums">
                {orders.filter((o) => o.appliedReward).length}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Diskon diberikan: Rp {orders.reduce((sum, o) => sum + (o.appliedReward?.discountAmount || 0), 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* SECTION 1: KATALOG & MANAJEMEN REWARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <span>Katalog Hadiah Penukaran Poin ({storeRewards.length})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Voucher diskon, gratis ongkir, atau produk gratis yang bisa diklaim pelanggan dengan poin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingReward(null);
                  setRewardForm({
                    title: '',
                    description: '',
                    pointsCost: 50,
                    rewardType: 'discount_amount',
                    discountValue: 10000,
                    freeProductTitle: '',
                    badgeLabel: 'Populer',
                    isAvailable: true,
                  });
                  setShowAddRewardModal(true);
                }}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Reward Baru</span>
              </button>
            </div>

            {storeRewards.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-sm">
                Belum ada reward yang dibuat. Klik tombol "+ Tambah Reward Baru" di atas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      reward.isAvailable
                        ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200 shadow-2xs hover:shadow-xs'
                        : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-stone-900">
                            {reward.title}
                          </span>
                          {reward.badgeLabel && (
                            <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                              {reward.badgeLabel}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              reward.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {reward.isAvailable ? '✓ Aktif' : 'Nonaktif'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed">
                          {reward.description}
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="font-black text-amber-950 bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300">
                            ⭐ {reward.pointsCost} Poin
                          </span>
                          <span className="text-stone-600 font-semibold bg-stone-100 px-2.5 py-1 rounded-lg">
                            {reward.rewardType === 'discount_amount'
                              ? `Potongan Langsung Rp ${reward.discountValue.toLocaleString('id-ID')}`
                              : reward.rewardType === 'discount_percent'
                              ? `Diskon ${reward.discountValue}% Pesanan`
                              : reward.rewardType === 'free_delivery'
                              ? 'Bebas Ongkir Delivery'
                              : `Menu Gratis: ${reward.freeProductTitle || 'Menu Spesial'}`}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleReward) onToggleReward(reward.id);
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            reward.isAvailable
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {reward.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReward(reward);
                              setRewardForm({
                                title: reward.title,
                                description: reward.description,
                                pointsCost: reward.pointsCost,
                                rewardType: reward.rewardType,
                                discountValue: reward.discountValue,
                                freeProductTitle: reward.freeProductTitle || '',
                                badgeLabel: reward.badgeLabel || '',
                                isAvailable: reward.isAvailable,
                              });
                              setShowAddRewardModal(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                            title="Edit Reward"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus reward "${reward.title}"?`)) {
                                if (onDeleteReward) onDeleteReward(reward.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Hapus Reward"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: DAFTAR MEMBER LOYALITAS & PENYESUAIAN POIN */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>Daftar Member Pelanggan ({storeMembers.length})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pantau saldo poin pembeli dan sesuaikan poin secara manual jika dibutuhkan.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Cari nama / WhatsApp..."
                  className="w-full pl-8 pr-3 py-2 bg-stone-100 text-xs rounded-xl border border-transparent focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Pelanggan</th>
                    <th className="py-2.5 font-bold">Tier Member</th>
                    <th className="py-2.5 font-bold text-center">Saldo Poin</th>
                    <th className="py-2.5 font-bold text-center">Total Akumulasi</th>
                    <th className="py-2.5 font-bold text-right">Total Belanja</th>
                    <th className="py-2.5 font-bold">Aktivitas Terakhir</th>
                    <th className="py-2.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {storeMembers
                    .filter(
                      (m) =>
                        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                        m.phone.includes(memberSearchQuery)
                    )
                    .map((member) => (
                      <tr key={member.id} className="hover:bg-stone-50/60">
                        <td className="py-3">
                          <p className="font-bold text-stone-900">{member.name}</p>
                          <p className="text-[11px] font-mono text-stone-500">{member.phone}</p>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              member.tier === 'Platinum'
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : member.tier === 'Gold'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : member.tier === 'Silver'
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <Crown className="w-3 h-3" />
                            {member.tier}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 tabular-nums">
                            {member.points} Poin
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono tabular-nums text-stone-600">
                          {member.lifetimePoints} Poin
                        </td>
                        <td className="py-3 text-right font-bold text-stone-900 tabular-nums">
                          Rp {member.totalSpent.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 text-[11px] text-stone-500">
                          {member.lastTransactionAt}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdjustPointsModal(member);
                              setAdjustPointsDelta(20);
                              setAdjustPointsReason('Bonus loyalitas kasir');
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-stone-200"
                          >
                            +/- Sesuaikan Poin
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: PENGATURAN SKEMA PROGRAM LOYALITAS */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                  <span>Pengaturan Skema Poin Toko</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tentukan rasio perolehan poin dan batas penukaran reward pelanggan.
                </p>
              </div>

              {savedLoyaltyNotice && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pengaturan Tersimpan!
                </span>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateStoreSettings({
                  ...store,
                  loyaltyConfig: loyaltyConfigForm,
                });
                setSavedLoyaltyNotice(true);
                setTimeout(() => setSavedLoyaltyNotice(false), 3000);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Rasio Poin Belanja (Rp / 1 Poin)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-bold">Rp</span>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={loyaltyConfigForm.pointsPerAmount}
                      onChange={(e) =>
                        setLoyaltyConfigForm({
                          ...loyaltyConfigForm,
                          pointsPerAmount: Number(e.target.value) || 1000,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Misal: Rp 1.000 = Pembeli belanja Rp 50.000 dapat 50 Poin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Minimal Poin Penukaran
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={loyaltyConfigForm.minRedeemPoints}
                    onChange={(e) =>
                      setLoyaltyConfigForm({
                        ...loyaltyConfigForm,
                        minRedeemPoints: Number(e.target.value) || 20,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Poin minimum agar pembeli dapat memilih reward di keranjang.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Bonus Poin Member Baru
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={loyaltyConfigForm.newMemberBonusPoints}
                    onChange={(e) =>
                      setLoyaltyConfigForm({
                        ...loyaltyConfigForm,
                        newMemberBonusPoints: Number(e.target.value) || 15,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Bonus langsung saat nomor HP baru melakukan order pertama.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Simpan Aturan Loyalitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT REWARD LOYALITAS */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setShowAddRewardModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-stone-900">
                {editingReward ? 'Edit Hadiah Reward' : 'Tambah Hadiah Reward Baru'}
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!rewardForm.title.trim()) return;

                if (editingReward) {
                  const updated: LoyaltyReward = {
                    ...editingReward,
                    ...rewardForm,
                  };
                  if (onUpdateReward) onUpdateReward(updated);
                } else {
                  const created: LoyaltyReward = {
                    id: `rew-${Date.now()}`,
                    storeId: store.id,
                    ...rewardForm,
                  };
                  if (onAddReward) onAddReward(created);
                }
                setShowAddRewardModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nama / Judul Reward *
                </label>
                <input
                  type="text"
                  required
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="Contoh: Voucher Diskon Rp 15.000 / Free Es Kopi Susu"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium text-xs sm:text-sm outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  placeholder="Keterangan singkat reward yang tampil untuk pembeli"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Biaya Poin *
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={rewardForm.pointsCost}
                    onChange={(e) => setRewardForm({ ...rewardForm, pointsCost: Number(e.target.value) || 10 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Label Badge
                  </label>
                  <input
                    type="text"
                    value={rewardForm.badgeLabel}
                    onChange={(e) => setRewardForm({ ...rewardForm, badgeLabel: e.target.value })}
                    placeholder="Contoh: Populer / Hemat"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Tipe / Jenis Reward
                </label>
                <select
                  value={rewardForm.rewardType}
                  onChange={(e) => setRewardForm({ ...rewardForm, rewardType: e.target.value as LoyaltyReward['rewardType'] })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium outline-none focus:border-amber-600"
                >
                  <option value="discount_amount">Potongan Diskon Nominal (Rp)</option>
                  <option value="discount_percent">Diskon Persentase (%)</option>
                  <option value="free_delivery">Gratis Ongkir Pengantaran</option>
                  <option value="free_product">Menu Makanan/Minuman Gratis</option>
                </select>
              </div>

              {rewardForm.rewardType === 'discount_amount' && (
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nilai Potongan (Rp)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={rewardForm.discountValue}
                    onChange={(e) => setRewardForm({ ...rewardForm, discountValue: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold outline-none focus:border-amber-600"
                  />
                </div>
              )}

              {rewardForm.rewardType === 'discount_percent' && (
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Persentase Diskon (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={rewardForm.discountValue}
                    onChange={(e) => setRewardForm({ ...rewardForm, discountValue: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold outline-none focus:border-amber-600"
                  />
                </div>
              )}

              {rewardForm.rewardType === 'free_product' && (
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nama Menu Gratis
                  </label>
                  <input
                    type="text"
                    value={rewardForm.freeProductTitle}
                    onChange={(e) => setRewardForm({ ...rewardForm, freeProductTitle: e.target.value })}
                    placeholder="Contoh: 1x Es Kopi Susu Senja"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingReward ? 'Simpan Perubahan' : 'Buat Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SESUAIKAN POIN MEMBER MANUAL */}
      {showAdjustPointsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAdjustPointsModal(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900">Sesuaikan Poin Member</h3>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
              <p className="font-bold text-stone-900">{showAdjustPointsModal.name}</p>
              <p className="text-stone-500 font-mono">{showAdjustPointsModal.phone}</p>
              <p className="text-amber-800 font-bold pt-1">
                Saldo Poin Saat Ini: {showAdjustPointsModal.points} Poin
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onAdjustMemberPoints) {
                  onAdjustMemberPoints(
                    showAdjustPointsModal.phone,
                    adjustPointsDelta,
                    adjustPointsReason
                  );
                }
                setShowAdjustPointsModal(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Jumlah Perubahan Poin (+ atau -)
                </label>
                <input
                  type="number"
                  required
                  value={adjustPointsDelta}
                  onChange={(e) => setAdjustPointsDelta(Number(e.target.value) || 0)}
                  placeholder="Contoh: 25 untuk tambah, -10 untuk kurangi"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-sm outline-none focus:border-amber-600"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Hasil saldo akhir: {Math.max(0, showAdjustPointsModal.points + adjustPointsDelta)} Poin
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  value={adjustPointsReason}
                  onChange={(e) => setAdjustPointsReason(e.target.value)}
                  placeholder="Contoh: Bonus ulang tahun / Event toko"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustPointsModal(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Terapkan Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH MENU BARU */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 mb-1">Tambah Menu Baru</h3>
            <p className="text-xs text-stone-500 mb-6">
              Masukkan detail produk makanan atau minuman ke menu toko online Anda.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Produk / Makanan *</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Contoh: Es Kopi Gula Aren, Mie Ayam Jamur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium outline-none"
                  >
                    <option value="kopi">Kopi & Minuman</option>
                    <option value="makanan">Makanan Utama</option>
                    <option value="bakery">Bakery & Roti</option>
                    <option value="minuman">Camilan / Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Harga Dasar (Rp) *</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Ceritakan rasa atau bahan spesial menu ini..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-none focus:border-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Aktifkan Opsi Porsi (Regular & Jumbo)</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl text-xs hover:bg-stone-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KIRIM PENGINGAT WHATSAPP PESANAN */}
      {selectedOrderForWaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderForWaModal(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Kirim Pengingat WhatsApp Status Pesanan
                </h3>
                <p className="text-xs text-stone-500">
                  Pelanggan: <strong className="text-stone-800">{selectedOrderForWaModal.customerName}</strong> ({selectedOrderForWaModal.customerPhone})
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Nomor Pesanan:</span>
                <span className="font-mono font-bold text-stone-900">{selectedOrderForWaModal.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Status Saat Ini:</span>
                <div>{renderOrderStatusBadge(selectedOrderForWaModal.status, true)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Belanja:</span>
                <span className="font-bold text-stone-900">Rp {selectedOrderForWaModal.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Template Preview */}
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Pratinjau Pesan yang Akan Dikirim:
              </label>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-stone-800 leading-relaxed font-sans whitespace-pre-line">
                {(() => {
                  const tpl =
                    selectedOrderForWaModal.status === 'cooking'
                      ? waTemplates.cooking
                      : selectedOrderForWaModal.status === 'delivering'
                      ? waTemplates.delivering
                      : selectedOrderForWaModal.status === 'completed'
                      ? waTemplates.completed
                      : waTemplates.new;

                  return tpl
                    .replace(/{{nama}}/g, selectedOrderForWaModal.customerName)
                    .replace(/{{no_pesanan}}/g, selectedOrderForWaModal.orderNumber)
                    .replace(/{{nama_toko}}/g, store.name)
                    .replace(/{{total}}/g, `Rp ${selectedOrderForWaModal.total.toLocaleString('id-ID')}`)
                    .replace(/{{alamat}}/g, selectedOrderForWaModal.deliveryAddress);
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  const custName = selectedOrderForWaModal.customerName;
                  const phone = selectedOrderForWaModal.customerPhone;
                  setSelectedOrderForWaModal(null);
                  setWaToast(
                    `✓ Pesan pengingat status WhatsApp Business API terkirim ke ${custName} (${phone})!`
                  );
                  setTimeout(() => setWaToast(null), 4000);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim via WhatsApp Business API (Instan)</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/62${selectedOrderForWaModal.customerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                    waTemplates.new
                      .replace(/{{nama}}/g, selectedOrderForWaModal.customerName)
                      .replace(/{{no_pesanan}}/g, selectedOrderForWaModal.orderNumber)
                      .replace(/{{nama_toko}}/g, store.name)
                      .replace(/{{total}}/g, `Rp ${selectedOrderForWaModal.total.toLocaleString('id-ID')}`)
                      .replace(/{{alamat}}/g, selectedOrderForWaModal.deliveryAddress)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs text-center transition-colors"
                >
                  Buka Chat Manual
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForWaModal(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-xl text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU DOKUMEN LAPORAN PENJUALAN */}
      {showReportPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none">
            {/* Modal Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Pratinjau Dokumen Laporan Penjualan
                  </h3>
                  <p className="text-xs text-stone-500">
                    Arsip resmi pembukuan kasir & pelaporan keuangan toko Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReportPreviewModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content Body */}
            <div className="overflow-y-auto py-5 space-y-6 flex-1 text-xs text-stone-800">
              {/* Document Letterhead */}
              <div className="bg-stone-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-white/20 bg-white shrink-0"
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight">{store.name}</h2>
                    <p className="text-xs text-stone-300">
                      {store.categoryLabel} · {store.city} · WhatsApp: {store.whatsapp}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right text-[11px] text-stone-300 border-t sm:border-0 border-stone-800 pt-2 sm:pt-0">
                  <span className="font-bold text-amber-400 block text-xs">LAPORAN PENJUALAN RESMI</span>
                  <span>Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </div>
              </div>

              {/* KPI Executive Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-[11px] text-stone-500 block">Total Omzet:</span>
                  <span className="text-base font-extrabold text-amber-900 tabular-nums">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block">Total Pesanan:</span>
                  <span className="text-base font-bold text-stone-900 tabular-nums">
                    {storeOrders.length} Pesanan
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block">Rata-rata Keranjang:</span>
                  <span className="text-base font-bold text-stone-900 tabular-nums">
                    Rp {averageOrderValue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block">Potongan Komisi:</span>
                  <span className="text-base font-bold text-emerald-700">0% (Rp 0)</span>
                </div>
              </div>

              {/* 1. Weekly Performance Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm">
                  1. Rekap Performa Penjualan Harian (Senin - Minggu)
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3">Hari</th>
                        <th className="py-2 px-3">Jumlah Pesanan</th>
                        <th className="py-2 px-3">Rata-rata Order</th>
                        <th className="py-2 px-3 text-right">Total Pendapatan (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {activeWeeklyData.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-stone-50/60' : 'bg-white'}>
                          <td className="py-2 px-3 font-semibold text-stone-900">{item.day}</td>
                          <td className="py-2 px-3">{item.pesanan} Pesanan</td>
                          <td className="py-2 px-3 tabular-nums">Rp {item.aov.toLocaleString('id-ID')}</td>
                          <td className="py-2 px-3 text-right font-bold text-stone-900 tabular-nums">
                            Rp {item.pendapatan.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Detailed Transactions Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm">
                  2. Rincian Histori Transaksi Pesanan Masuk
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3">No. Order</th>
                        <th className="py-2 px-3">Nama Pelanggan</th>
                        <th className="py-2 px-3">Tipe</th>
                        <th className="py-2 px-3">Pembayaran</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Total (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {storeOrders.map((ord, idx) => (
                        <tr key={ord.id} className={idx % 2 === 1 ? 'bg-stone-50/60' : 'bg-white'}>
                          <td className="py-2 px-3 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                          <td className="py-2 px-3">{ord.customerName}</td>
                          <td className="py-2 px-3">
                            {ord.deliveryType === 'dine_in'
                              ? `Makan di Tempat (${ord.tableNumber || 'Meja'})`
                              : ord.deliveryType === 'delivery'
                              ? 'Delivery'
                              : 'Takeaway'}
                          </td>
                          <td className="py-2 px-3 uppercase text-stone-600">{ord.paymentMethod}</td>
                          <td className="py-2 px-3">
                            {renderOrderStatusBadge(ord.status, true)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-stone-900 tabular-nums">
                            Rp {ord.total.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Seal / Signature Disclaimer */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-stone-500">
                <div>
                  <p className="font-semibold text-stone-700">PesanKuliner Indonesia Official Export</p>
                  <p>Dokumen ini sah untuk keperluan audit, arsip kasir, dan perpajakan UMKM kuliner.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono bg-stone-100 px-2.5 py-1 rounded text-stone-600">
                    STATUS: TERVERIFIKASI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME INCOMING ORDER TOAST NOTIFICATION */}
      {newOrderToast && (
        <div className="fixed top-5 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden">
          {/* Top colored strip with beacon */}
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
              </span>
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>PESANAN BARU MASUK!</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsSoundAlertActive(!isSoundAlertActive)}
                className="p-1 rounded hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                title={isSoundAlertActive ? 'Suara Bel Aktif (Klik untuk Mute)' : 'Suara Bel Mati (Klik untuk Nyalakan)'}
              >
                {isSoundAlertActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setNewOrderToast(null)}
                className="p-1 rounded hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toast Body */}
          <div className="p-4 space-y-3 text-stone-800">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-stone-900 text-sm">
                    {newOrderToast.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      newOrderToast.deliveryType === 'delivery'
                        ? 'bg-amber-100 text-amber-800'
                        : newOrderToast.deliveryType === 'dine_in'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {newOrderToast.deliveryType === 'delivery' ? (
                      <Bike className="w-3 h-3" />
                    ) : newOrderToast.deliveryType === 'dine_in' ? (
                      <UtensilsCrossed className="w-3 h-3" />
                    ) : (
                      <ShoppingBag className="w-3 h-3" />
                    )}
                    <span>
                      {newOrderToast.deliveryType === 'delivery'
                        ? 'Delivery'
                        : newOrderToast.deliveryType === 'dine_in'
                        ? `Makan di Tempat (${newOrderToast.tableNumber || 'Meja'})`
                        : 'Takeaway'}
                    </span>
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-700 mt-0.5">
                  Pemesan: <strong className="text-stone-900">{newOrderToast.customerName}</strong> ({newOrderToast.customerPhone})
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-amber-700 tabular-nums block">
                  Rp {newOrderToast.total.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] font-bold uppercase text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                  {newOrderToast.paymentMethod === 'qris' ? 'QRIS' : 'COD'}
                </span>
              </div>
            </div>

            {/* Items summary */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-xs space-y-1">
              <p className="font-medium text-stone-500 text-[11px]">Rincian Menu ({newOrderToast.items.length} jenis):</p>
              {newOrderToast.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-stone-800 text-xs">
                  <span className="font-semibold truncate max-w-[220px]">
                    {it.quantity}x {it.productName}
                    {it.variantSummary && it.variantSummary !== 'Original' && (
                      <span className="text-stone-500 font-normal"> ({it.variantSummary})</span>
                    )}
                  </span>
                  <span className="font-mono tabular-nums text-stone-600">
                    Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleStatusChangeWithWa(newOrderToast, 'cooking');
                  setNewOrderToast(null);
                }}
                className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Terima & Masak</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNewOrderModal(newOrderToast);
                  setNewOrderToast(null);
                }}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Detail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RINCIAN PESANAN BARU LENGKAP */}
      {activeNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <BellRing className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900">
                      Pesanan {activeNewOrderModal.orderNumber}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Baru Masuk
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Diterima {activeNewOrderModal.createdAt} · Pembayaran {activeNewOrderModal.paymentMethod === 'qris' ? 'QRIS' : 'COD (Tunai)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveNewOrderModal(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto py-4 space-y-4 text-xs flex-1">
              {/* Customer Contact & Delivery Details */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">{activeNewOrderModal.customerName}</span>
                  <a
                    href={`https://wa.me/62${activeNewOrderModal.customerPhone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat {activeNewOrderModal.customerPhone}</span>
                  </a>
                </div>

                <div className="text-stone-600 space-y-1 pt-1 border-t border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    {activeNewOrderModal.deliveryType === 'delivery' ? (
                      <>
                        <Bike className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-medium text-stone-800 shrink-0">Alamat Delivery:</span>
                        <span className="text-stone-600 truncate">{activeNewOrderModal.deliveryAddress}</span>
                      </>
                    ) : activeNewOrderModal.deliveryType === 'dine_in' ? (
                      <>
                        <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-stone-800 shrink-0">Nomor Meja:</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {activeNewOrderModal.tableNumber || 'Meja 01'} (Makan di Tempat)
                        </span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        <span className="font-medium text-stone-800">Ambil Sendiri di Toko</span>
                      </>
                    )}
                  </div>
                  {activeNewOrderModal.notes && (
                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg text-[11px] font-medium border border-amber-200/60">
                      📝 Catatan Pemesan: "{activeNewOrderModal.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="font-bold text-stone-800 text-xs">Menu Dipesan:</p>
                <div className="border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
                  {activeNewOrderModal.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900 text-xs">
                          {item.quantity}x {item.productName}
                        </span>
                        {item.variantSummary && (
                          <p className="text-[11px] text-stone-500">{item.variantSummary}</p>
                        )}
                      </div>
                      <span className="font-bold text-stone-900 tabular-nums text-xs">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Menu:</span>
                  <span className="tabular-nums">Rp {activeNewOrderModal.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>
                    Ongkos Kirim ({activeNewOrderModal.deliveryType === 'delivery' ? `Delivery ${activeNewOrderModal.deliveryDistanceKm ? `${activeNewOrderModal.deliveryDistanceKm} KM` : ''}` : activeNewOrderModal.deliveryType === 'dine_in' ? `Makan di Tempat (${activeNewOrderModal.tableNumber || 'Meja'})` : 'Ambil Sendiri'}):
                  </span>
                  <span className="tabular-nums">Rp {activeNewOrderModal.deliveryFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1.5 border-t border-stone-200">
                  <span>Total Tagihan:</span>
                  <span className="text-amber-700 tabular-nums">
                    Rp {activeNewOrderModal.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleStatusChangeWithWa(activeNewOrderModal, 'cooking');
                  setActiveNewOrderModal(null);
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ChefHat className="w-4 h-4" />
                <span>Terima Pesanan & Mulai Masak</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNewOrderModal(null)}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
