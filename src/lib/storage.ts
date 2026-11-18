import {
  FREE_DELIVERY_THRESHOLD,
  INITIAL_PRODUCTS,
  STANDARD_DELIVERY_FEE,
} from '../data/catalog';
import {
  CartItem,
  CustomerInfo,
  CustomerPreferences,
  DemoOrder,
  OrderItem,
  Product,
  StoreData,
  WishlistItem,
} from '../types/store';

export const STORAGE_KEY = 'qalam_paper_store';
export const STORAGE_VERSION = '1.1.0';

export const DEFAULT_CUSTOMER_INFO: CustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  city: 'Lahore',
  area: '',
  address: '',
  notes: '',
  paymentMethod: 'cod',
};

export const DEFAULT_PREFERENCES: CustomerPreferences = {
  preferredSort: 'featured',
  promoBannerDismissed: false,
};

export function createDefaultStoreData(): StoreData {
  return {
    version: STORAGE_VERSION,
    products: INITIAL_PRODUCTS,
    cart: [],
    wishlist: [],
    customerInfo: { ...DEFAULT_CUSTOMER_INFO },
    preferences: { ...DEFAULT_PREFERENCES },
    orders: [],
    shoppingHistory: [],
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitizeStoreData(raw: unknown): StoreData {
  const fallback = createDefaultStoreData();
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const parsed = raw as Partial<StoreData>;
  const needsImageUpgrade = parsed.version !== STORAGE_VERSION;
  const canonicalById = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));

  // Preserve customer data across versions while ensuring valid structure
  const products =
    Array.isArray(parsed.products) && parsed.products.length > 0
      ? parsed.products
          .filter(
            (p): p is Product =>
              Boolean(
                p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.price === 'number'
              )
          )
          .map((p) => {
            if (!needsImageUpgrade) return p;
            const canonical = canonicalById.get(p.id);
            return canonical ? { ...p, image: canonical.image } : p;
          })
      : fallback.products;

  const cart = Array.isArray(parsed.cart)
    ? parsed.cart.filter(
        (c): c is CartItem =>
          Boolean(c && typeof c.productId === 'string' && typeof c.quantity === 'number' && c.quantity > 0)
      )
    : [];

  const wishlist = Array.isArray(parsed.wishlist)
    ? parsed.wishlist.filter((w): w is WishlistItem => Boolean(w && typeof w.productId === 'string'))
    : [];

  const customerInfo: CustomerInfo =
    parsed.customerInfo && typeof parsed.customerInfo === 'object'
      ? { ...DEFAULT_CUSTOMER_INFO, ...parsed.customerInfo }
      : { ...DEFAULT_CUSTOMER_INFO };

  const preferences: CustomerPreferences =
    parsed.preferences && typeof parsed.preferences === 'object'
      ? { ...DEFAULT_PREFERENCES, ...parsed.preferences }
      : { ...DEFAULT_PREFERENCES };

  const orders = Array.isArray(parsed.orders)
    ? parsed.orders.filter(
        (o): o is DemoOrder => Boolean(o && typeof o.orderId === 'string' && Array.isArray(o.items))
      )
    : [];

  const shoppingHistory = Array.isArray(parsed.shoppingHistory)
    ? parsed.shoppingHistory.filter((id): id is string => typeof id === 'string')
    : [];

  return {
    version: STORAGE_VERSION,
    products: products.length > 0 ? products : fallback.products,
    cart,
    wishlist,
    customerInfo,
    preferences,
    orders,
    shoppingHistory,
  };
}

export function initializeStoreData(): StoreData {
  if (!isBrowser()) {
    return createDefaultStoreData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultStoreData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeStoreData(parsed);

    // Upgrade version tag if needed without overwriting existing customer records
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }

    return sanitized;
  } catch {
    // Recover gracefully if LocalStorage JSON is corrupted
    const recovered = createDefaultStoreData();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));
    } catch {
      // Ignore storage quota / privacy mode errors
    }
    return recovered;
  }
}

export function saveStoreData(data: StoreData): StoreData {
  const payload: StoreData = {
    ...data,
    version: STORAGE_VERSION,
  };
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors gracefully
    }
  }
  return payload;
}

export function resetAllStoreData(): StoreData {
  const fresh = createDefaultStoreData();
  return saveStoreData(fresh);
}

// Product CRUD helpers
export function upsertProductInStore(data: StoreData, product: Product): StoreData {
  const exists = data.products.some((p) => p.id === product.id);
  const nextProducts = exists
    ? data.products.map((p) => (p.id === product.id ? product : p))
    : [product, ...data.products];
  return saveStoreData({ ...data, products: nextProducts });
}

export function deleteProductFromStore(data: StoreData, productId: string): StoreData {
  return saveStoreData({
    ...data,
    products: data.products.filter((p) => p.id !== productId),
    cart: data.cart.filter((c) => c.productId !== productId),
    wishlist: data.wishlist.filter((w) => w.productId !== productId),
  });
}

// Cart helpers
export function calculateCartSummary(cart: CartItem[], products: Product[]) {
  let subtotal = 0;
  let totalItems = 0;

  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const unitPrice =
      product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
    subtotal += unitPrice * item.quantity;
    totalItems += item.quantity;
  }

  const shippingFee =
    subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const total = subtotal + shippingFee;
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return {
    subtotal,
    shippingFee,
    total,
    totalItems,
    amountToFreeDelivery,
  };
}

export function addItemToCartInStore(
  data: StoreData,
  productId: string,
  variation: string,
  quantity = 1
): StoreData {
  const product = data.products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return data;

  const safeQty = Math.max(1, Math.min(quantity, product.stock));
  const existing = data.cart.find(
    (c) => c.productId === productId && c.selectedVariation === variation
  );

  let nextCart: CartItem[];
  if (existing) {
    nextCart = data.cart.map((c) =>
      c.productId === productId && c.selectedVariation === variation
        ? { ...c, quantity: Math.min(product.stock, c.quantity + safeQty) }
        : c
    );
  } else {
    nextCart = [
      ...data.cart,
      {
        productId,
        selectedVariation: variation,
        quantity: safeQty,
        addedAt: new Date().toISOString(),
      },
    ];
  }

  return saveStoreData({ ...data, cart: nextCart });
}

export function updateCartQuantityInStore(
  data: StoreData,
  productId: string,
  variation: string,
  quantity: number
): StoreData {
  if (quantity <= 0) {
    return removeCartItemFromStore(data, productId, variation);
  }

  const product = data.products.find((p) => p.id === productId);
  const maxStock = product ? Math.max(1, product.stock) : 99;
  const clamped = Math.min(quantity, maxStock);

  const nextCart = data.cart.map((c) =>
    c.productId === productId && c.selectedVariation === variation
      ? { ...c, quantity: clamped }
      : c
  );
  return saveStoreData({ ...data, cart: nextCart });
}

export function removeCartItemFromStore(
  data: StoreData,
  productId: string,
  variation: string
): StoreData {
  const nextCart = data.cart.filter(
    (c) => !(c.productId === productId && c.selectedVariation === variation)
  );
  return saveStoreData({ ...data, cart: nextCart });
}

// Order creation CRUD
export function createDemoOrderInStore(
  data: StoreData,
  customer: CustomerInfo
): { nextData: StoreData; order: DemoOrder | null } {
  const items: OrderItem[] = [];

  for (const cartItem of data.cart) {
    const product = data.products.find((p) => p.id === cartItem.productId);
    if (!product) continue;
    const unitPrice =
      product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
    const qty = Math.min(cartItem.quantity, Math.max(1, product.stock));
    items.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      variation: cartItem.selectedVariation,
      unitPrice,
      quantity: qty,
      lineTotal: unitPrice * qty,
    });
  }

  if (items.length === 0) {
    return { nextData: data, order: null };
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const total = subtotal + shippingFee;

  const orderNumber = 1040 + data.orders.length + 1;
  const order: DemoOrder = {
    orderId: `QP-${orderNumber}`,
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
    customer: { ...customer },
    items,
    subtotal,
    shippingFee,
    total,
  };

  // Decrement stock in LocalStorage catalogue
  const nextProducts = data.products.map((product) => {
    const orderedQty = items
      .filter((i) => i.productId === product.id)
      .reduce((acc, i) => acc + i.quantity, 0);
    if (orderedQty === 0) return product;
    return {
      ...product,
      stock: Math.max(0, product.stock - orderedQty),
    };
  });

  const nextData = saveStoreData({
    ...data,
    products: nextProducts,
    cart: [],
    customerInfo: { ...customer },
    orders: [order, ...data.orders],
  });

  return { nextData, order };
}
