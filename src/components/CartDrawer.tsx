import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { FREE_DELIVERY_THRESHOLD, formatPKR, getEffectivePrice } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductImage } from './ProductImage';

export const CartDrawer: React.FC = () => {
  const {
    store,
    cartOpen,
    setCartOpen,
    cartSummary,
    updateCartQuantity,
    removeFromCart,
    navigate,
  } = useStore();

  if (!cartOpen) return null;

  const progressPct = Math.min(100, Math.round((cartSummary.subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={() => setCartOpen(false)}
      />

      <aside className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-700" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Shopping Cart <span className="text-slate-500 font-normal text-sm tabular-nums">({cartSummary.totalItems})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {store.cart.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-xs text-slate-700 mb-1.5">
              {cartSummary.amountToFreeDelivery > 0 ? (
                <>
                  Add <span className="font-semibold tabular-nums">{formatPKR(cartSummary.amountToFreeDelivery)}</span> more for free Cash on Delivery shipping.
                </>
              ) : (
                <span className="font-semibold text-emerald-700">
                  Your order qualifies for Free Delivery across Pakistan.
                </span>
              )}
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
          {store.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
              <p className="text-base font-semibold text-slate-900 mb-1">Your cart is empty</p>
              <p className="text-sm text-slate-500 max-w-xs mb-5">
                Explore school bags, notebooks, pens, story books, and art supplies saved straight to your browser.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate({ page: 'shop' });
                }}
                className="px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800"
              >
                Browse Supplies
              </button>
            </div>
          ) : (
            store.cart.map((item) => {
              const product = store.products.find((p) => p.id === item.productId);
              if (!product) return null;
              const unitPrice = getEffectivePrice(product);
              return (
                <div
                  key={`${item.productId}-${item.selectedVariation}`}
                  className="py-4 flex gap-3.5"
                >
                  <div
                    onClick={() => {
                      setCartOpen(false);
                      navigate({ page: 'product', slug: product.slug });
                    }}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 cursor-pointer border border-slate-200"
                  >
                    <ProductImage src={product.image} alt={product.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => {
                          setCartOpen(false);
                          navigate({ page: 'product', slug: product.slug });
                        }}
                        className="text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-700"
                      >
                        {product.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.selectedVariation)}
                        aria-label={`Remove ${product.name}`}
                        className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">{item.selectedVariation}</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.selectedVariation, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="p-1.5 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.selectedVariation, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="p-1.5 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatPKR(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Totals */}
        {store.cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-slate-900">
                  {formatPKR(cartSummary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>COD Shipping</span>
                <span className="tabular-nums font-medium text-slate-900">
                  {cartSummary.shippingFee === 0 ? 'Free' : formatPKR(cartSummary.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="tabular-nums">{formatPKR(cartSummary.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                navigate({ page: 'checkout' });
              }}
              className="w-full py-3 px-4 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Proceed to Cash on Delivery Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
