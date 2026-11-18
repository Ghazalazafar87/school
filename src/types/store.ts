export type CategoryId =
  | 'school-bags'
  | 'readers-books'
  | 'lunch-boxes'
  | 'water-bottles'
  | 'pencil-pouches'
  | 'pens-markers'
  | 'notebooks-registers'
  | 'painting-drawing'
  | 'art-craft'
  | 'school-accessories';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  image: string;
}

export interface ProductVariation {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: CategoryId;
  description: string;
  highlights: string[];
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  variations: ProductVariation[];
  stock: number;
  image: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isRecommended?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariation: string;
  addedAt: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  address: string;
  notes: string;
  paymentMethod: 'cod' | 'bank_transfer';
}

export interface CustomerPreferences {
  newsletterEmail?: string;
  newsletterSubscribedAt?: string;
  preferredSort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  promoBannerDismissed: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  variation: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface DemoOrder {
  orderId: string;
  createdAt: string;
  status: 'Confirmed' | 'Preparing Shipment' | 'Dispatched';
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface StoreData {
  version: string;
  products: Product[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  customerInfo: CustomerInfo;
  preferences: CustomerPreferences;
  orders: DemoOrder[];
  shoppingHistory: string[];
}

export type RouteView =
  | { page: 'home' }
  | { page: 'shop'; category?: CategoryId; filter?: string }
  | { page: 'product'; slug: string }
  | { page: 'wishlist' }
  | { page: 'checkout' }
  | { page: 'order-confirmation'; orderId: string }
  | { page: 'orders' }
  | { page: 'contact' };

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  quickLinks?: { label: string; route: RouteView }[];
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
