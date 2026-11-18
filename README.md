# Qalam & Paper — Stationery & School Supplies E-Commerce Store

A modern, mobile-first Pakistani stationery and school supplies e-commerce storefront built with **React, TypeScript, Vite, and Tailwind CSS**, using **Browser LocalStorage** as its zero-backend persistence layer. Ready for instant deployment on **Vercel**.

---

## Features

- **10 Complete Shopping Categories (30 Sample Products):**
  1. School Bags & Backpacks
  2. Readers & Story Books
  3. Lunch Boxes
  4. Water Bottles
  5. Pencil Holders & Pouches
  6. Pens, Pencils & Markers
  7. Notebooks & Registers
  8. Painting & Drawing Supplies
  9. Art & Craft Materials
  10. School Accessories
- **Pakistani E-Commerce Experience:**
  - Prices formatted in PKR (`Rs. 360`, `Rs. 1,499`, `Rs. 3,199`)
  - Cash on Delivery (COD) checkout with City, Area/Sector, Complete Street Address, and `03XX-XXXXXXX` phone validation
  - Automatic free delivery threshold (`Rs. 2,500+`)
- **Rule-Based Interactive Shopping Assistant:**
  - Queries live LocalStorage catalogue by category, keywords, discount offers, and PKR budget (`"water bottle under 1500"`)
  - Displays clickable product cards with direct **Add to Cart** actions inside chat
- **WhatsApp Business Integration (`03126687237`):**
  - Floating WhatsApp button (`https://wa.me/923126687237`)
  - Pre-filled WhatsApp order inquiry on product detail pages and order confirmation receipts
  - Dedicated Contact Us page

---

## 1. Installation Instructions

```bash
npm install
```

## 2. Running the Development Server

Start the local development server on port `3000`:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

To verify TypeScript types and the production bundle:

```bash
npm run lint
npm run build
```

---

## 3. Project Structure

```text
├── index.html                  # Document entry, SEO meta tags, Google Fonts
├── metadata.json               # App metadata
├── package.json                # Dependencies and build scripts
├── vercel.json                 # Vercel SPA rewrite rules
└── src/
    ├── App.tsx                 # Root StoreProvider and view router
    ├── index.css               # Tailwind CSS v4 config and typography tokens
    ├── main.tsx                # React 19 DOM entry point
    ├── assets/images/          # Studio product & hero photography
    ├── types/store.ts          # TypeScript interfaces for products, cart, orders
    ├── data/catalog.ts         # 10 categories, 30 PKR products, Pakistani cities & reviews
    ├── lib/
    │   ├── storage.ts          # Centralized versioned LocalStorage CRUD engine
    │   └── chatbotEngine.ts    # Lightweight rule-based product & FAQ assistant
    ├── context/
    │   └── StoreContext.tsx    # Synchronized React Context state + hash routing
    └── components/
        ├── Navbar.tsx
        ├── HomePage.tsx
        ├── ShopCatalog.tsx
        ├── ProductCard.tsx
        ├── ProductDetailPage.tsx
        ├── ProductImage.tsx
        ├── CartDrawer.tsx
        ├── CheckoutPage.tsx
        ├── OrderConfirmationPage.tsx
        ├── WishlistPage.tsx
        ├── OrdersPage.tsx
        ├── ContactPage.tsx
        ├── ShoppingChatbot.tsx
        ├── ToastContainer.tsx
        └── Footer.tsx
```

---

## 4. How LocalStorage Persistence Works

All storefront state is persisted under a single versioned key (`qalam_paper_store`, schema version `1.0.0`) inside `src/lib/storage.ts`:

- **First Visit Initialization:** On initial load in a browser (`typeof window !== 'undefined'`), `initializeStoreData()` seeds the 30-item product catalogue and default customer preferences without overwriting existing customer data on subsequent reloads.
- **Data Stored:**
  - `products` (supports adding, restocking, and deleting items via the Orders → Manage Catalogue panel)
  - `cart` (synchronized subtotal, shipping fee, and quantities)
  - `wishlist` (saved product IDs)
  - `customerInfo` (saved Pakistani COD checkout fields)
  - `preferences` (sort selection, newsletter subscription, banner dismissal)
  - `orders` (complete itemized demo receipts with order IDs and stock deduction)
  - `shoppingHistory` (recently viewed product IDs)
- **Corruption Recovery:** Invalid or missing JSON in `localStorage` is caught safely and recovered to a clean default store state.

---

## 5. Deploying on Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in the [Vercel Dashboard](https://vercel.com/new).
3. Keep the detected **Vite** framework preset:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. No environment variables or external database credentials are required.
