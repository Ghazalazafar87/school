import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addItemToCartInStore,
  calculateCartSummary,
  createDemoOrderInStore,
  deleteProductFromStore,
  initializeStoreData,
  removeCartItemFromStore,
  resetAllStoreData,
  saveStoreData,
  updateCartQuantityInStore,
  upsertProductInStore,
} from '../lib/storage';
import {
  CategoryId,
  CustomerInfo,
  CustomerPreferences,
  DemoOrder,
  Product,
  RouteView,
  StoreData,
  ToastNotification,
} from '../types/store';

interface StoreContextValue {
  store: StoreData;
  isHydrated: boolean;
  route: RouteView;
  navigate: (nextRoute: RouteView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  chatbotOpen: boolean;
  setChatbotOpen: (open: boolean) => void;
  cartSummary: ReturnType<typeof calculateCartSummary>;
  addToCart: (productId: string, variation?: string, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, variation: string, quantity: number) => void;
  removeFromCart: (productId: string, variation: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  updateCustomerInfo: (info: CustomerInfo) => void;
  updatePreferences: (patch: Partial<CustomerPreferences>) => void;
  placeDemoOrder: (customer: CustomerInfo) => DemoOrder | null;
  recordProductView: (productId: string) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetDemoStore: () => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function parseRouteFromHash(): RouteView {
  if (typeof window === 'undefined') return { page: 'home' };
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/') return { page: 'home' };

  const [pathPart, queryPart] = hash.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart || '');

  if (segments[0] === 'shop') {
    const category = params.get('category') as CategoryId | null;
    const filter = params.get('filter') ?? undefined;
    return { page: 'shop', category: category || undefined, filter };
  }
  if (segments[0] === 'product' && segments[1]) {
    return { page: 'product', slug: decodeURIComponent(segments[1]) };
  }
  if (segments[0] === 'wishlist') return { page: 'wishlist' };
  if (segments[0] === 'checkout') return { page: 'checkout' };
  if (segments[0] === 'orders') return { page: 'orders' };
  if (segments[0] === 'contact') return { page: 'contact' };
  if (segments[0] === 'order-confirmation' && segments[1]) {
    return { page: 'order-confirmation', orderId: decodeURIComponent(segments[1]) };
  }
  return { page: 'home' };
}

function serializeRouteToHash(route: RouteView): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'shop': {
      const params = new URLSearchParams();
      if (route.category) params.set('category', route.category);
      if (route.filter) params.set('filter', route.filter);
      const qs = params.toString();
      return qs ? `#/shop?${qs}` : '#/shop';
    }
    case 'product':
      return `#/product/${encodeURIComponent(route.slug)}`;
    case 'wishlist':
      return '#/wishlist';
    case 'checkout':
      return '#/checkout';
    case 'orders':
      return '#/orders';
    case 'contact':
      return '#/contact';
    case 'order-confirmation':
      return `#/order-confirmation/${encodeURIComponent(route.orderId)}`;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreData>(() => initializeStoreData());
  const [isHydrated, setIsHydrated] = useState(false);
  const [route, setRoute] = useState<RouteView>(() => parseRouteFromHash());
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    setStore(initializeStoreData());
    setIsHydrated(true);

    const onHashChange = () => {
      setRoute(parseRouteFromHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const navigate = useCallback((nextRoute: RouteView) => {
    setRoute(nextRoute);
    if (typeof window !== 'undefined') {
      const nextHash = serializeRouteToHash(nextRoute);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const addToCart = useCallback(
    (productId: string, variation?: string, quantity = 1, openDrawer = true) => {
      const product = store.products.find((p) => p.id === productId);
      if (!product) return;
      if (product.stock <= 0) {
        showToast(`${product.name} is currently out of stock.`, 'error');
        return;
      }
      const chosenVariation = variation || product.variations[0]?.name || 'Standard';
      setStore((prev) => addItemToCartInStore(prev, productId, chosenVariation, quantity));
      showToast(`Added "${product.name}" to your cart.`);
      if (openDrawer) {
        setCartOpen(true);
      }
    },
    [store.products, showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, variation: string, quantity: number) => {
      setStore((prev) => updateCartQuantityInStore(prev, productId, variation, quantity));
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, variation: string) => {
      setStore((prev) => removeCartItemFromStore(prev, productId, variation));
      showToast('Item removed from cart.', 'info');
    },
    [showToast]
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      const product = store.products.find((p) => p.id === productId);
      setStore((prev) => {
        const exists = prev.wishlist.some((w) => w.productId === productId);
        const nextWishlist = exists
          ? prev.wishlist.filter((w) => w.productId !== productId)
          : [{ productId, addedAt: new Date().toISOString() }, ...prev.wishlist];
        return saveStoreData({ ...prev, wishlist: nextWishlist });
      });
      const wasSaved = store.wishlist.some((w) => w.productId === productId);
      if (product) {
        showToast(
          wasSaved ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`,
          wasSaved ? 'info' : 'success'
        );
      }
    },
    [store.products, store.wishlist, showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => store.wishlist.some((w) => w.productId === productId),
    [store.wishlist]
  );

  const updateCustomerInfo = useCallback((info: CustomerInfo) => {
    setStore((prev) => saveStoreData({ ...prev, customerInfo: info }));
  }, []);

  const updatePreferences = useCallback((patch: Partial<CustomerPreferences>) => {
    setStore((prev) =>
      saveStoreData({
        ...prev,
        preferences: { ...prev.preferences, ...patch },
      })
    );
  }, []);

  const placeDemoOrder = useCallback(
    (customer: CustomerInfo): DemoOrder | null => {
      const { nextData, order } = createDemoOrderInStore(store, customer);
      if (!order) {
        return null;
      }
      setStore(nextData);
      showToast(`Order ${order.orderId} confirmed!`);
      return order;
    },
    [store, showToast]
  );

  const recordProductView = useCallback((productId: string) => {
    setStore((prev) => {
      const deduped = [productId, ...prev.shoppingHistory.filter((id) => id !== productId)].slice(0, 8);
      return saveStoreData({ ...prev, shoppingHistory: deduped });
    });
  }, []);

  const upsertProduct = useCallback(
    (product: Product) => {
      setStore((prev) => upsertProductInStore(prev, product));
      showToast(`Saved product "${product.name}".`);
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setStore((prev) => deleteProductFromStore(prev, productId));
      showToast('Product removed from catalogue.', 'info');
    },
    [showToast]
  );

  const resetDemoStore = useCallback(() => {
    const fresh = resetAllStoreData();
    setStore(fresh);
    showToast('Store data reset to initial sample catalogue.', 'info');
  }, [showToast]);

  const cartSummary = useMemo(
    () => calculateCartSummary(store.cart, store.products),
    [store.cart, store.products]
  );

  const value: StoreContextValue = {
    store,
    isHydrated,
    route,
    navigate,
    searchQuery,
    setSearchQuery,
    cartOpen,
    setCartOpen,
    chatbotOpen,
    setChatbotOpen,
    cartSummary,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    isInWishlist,
    updateCustomerInfo,
    updatePreferences,
    placeDemoOrder,
    recordProductView,
    upsertProduct,
    deleteProduct,
    resetDemoStore,
    toasts,
    showToast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
