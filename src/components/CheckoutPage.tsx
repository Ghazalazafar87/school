import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Truck } from 'lucide-react';
import {
  FREE_DELIVERY_THRESHOLD,
  PAKISTANI_CITIES,
  formatPKR,
  getEffectivePrice,
} from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { CustomerInfo } from '../types/store';
import { ProductImage } from './ProductImage';

export const CheckoutPage: React.FC = () => {
  const {
    store,
    cartSummary,
    navigate,
    placeDemoOrder,
    updateCustomerInfo,
    showToast,
  } = useStore();

  const [form, setForm] = useState<CustomerInfo>(() => ({ ...store.customerInfo }));
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  if (store.cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Add stationery or school supplies to your cart before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800"
        >
          Browse Supplies
        </button>
      </div>
    );
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    if (form.fullName.trim().length < 3) {
      nextErrors.fullName = 'Please enter your full name (at least 3 characters).';
    }
    const cleanPhone = form.phone.replace(/[\s-]/g, '');
    if (!/^(\+92|0)?3\d{9}$/.test(cleanPhone)) {
      nextErrors.phone = 'Enter a valid Pakistani mobile number (e.g. 03126687237).';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address or leave blank.';
    }
    if (!form.city.trim()) {
      nextErrors.city = 'Please select your delivery city.';
    }
    if (form.area.trim().length < 2) {
      nextErrors.area = 'Please enter your area, sector, or town (e.g. DHA Phase 5, Gulshan).';
    }
    if (form.address.trim().length < 8) {
      nextErrors.address = 'Please enter your complete house/street address.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the highlighted checkout fields.', 'error');
      return;
    }
    updateCustomerInfo(form);
    const created = placeDemoOrder(form);
    if (created) {
      navigate({ page: 'order-confirmation', orderId: created.orderId });
    } else {
      showToast('Unable to place order. Please review your cart.', 'error');
    }
  };

  const updateField = <K extends keyof CustomerInfo>(key: K, value: CustomerInfo[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate({ page: 'shop' })}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Continue Shopping
      </button>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
        Cash on Delivery Checkout
      </h1>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form Left */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              1. Customer &amp; Delivery Details (Pakistan)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your details are saved locally in your browser for faster future checkouts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="e.g. Zainab Mansoor"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.fullName && (
                <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number (WhatsApp / Call) *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
              />
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                City *
              </label>
              <select
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PAKISTANI_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-xs text-rose-600 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Area / Sector / Town *
              </label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => updateField('area', e.target.value)}
                placeholder="e.g. Gulberg III / F-10 / Clifton Block 5"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.area && (
                <p className="text-xs text-rose-600 mt-1">{errors.area}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Complete Street Address *
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="House / Flat No., Street, Block, Nearest Landmark"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.address && (
              <p className="text-xs text-rose-600 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email (Optional, for order copy)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="e.g. Call before delivery / Deliver after 2 PM"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900">
              2. Payment Method
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  form.paymentMethod === 'cod'
                    ? 'border-blue-700 bg-blue-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={() => updateField('paymentMethod', 'cod')}
                  className="mt-0.5 accent-blue-700"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Cash on Delivery (COD)</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay cash to the rider when your parcel arrives.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  form.paymentMethod === 'bank_transfer'
                    ? 'border-blue-700 bg-blue-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'bank_transfer'}
                  onChange={() => updateField('paymentMethod', 'bank_transfer')}
                  className="mt-0.5 accent-blue-700"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bank / JazzCash / EasyPaisa</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm transfer details via WhatsApp after ordering.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Place Order · {formatPKR(cartSummary.total)}
          </button>
        </form>

        {/* Order Summary Right */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Order Summary ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'})
          </h2>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {store.cart.map((item) => {
              const product = store.products.find((p) => p.id === item.productId);
              if (!product) return null;
              const unitPrice = getEffectivePrice(product);
              return (
                <div
                  key={`${item.productId}-${item.selectedVariation}`}
                  className="py-3 flex items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.selectedVariation} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                    {formatPKR(unitPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium text-slate-900">
                {formatPKR(cartSummary.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Nationwide Shipping</span>
              <span className="tabular-nums font-medium text-slate-900">
                {cartSummary.shippingFee === 0 ? 'Free' : formatPKR(cartSummary.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable ({form.paymentMethod === 'cod' ? 'COD' : 'Transfer'})</span>
              <span className="tabular-nums">{formatPKR(cartSummary.total)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Truck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Estimated Delivery: 2–4 Working Days</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Free delivery applies automatically on orders of {formatPKR(FREE_DELIVERY_THRESHOLD)} or more.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
