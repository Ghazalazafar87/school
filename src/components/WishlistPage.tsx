import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPKR, getEffectivePrice } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductImage } from './ProductImage';

export const WishlistPage: React.FC = () => {
  const { store, navigate, toggleWishlist, addToCart } = useStore();

  const savedProducts = store.wishlist
    .map((w) => store.products.find((p) => p.id === w.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
            Saved Items
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            My Wishlist ({savedProducts.length})
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Saved persistently in your browser&apos;s LocalStorage across page reloads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 self-start"
        >
          Browse Catalog
        </button>
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-bold text-slate-900 mb-1">
            No saved wishlist items yet
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Tap the heart icon on any school bag, notebook, or art kit to keep it handy for later.
          </p>
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800"
          >
            Explore Supplies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((product) => {
            const effectivePrice = getEffectivePrice(product);
            const outOfStock = product.stock <= 0;
            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div
                  onClick={() => navigate({ page: 'product', slug: product.slug })}
                  className="aspect-[4/3] bg-slate-100 cursor-pointer overflow-hidden"
                >
                  <ProductImage src={product.image} alt={product.name} />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3
                      onClick={() => navigate({ page: 'product', slug: product.slug })}
                      className="text-sm font-semibold text-slate-900 cursor-pointer hover:text-blue-700 line-clamp-2"
                    >
                      {product.name}
                    </h3>
                    <p className="text-base font-bold text-slate-900 tabular-nums mt-1.5">
                      {formatPKR(effectivePrice)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        addToCart(product.id, product.variations[0]?.name, 1, true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {outOfStock ? 'Out of Stock' : 'Move to Cart'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
