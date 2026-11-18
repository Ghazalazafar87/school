import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, getEffectivePrice } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { CategoryId, CustomerPreferences } from '../types/store';
import { ProductCard } from './ProductCard';

type PriceRangeId = 'all' | 'under-500' | '500-1500' | '1500-3000' | 'over-3000';

export const ShopCatalog: React.FC<{
  initialCategory?: CategoryId;
  initialFilter?: string;
}> = ({ initialCategory, initialFilter }) => {
  const {
    store,
    route,
    navigate,
    searchQuery,
    setSearchQuery,
    updatePreferences,
  } = useStore();

  const activeCategory = route.page === 'shop' ? route.category : initialCategory;
  const activeSpecial = route.page === 'shop' ? route.filter : initialFilter;

  const [priceRange, setPriceRange] = useState<PriceRangeId>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sortBy = store.preferences.preferredSort;

  const setSortBy = (next: CustomerPreferences['preferredSort']) => {
    updatePreferences({ preferredSort: next });
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = store.products.filter((product) => {
      if (activeCategory && product.category !== activeCategory) return false;

      if (activeSpecial === 'offers' && !(product.discountPrice && product.discountPrice < product.price)) {
        return false;
      }
      if (activeSpecial === 'new' && !product.isNewArrival) {
        return false;
      }
      if (activeSpecial === 'bestsellers' && !product.isBestSeller) {
        return false;
      }

      if (inStockOnly && product.stock <= 0) return false;

      const price = getEffectivePrice(product);
      if (priceRange === 'under-500' && price >= 500) return false;
      if (priceRange === '500-1500' && (price < 500 || price > 1500)) return false;
      if (priceRange === '1500-3000' && (price <= 1500 || price > 3000)) return false;
      if (priceRange === 'over-3000' && price <= 3000) return false;

      if (q) {
        const catName = CATEGORIES.find((c) => c.id === product.category)?.name.toLowerCase() ?? '';
        const text = `${product.name} ${product.description} ${catName} ${product.sku}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        list = [...list].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        list = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        list = [...list].sort(
          (a, b) => Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller))
        );
        break;
    }

    return list;
  }, [store.products, activeCategory, activeSpecial, inStockOnly, priceRange, searchQuery, sortBy]);

  const recentlyViewed = useMemo(() => {
    return store.shoppingHistory
      .map((id) => store.products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 3);
  }, [store.shoppingHistory, store.products]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange('all');
    setInStockOnly(false);
    navigate({ page: 'shop' });
  };

  const activeCategoryName = activeCategory
    ? CATEGORIES.find((c) => c.id === activeCategory)?.name
    : activeSpecial === 'offers'
    ? 'Special Offers & Discounts'
    : activeSpecial === 'new'
    ? 'New Arrivals'
    : activeSpecial === 'bestsellers'
    ? 'Best Selling Products'
    : 'All Stationery & School Supplies';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* Page Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
            Catalog
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {activeCategoryName}
          </h1>
          <p className="text-sm text-slate-600 mt-1 tabular-nums">
            Showing {filteredProducts.length} of {store.products.length} items
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name..."
              aria-label="Search catalog"
              className="w-full sm:w-64 pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white border border-slate-300 rounded-lg text-slate-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CustomerPreferences['preferredSort'])}
              aria-label="Sort products"
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Popularity &amp; Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split: Sidebar Filters + Product Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        <aside
          className={`lg:col-span-3 space-y-6 ${
            mobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Quick Collections */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Collections
            </p>
            {[
              { label: 'All Products', filter: undefined },
              { label: 'Special Offers', filter: 'offers' },
              { label: 'Best Sellers', filter: 'bestsellers' },
              { label: 'New Arrivals', filter: 'new' },
            ].map((item) => {
              const active = !activeCategory && activeSpecial === item.filter;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate({ page: 'shop', filter: item.filter })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* 10 Categories */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Categories
            </p>
            {CATEGORIES.map((cat) => {
              const count = store.products.filter((p) => p.category === cat.id).length;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: cat.id })}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-xs text-slate-400 tabular-nums shrink-0">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Price Filter */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Price Range (PKR)
            </p>
            {[
              { id: 'all', label: 'All Prices' },
              { id: 'under-500', label: 'Under Rs. 500' },
              { id: '500-1500', label: 'Rs. 500 – Rs. 1,500' },
              { id: '1500-3000', label: 'Rs. 1,500 – Rs. 3,000' },
              { id: 'over-3000', label: 'Above Rs. 3,000' },
            ].map((range) => (
              <label
                key={range.id}
                className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer py-1"
              >
                <input
                  type="radio"
                  name="price-range"
                  checked={priceRange === range.id}
                  onChange={() => setPriceRange(range.id as PriceRangeId)}
                  className="accent-blue-700"
                />
                <span>{range.label}</span>
              </label>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-200">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-blue-700 rounded"
                />
                <span>In stock only</span>
              </label>
            </div>
          </div>

          {(activeCategory || activeSpecial || priceRange !== 'all' || searchQuery || inStockOnly) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Reset All Filters
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="font-display text-lg font-bold text-slate-900 mb-1">
                No matching supplies found
              </p>
              <p className="text-sm text-slate-500 mb-5">
                Try clearing your price range or search term to explore all 10 categories.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Shopping History */}
      {recentlyViewed.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-5">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
