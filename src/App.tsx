import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CaraKerja } from './components/CaraKerja';
import { Fitur } from './components/Fitur';
import { UntukSiapa } from './components/UntukSiapa';
import { Harga } from './components/Harga';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { RegistrasiToko } from './components/RegistrasiToko';
import { DashboardAdmin } from './components/DashboardAdmin';
import { CustomerStore } from './components/CustomerStore';
import {
  Store,
  Product,
  Order,
  LoyaltyReward,
  LoyaltyMember,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REWARDS,
  INITIAL_MEMBERS,
} from './types';

export default function App() {
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('pk_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pk_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pk_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [rewards, setRewards] = useState<LoyaltyReward[]>(() => {
    const saved = localStorage.getItem('pk_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [members, setMembers] = useState<LoyaltyMember[]>(() => {
    const saved = localStorage.getItem('pk_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'register' | 'dashboard' | 'store'>('landing');
  const [activeStoreSlug, setActiveStoreSlug] = useState<string>('kopi-toast-senja');
  const [userStore, setUserStore] = useState<Store | null>(() => {
    const saved = localStorage.getItem('pk_user_store');
    return saved ? JSON.parse(saved) : null;
  });

  // Save changes to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('pk_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('pk_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pk_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pk_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('pk_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (userStore) {
      localStorage.setItem('pk_user_store', JSON.stringify(userStore));
    }
  }, [userStore]);

  // Handle successful store registration
  const handleRegisterSuccess = (newStore: Store) => {
    setStores((prev) => [newStore, ...prev]);
    setUserStore(newStore);
    setActiveStoreSlug(newStore.slug);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to specific demo store by category
  const handleExploreStoreByCategory = (category: 'cafe' | 'resto' | 'bakery') => {
    const target = stores.find((s) => s.category === category) || stores[0];
    setActiveStoreSlug(target.slug);
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDemoStore = () => {
    setActiveStoreSlug('kopi-toast-senja');
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Orders and products state updates
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleToggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Loyalty Reward & Member Handlers
  const handleAddReward = (newReward: LoyaltyReward) => {
    setRewards((prev) => [newReward, ...prev]);
  };

  const handleUpdateReward = (updatedReward: LoyaltyReward) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === updatedReward.id ? updatedReward : r))
    );
  };

  const handleDeleteReward = (rewardId: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== rewardId));
  };

  const handleToggleReward = (rewardId: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, isAvailable: !r.isAvailable } : r))
    );
  };

  const handleAdjustMemberPoints = (phone: string, deltaPoints: number, reason?: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.phone === phone.trim()) {
          const nextPoints = Math.max(0, m.points + deltaPoints);
          const nextLifetime = deltaPoints > 0 ? m.lifetimePoints + deltaPoints : m.lifetimePoints;
          const nextTier =
            nextLifetime >= 500
              ? 'Platinum'
              : nextLifetime >= 250
              ? 'Gold'
              : nextLifetime >= 100
              ? 'Silver'
              : 'Bronze';
          return {
            ...m,
            points: nextPoints,
            lifetimePoints: nextLifetime,
            tier: nextTier,
            lastTransactionAt: reason ? `Penyesuaian: ${reason}` : 'Penyesuaian Manual Toko',
          };
        }
        return m;
      })
    );
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Automatically update or create customer loyalty member record
    if (newOrder.customerPhone) {
      const phoneClean = newOrder.customerPhone.trim();
      setMembers((prev) => {
        const existing = prev.find((m) => m.phone === phoneClean);
        const earned =
          newOrder.pointsEarned ??
          Math.max(1, Math.floor(newOrder.subtotal / 1000));
        const spent = newOrder.appliedReward ? newOrder.appliedReward.pointsCost : 0;

        if (existing) {
          const nextPoints = Math.max(0, existing.points + earned - spent);
          const nextLifetime = existing.lifetimePoints + earned;
          const nextSpent = existing.totalSpent + newOrder.total;
          const nextTier =
            nextLifetime >= 500
              ? 'Platinum'
              : nextLifetime >= 250
              ? 'Gold'
              : nextLifetime >= 100
              ? 'Silver'
              : 'Bronze';

          return prev.map((m) =>
            m.phone === phoneClean
              ? {
                  ...m,
                  name: newOrder.customerName || m.name,
                  points: nextPoints,
                  lifetimePoints: nextLifetime,
                  totalSpent: nextSpent,
                  tier: nextTier,
                  lastTransactionAt: 'Hari ini (Transaksi Terakhir)',
                }
              : m
          );
        } else {
          // Auto-enroll new member with welcome bonus
          const welcomeBonus = 15;
          const initialPoints = Math.max(0, earned + welcomeBonus - spent);
          const lifetimePoints = earned + welcomeBonus;
          const nextTier = lifetimePoints >= 100 ? 'Silver' : 'Bronze';

          const newMember: LoyaltyMember = {
            id: `mem-${Date.now()}`,
            storeId: newOrder.storeId,
            name: newOrder.customerName,
            phone: phoneClean,
            points: initialPoints,
            lifetimePoints,
            totalSpent: newOrder.total,
            tier: nextTier,
            joinedAt: 'Hari ini',
            lastTransactionAt: 'Hari ini (Transaksi Pertama)',
          };
          return [newMember, ...prev];
        }
      });
    }
  };

  const handleUpdateStoreSettings = (updatedStore: Store) => {
    setStores((prev) =>
      prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
    );
    if (userStore?.id === updatedStore.id) {
      setUserStore(updatedStore);
    }
  };

  // Find active store object
  const currentActiveStore =
    stores.find((s) => s.slug === activeStoreSlug) ||
    userStore ||
    stores[0];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      {currentView !== 'store' && (
        <Navbar
          onRegisterClick={() => {
            setCurrentView('register');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDashboardClick={() => {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDemoStoreClick={handleOpenDemoStore}
          currentView={currentView}
          onNavigateHome={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          hasRegisteredStore={Boolean(userStore) || true}
          storeName={userStore?.name || 'Kopi & Toast Senja'}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            <Hero
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreDemoStore={handleOpenDemoStore}
            />
            <CaraKerja
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <Fitur
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <UntukSiapa
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreStoreByCategory={handleExploreStoreByCategory}
            />
            <Harga
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <FAQ />
            <Footer
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDemoStoreClick={handleOpenDemoStore}
            />
          </>
        )}

        {currentView === 'register' && (
          <RegistrasiToko
            onRegisterSuccess={handleRegisterSuccess}
            onCancel={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardAdmin
            store={userStore || currentActiveStore}
            orders={orders}
            products={products}
            rewards={rewards}
            loyaltyMembers={members}
            onAddReward={handleAddReward}
            onUpdateReward={handleUpdateReward}
            onDeleteReward={handleDeleteReward}
            onToggleReward={handleToggleReward}
            onAdjustMemberPoints={handleAdjustMemberPoints}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToggleProductAvailability={handleToggleProductAvailability}
            onAddProduct={handleAddProduct}
            onPlaceOrder={handlePlaceOrder}
            onViewCustomerStore={(slug) => {
              setActiveStoreSlug(slug);
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onUpdateStoreSettings={handleUpdateStoreSettings}
          />
        )}

        {currentView === 'store' && (
          <CustomerStore
            store={currentActiveStore}
            products={products}
            rewards={rewards}
            loyaltyMembers={members}
            onPlaceOrder={handlePlaceOrder}
            onBackToHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdmin={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>
    </div>
  );
}
