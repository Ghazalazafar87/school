import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import {
  CATEGORIES,
  FREE_DELIVERY_THRESHOLD,
  WHATSAPP_BASE_URL,
  formatPKR,
  getDiscountPercent,
  getEffectivePrice,
} from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductImage } from './ProductImage';

export const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const {
    store,
    navigate,
    addToCart,
    toggleWishlist,
    isInWishlist,
    recordProductView,
  } = useStore();

  const product = useMemo(
    () => store.products.find((p) => p.slug === slug),
    [store.products, slug]
  );

  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setSelectedVariation(product.variations[0]?.name || 'Standard');
      setQuantity(1);
      recordProductView(product.id);
    }
  }, [product?.id, recordProductView]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
          Product not found
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          This stationery item may have been removed from the catalogue.
        </p>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.category);
  const effectivePrice = getEffectivePrice(product);
  const discountPct = getDiscountPercent(product);
  const outOfStock = product.stock <= 0;
  const saved = isInWishlist(product.id);

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum Qalam & Paper! I would like to order:\n• Product: ${product.name} (${product.sku})\n• Option: ${selectedVariation}\n• Quantity: ${quantity}\n• Estimated Total: ${formatPKR(effectivePrice * quantity)}`
  );
  const whatsappOrderHref = `${WHATSAPP_BASE_URL}?text=${whatsappMessage}`;

  const relatedProducts = store.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product.id, selectedVariation, quantity, false);
    navigate({ page: 'checkout' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-14">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="inline-flex items-center gap-1 text-slate-700 font-medium hover:text-blue-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </button>
        <span aria-hidden="true">/</span>
        {category && (
          <>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: category.id })}
              className="hover:text-blue-700"
            >
              {category.name}
            </button>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </div>

      {/* Main PDP Split */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Sticky Image Left */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <ProductImage src={product.image} alt={product.name} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-mono">SKU: {product.sku}</span>
            <span>Nationwide Cash on Delivery</span>
          </div>
        </div>

        {/* Contiguous Purchase Module Right */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span>{category?.name}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  outOfStock
                    ? 'text-rose-600 font-semibold'
                    : 'text-emerald-700 font-semibold'
                }
              >
                {outOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm tabular-nums">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-slate-900">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">{product.reviewCount} verified reviews</span>
            </div>
          </div>

          <div className="py-4 border-y border-slate-100 flex items-baseline gap-3 tabular-nums">
            <span className="text-3xl font-bold text-slate-900">
              {formatPKR(effectivePrice)}
            </span>
            {discountPct > 0 && (
              <>
                <span className="text-base text-slate-400 line-through">
                  {formatPKR(product.price)}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Save {discountPct}% ({formatPKR(product.price - effectivePrice)})
                </span>
              </>
            )}
          </div>

          <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {product.highlights.length > 0 && (
            <ul className="space-y-2">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Variations */}
          {product.variations.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Option: <span className="text-slate-900 normal-case">{selectedVariation}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => {
                  const selected = selectedVariation === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariation(v.name)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        selected
                          ? 'border-blue-700 bg-blue-50 text-blue-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: v.hex }}
                      />
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-slate-600 hover:text-slate-900"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
                  aria-label="Increase quantity"
                  className="p-3 text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => addToCart(product.id, selectedVariation, quantity, true)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`p-3 rounded-lg border transition-colors ${
                  saved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-300 text-slate-600 hover:text-rose-600'
                }`}
              >
                <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={outOfStock}
                onClick={handleBuyNow}
                className="w-full py-3 px-5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                Buy Now · {formatPKR(effectivePrice * quantity)}
              </button>

              <a
                href={whatsappOrderHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Order on WhatsApp
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
            <Truck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              Pay Cash on Delivery at your doorstep. Free shipping above {formatPKR(FREE_DELIVERY_THRESHOLD)}.
            </span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-6">
            More in {category?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
