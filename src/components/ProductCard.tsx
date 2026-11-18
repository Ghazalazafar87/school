import React from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { CATEGORIES, formatPKR, getDiscountPercent, getEffectivePrice } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { Product } from '../types/store';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, toggleWishlist, isInWishlist } = useStore();
  const saved = isInWishlist(product.id);
  const categoryName = CATEGORIES.find((c) => c.id === product.category)?.shortName || 'Supplies';
  const effectivePrice = getEffectivePrice(product);
  const discountPct = getDiscountPercent(product);
  const outOfStock = product.stock <= 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product.id, product.variations[0]?.name, 1, false);
    navigate({ page: 'checkout' });
  };

  return (
    <article
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Product Photo Stage */}
      <div
        onClick={() => navigate({ page: 'product', slug: product.slug })}
        className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
            saved
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-white/95 border-slate-200 text-slate-600 hover:text-rose-600'
          }`}
        >
          <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Product Metadata & Actions */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
            <span className="truncate">{categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className={outOfStock ? 'text-rose-600 font-medium whitespace-nowrap' : 'text-emerald-700 font-medium whitespace-nowrap'}>
              {outOfStock ? 'Out of Stock' : discountPct > 0 ? `Save ${discountPct}%` : 'In Stock'}
            </span>
          </div>

          <h3
            onClick={() => navigate({ page: 'product', slug: product.slug })}
            className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-blue-700 transition-colors"
          >
            {product.name}
          </h3>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-600 tabular-nums">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-medium text-slate-800">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>

            {product.variations.length > 0 && (
              <div className="flex items-center gap-1" title={`${product.variations.length} options`}>
                {product.variations.slice(0, 3).map((v) => (
                  <span
                    key={v.name}
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: v.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3 tabular-nums">
            <span className="text-base font-bold text-slate-900">
              {formatPKR(effectivePrice)}
            </span>
            {discountPct > 0 && (
              <span className="text-xs text-slate-400 line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product.id, product.variations[0]?.name, 1, true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleBuyNow}
              className="flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
