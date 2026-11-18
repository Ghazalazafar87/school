import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Star, Truck } from 'lucide-react';
import {
  CATEGORIES,
  CUSTOMER_REVIEWS,
  FREE_DELIVERY_THRESHOLD,
  HERO_IMAGE,
  WHATSAPP_BASE_URL,
  WHATSAPP_NUMBER_DISPLAY,
  formatPKR,
} from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductImage } from './ProductImage';

type ShowcaseTab = 'best-sellers' | 'new-arrivals' | 'special-offers' | 'recommended' | 'essentials';

const TABS: { id: ShowcaseTab; label: string }[] = [
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'special-offers', label: 'Special Offers' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'essentials', label: 'School Essentials' },
];

export const HomePage: React.FC = () => {
  const { store, navigate, updatePreferences, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('best-sellers');
  const [newsletterInput, setNewsletterInput] = useState(
    store.preferences.newsletterEmail || ''
  );
  const [newsletterError, setNewsletterError] = useState('');

  const showcaseProducts = useMemo(() => {
    const all = store.products;
    let filtered = all;
    switch (activeTab) {
      case 'best-sellers':
        filtered = all.filter((p) => p.isBestSeller);
        break;
      case 'new-arrivals':
        filtered = all.filter((p) => p.isNewArrival);
        break;
      case 'special-offers':
        filtered = all.filter((p) => Boolean(p.discountPrice && p.discountPrice < p.price));
        break;
      case 'recommended':
        filtered = all.filter((p) => p.isRecommended || p.rating >= 4.8);
        break;
      case 'essentials':
        filtered = all.filter((p) => p.isFeatured);
        break;
    }
    return filtered.slice(0, 6);
  }, [store.products, activeTab]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newsletterInput.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    updatePreferences({
      newsletterEmail: trimmed,
      newsletterSubscribedAt: new Date().toISOString(),
    });
    showToast('Subscribed! Term stationery updates saved.');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Back to School &amp; Studio Supplies · Pakistan
              </p>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.12] text-balance">
                Thoughtful stationery and school essentials built for every term.
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                From ergonomic school bags and 100gsm thread-bound registers to bento lunch boxes, story books, and artist watercolors — delivered nationwide with Cash on Delivery.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  Shop All Supplies
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', filter: 'offers' })}
                  className="inline-flex items-center px-5 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  View Special Offers
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="w-full h-full min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <ProductImage
                  src={HERO_IMAGE}
                  alt="Curated collection of Qalam & Paper backpacks, notebooks, markers, watercolors, and geometry instruments"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Store Trust Strip */}
          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Cash on Delivery</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Free above {formatPKR(FREE_DELIVERY_THRESHOLD)} across Pakistan
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Transparent PKR Pricing</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  No hidden fees, instant order receipts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">10 Complete Categories</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  From primary readers to O/A-Level tools
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">WhatsApp Desk</p>
                <a
                  href={WHATSAPP_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 font-medium hover:underline mt-0.5 inline-block tabular-nums"
                >
                  {WHATSAPP_NUMBER_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category (All 10 Categories) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Explore all 10 school, office, and creative departments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
          >
            All {store.products.length} Products
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const count = store.products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate({ page: 'shop', category: cat.id })}
                className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <ProductImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {cat.shortName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {count} {count === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Curated Showcase Tabs (Best Sellers / New Arrivals / Special Offers / Recommended / School Essentials) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Curated School Collections
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Switch views to inspect best sellers, new arrivals, term discounts, and student picks.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Product collections"
            className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto max-w-full"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() =>
              navigate({
                page: 'shop',
                filter:
                  activeTab === 'special-offers'
                    ? 'offers'
                    : activeTab === 'new-arrivals'
                    ? 'new'
                    : activeTab === 'best-sellers'
                    ? 'bestsellers'
                    : undefined,
              })
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Explore Full Catalogue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10">
          <div className="max-w-2xl mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Trusted by Parents, Students &amp; Teachers
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Verified feedback from families and schools ordering across Lahore, Islamabad, and Karachi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70">
                  <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {review.role} · {review.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold text-balance">
              Get back-to-school bundle lists &amp; term restock alerts
            </h2>
            <p className="text-sm text-slate-300 mt-1.5">
              Receive seasonal PKR bundle offers and new reader arrivals. Saved locally with zero spam.
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[380px]">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={newsletterInput}
                onChange={(e) => setNewsletterInput(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address for newsletter"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            {newsletterError && (
              <p className="text-xs text-rose-400 mt-2">{newsletterError}</p>
            )}
            {store.preferences.newsletterEmail && !newsletterError && (
              <p className="text-xs text-emerald-400 mt-2">
                Subscribed with {store.preferences.newsletterEmail}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
