import React from 'react';
import { CheckCircle2, MessageCircle, Package, ShoppingBag } from 'lucide-react';
import { WHATSAPP_BASE_URL, formatPKR } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductImage } from './ProductImage';

export const OrderConfirmationPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { store, navigate } = useStore();
  const order = store.orders.find((o) => o.orderId === orderId) || store.orders[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
          Order receipt not found
        </h1>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="mt-4 px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg"
        >
          Back to Store
        </button>
      </div>
    );
  }

  const whatsappConfirmText = encodeURIComponent(
    `Assalam-o-Alaikum Qalam & Paper! I placed order ${order.orderId} for ${formatPKR(order.total)} to ${order.customer.area}, ${order.customer.city}. Name: ${order.customer.fullName}, Phone: ${order.customer.phone}.`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Order {order.orderId} {order.status} — Preparing Shipment
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              Thank you, {order.customer.fullName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Your demo order has been saved to your browser&apos;s LocalStorage history.
            </p>
          </div>
        </div>

        {/* Shipping & Payment Details */}
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Delivery Address
            </p>
            <p className="font-semibold text-slate-900">{order.customer.fullName}</p>
            <p className="text-slate-600">{order.customer.address}</p>
            <p className="text-slate-600">
              {order.customer.area}, {order.customer.city}
            </p>
            <p className="text-slate-700 font-medium tabular-nums pt-1">
              Phone: {order.customer.phone}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Payment &amp; Dispatch
            </p>
            <p className="font-semibold text-slate-900">
              {order.customer.paymentMethod === 'cod'
                ? 'Cash on Delivery (COD)'
                : 'Bank Transfer / Mobile Wallet'}
            </p>
            <p className="text-slate-600">
              Order Date:{' '}
              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                dateStyle: 'medium',
              })}
            </p>
            <p className="text-slate-600">Estimated Delivery: 2–4 Working Days</p>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 mb-3">
            Order Receipt
          </h2>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {order.items.map((item) => (
              <div
                key={`${item.productId}-${item.variation}`}
                className="p-3.5 flex items-center gap-3.5 bg-white"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <ProductImage src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.variation} · Qty {item.quantity} × {formatPKR(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">
                  {formatPKR(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 text-sm px-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPKR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="tabular-nums">
                {order.shippingFee === 0 ? 'Free' : formatPKR(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount</span>
              <span className="tabular-nums">{formatPKR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`${WHATSAPP_BASE_URL}?text=${whatsappConfirmText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Send Order on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => navigate({ page: 'orders' })}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Package className="w-4 h-4" />
            View Order History
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop More
          </button>
        </div>
      </div>
    </div>
  );
};
