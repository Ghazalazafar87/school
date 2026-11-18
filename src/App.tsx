import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Navbar } from './components/Navbar';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { OrdersPage } from './components/OrdersPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ShopCatalog } from './components/ShopCatalog';
import { ShoppingChatbot } from './components/ShoppingChatbot';
import { ToastContainer } from './components/ToastContainer';
import { WishlistPage } from './components/WishlistPage';

function StorefrontShell() {
  const { route } = useStore();

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopCatalog initialCategory={route.category} initialFilter={route.filter} />;
      case 'product':
        return <ProductDetailPage slug={route.slug} />;
      case 'wishlist':
        return <WishlistPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage orderId={route.orderId} />;
      case 'orders':
        return <OrdersPage />;
      case 'contact':
        return <ContactPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <CartDrawer />
      <ShoppingChatbot />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StorefrontShell />
    </StoreProvider>
  );
}
