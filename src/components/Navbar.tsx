import React, { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, formatPKR } from '../data/catalog';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    store,
    route,
    navigate,
    searchQuery,
    setSearchQuery,
    cartSummary,
    setCartOpen,
    updatePreferences,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setSearchOpen(false);
    navigate({ page: 'shop' });
  };

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
      active
        ? 'text-blue-700 border-blue-700'
        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
    }`;

  return (
    <>
      {!store.preferences.promoBannerDismissed && (
        <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <p className="truncate">
              Cash on Delivery across Pakistan · Free shipping on orders over{' '}
              <span className="font-semibold tabular-nums">{formatPKR(FREE_DELIVERY_THRESHOLD)}</span>
            </p>
            <button
              type="button"
              onClick={() => updatePreferences({ promoBannerDismissed: true })}
              aria-label="Dismiss announcement"
              className="text-slate-400 hover:text-white p-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate({ page: 'home' });
            }}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left"
          >
            Qalam &amp; Paper
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className={navLinkClass(route.page === 'home')}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop' })}
              className={navLinkClass(route.page === 'shop' && route.filter !== 'offers')}
            >
              Shop
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', filter: 'offers' })}
              className={navLinkClass(route.page === 'shop' && route.filter === 'offers')}
            >
              Offers
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'orders' })}
              className={navLinkClass(route.page === 'orders')}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'contact' })}
              className={navLinkClass(route.page === 'contact')}
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: Search, Wishlist, Cart & Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search products"
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate({ page: 'wishlist' })}
              aria-label={`Wishlist (${store.wishlist.length} items)`}
              className="relative p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Heart className="w-4 h-4" />
              {store.wishlist.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {store.wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping cart (${cartSummary.totalItems} items)`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-700 text-white text-xs sm:text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              <span className="tabular-nums">({cartSummary.totalItems})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 sm:px-6 py-3">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search backpacks, gel pens, registers, water bottles, story books..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search school supplies..."
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3.5 py-2 text-sm font-semibold bg-blue-700 text-white rounded-lg"
              >
                Go
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Home', route: { page: 'home' } as const },
                { label: 'Shop All', route: { page: 'shop' } as const },
                { label: 'Special Offers', route: { page: 'shop', filter: 'offers' } as const },
                { label: 'Wishlist', route: { page: 'wishlist' } as const },
                { label: 'My Orders', route: { page: 'orders' } as const },
                { label: 'Contact Us', route: { page: 'contact' } as const },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(item.route);
                  }}
                  className="text-left px-3 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate({ page: 'shop', category: cat.id });
                    }}
                    className="text-left px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-md truncate"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
