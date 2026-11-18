import React, { useState } from 'react';
import { Package, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { CATEGORIES, formatPKR } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { CategoryId, Product } from '../types/store';
import { ProductImage } from './ProductImage';

export const OrdersPage: React.FC = () => {
  const { store, navigate, upsertProduct, deleteProduct, resetDemoStore, showToast } = useStore();
  const [showCatalogManager, setShowCatalogManager] = useState(false);

  // Quick Add Product form state for demonstrating full LocalStorage Product CRUD
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('pens-markers');
  const [newPrice, setNewPrice] = useState('450');
  const [newStock, setNewStock] = useState('25');
  const [newDesc, setNewDesc] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(newPrice);
    const stockNum = Number(newStock);
    if (newName.trim().length < 3 || !Number.isFinite(priceNum) || priceNum <= 0) {
      showToast('Enter a valid product name and PKR price.', 'error');
      return;
    }
    const categoryMeta = CATEGORIES.find((c) => c.id === newCategory) || CATEGORIES[0];
    const id = `custom-${Date.now()}`;
    const slug = `${newName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const created: Product = {
      id,
      slug,
      sku: `QP-CST-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      category: newCategory,
      description:
        newDesc.trim() ||
        'Custom stationery item added directly to your browser LocalStorage catalogue.',
      highlights: ['Added via Store Manager', 'Cash on Delivery eligible'],
      price: Math.round(priceNum),
      rating: 4.8,
      reviewCount: 1,
      variations: [{ name: 'Standard', hex: '#1D4ED8' }],
      stock: Number.isFinite(stockNum) && stockNum >= 0 ? Math.round(stockNum) : 20,
      image: categoryMeta.image,
      isNewArrival: true,
      createdAt: new Date().toISOString(),
    };

    upsertProduct(created);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
            Account &amp; Storage
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Previous Orders ({store.orders.length})
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            All demo orders and catalogue changes are stored locally in your browser (Storage v{store.version}).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCatalogManager((v) => !v)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
          >
            {showCatalogManager ? 'Hide Catalogue Manager' : 'Manage LocalStorage Catalogue'}
          </button>
          <button
            type="button"
            onClick={resetDemoStore}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Optional LocalStorage Catalogue CRUD Manager */}
      {showCatalogManager && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              LocalStorage Product Catalogue Manager
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create, restock, or remove products stored in your browser LocalStorage ({store.products.length} active products).
            </p>
          </div>

          <form onSubmit={handleAddProduct} className="grid sm:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New product title (e.g. Oxford Geometry Kit)"
              className="sm:col-span-4 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as CategoryId)}
              className="sm:col-span-3 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="50"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="PKR"
              className="sm:col-span-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg tabular-nums"
            />
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Stock"
              className="sm:col-span-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg tabular-nums"
            />
            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description (optional)"
              className="sm:col-span-12 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
            />
          </form>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {store.products.map((product) => (
              <div
                key={product.id}
                className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {formatPKR(product.price)} · Stock: {product.stock}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => upsertProduct({ ...product, stock: product.stock + 5 })}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 hover:bg-slate-50"
                  >
                    +5 Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    aria-label={`Delete ${product.name}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Orders List */}
      {store.orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-bold text-slate-900 mb-1">
            No orders placed yet
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Complete a Cash on Delivery demo checkout to see your itemized receipt and order status saved here.
          </p>
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {store.orders.map((order) => (
            <article
              key={order.orderId}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Order ID</span>
                    <span className="font-mono font-semibold text-slate-900">{order.orderId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Placed On</span>
                    <span className="font-medium text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Destination</span>
                    <span className="font-medium text-slate-800">
                      {order.customer.area}, {order.customer.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total ({order.customer.paymentMethod === 'cod' ? 'COD' : 'Transfer'})</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatPKR(order.total)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'order-confirmation', orderId: order.orderId })}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                  >
                    View Receipt
                  </button>
                </div>
              </div>

              <div className="p-5 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div
                    key={`${order.orderId}-${item.productId}-${item.variation}`}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <ProductImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.variation} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {formatPKR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
