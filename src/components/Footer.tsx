import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { CATEGORIES, WHATSAPP_BASE_URL, WHATSAPP_NUMBER_DISPLAY } from '../data/catalog';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigate } = useStore();

  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="font-display text-xl font-bold text-slate-900"
            >
              Qalam &amp; Paper
            </button>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Stationery, school bags, story books, bento lunch boxes, and studio art supplies delivered across Pakistan with Cash on Delivery.
            </p>
            <div className="pt-2 space-y-1.5 text-sm">
              <a
                href={`tel:${WHATSAPP_NUMBER_DISPLAY}`}
                className="flex items-center gap-2 text-slate-700 hover:text-blue-700 font-medium tabular-nums"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                {WHATSAPP_NUMBER_DISPLAY}
              </a>
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-700 hover:underline font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Order Desk (wa.me/923126687237)
              </a>
            </div>
          </div>

          {/* Categories Column 1 */}
          <div className="lg:col-span-3 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              School Departments
            </h3>
            <ul className="space-y-1.5 text-sm">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'shop', category: cat.id })}
                    className="text-slate-600 hover:text-blue-700 text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column 2 */}
          <div className="lg:col-span-3 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stationery &amp; Art
            </h3>
            <ul className="space-y-1.5 text-sm">
              {CATEGORIES.slice(5).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'shop', category: cat.id })}
                    className="text-slate-600 hover:text-blue-700 text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Links */}
          <div className="lg:col-span-2 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer Care
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="text-slate-600 hover:text-blue-700"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', filter: 'offers' })}
                  className="text-slate-600 hover:text-blue-700"
                >
                  Special Offers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'wishlist' })}
                  className="text-slate-600 hover:text-blue-700"
                >
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'orders' })}
                  className="text-slate-600 hover:text-blue-700"
                >
                  Order History
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'contact' })}
                  className="text-slate-600 hover:text-blue-700"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Qalam &amp; Paper. All prices in Pakistani Rupees (PKR).</p>
          <p>Cash on Delivery across Pakistan · Browser LocalStorage Storefront</p>
        </div>
      </div>
    </footer>
  );
};
