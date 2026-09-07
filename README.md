# Fayzee — Production Multi-Vendor E-Commerce Platform
> **Shop Smart. Shop Easy.**

Fayzee is a full-stack, production-ready multi-vendor e-commerce marketplace built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and **Fayzee AI** — an intelligent shopping assistant connected to live inventory and database tools.

---

## 🌟 Key Architecture & Highlights

1. **Original Brand & Design System**:
   - Deep Midnight Navy (`#0B132B`), Electric Cyan (`#00B4D8`), and Sunset Amber/Coral (`#FF6B35`).
   - Clean, modern layout, custom typography, micro-interactions, responsive mobile navigation, and trust badges.
2. **Multi-Vendor Seller Marketplace**:
   - Merchant registration (`/seller/register`) with tax ID (NTN), CNIC, business address, and store profile.
   - Seller approval workflow (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`).
   - Dedicated Seller Portal (`/seller/dashboard`) with revenue analytics, stock control, product listing with image variants, and order fulfillment.
   - Strict seller ownership isolation: a seller can never see or modify other sellers' products or orders.
   - Public Storefront (`/sellers/[slug]`) with ratings, seller verification badge, and listings.
3. **Customer Experience & Storefront**:
   - Dynamic Homepage with hero showcase, hierarchical categories, real-time Flash Sale countdown, trending products, and certified top sellers.
   - Fast multi-faceted product catalog (`/products`) with brand, category, price range, and rating filters.
   - Interactive product detail (`/products/[slug]`) with image gallery, variant selection (Color, Storage, Size), dynamic price recalculation, verified reviews, and related products.
   - Persistent Shopping Cart (`/cart`) with stock validation, quantity adjust, and subtotal calculation.
   - Secure Checkout (`/checkout`) with delivery address selection, coupon discount engine, and Cash on Delivery / Online Payment.
   - Order Tracking (`/orders/[id]`) with a 5-step visual delivery lifecycle timeline and itemized receipt.
   - Customer Wishlist (`/wishlist`) and Account Dashboard (`/account`).
4. **Fayzee AI Shopping Assistant (`✨ Fayzee AI`)**:
   - Floating interactive assistant on every page.
   - Secure server-side tools: `searchProducts`, `toolGetProduct`, `toolCompareProducts`, `toolGetUserOrders`, `toolAddToCart`.
   - Never hallucinates prices or stock; queries authoritative database records.
   - Direct interactive product cards, comparison views, and 1-click "Add to Cart" directly within the chat drawer.
5. **Admin Operations Panel (`/admin/dashboard`)**:
   - High-level marketplace financial metrics (Gross Sales, Orders, Customers, Active Merchants, Low Stock items).
   - Seller Application approvals, rejections, and suspensions with automatic audit logging and notifications.
   - Security Audit Trail (`AuditLog`) tracking administrative actions.
6. **Payment Abstraction**:
   - Pluggable `PaymentProvider` interface supporting `CashOnDeliveryProvider` and `OnlinePaymentProvider` (simulated 3D-secure gateway ready for Stripe / PayFast / JazzCash / EasyPaisa production keys).
7. **Transactional Integrity**:
   - Server-side authoritative price recalculation (client prices are never trusted).
   - Atomic database transactions (`prisma.$transaction`) decrementing inventory, validating stock, creating payments, applying coupons, and generating order items.

---

## 🔐 Authentication & Roles

Fayzee incorporates role-based access control (RBAC) powered by bcrypt password hashing and secure HTTP-only session cookies:

| Role | Access Scope | Capabilities |
|---|---|---|
| **Super Admin** | `/admin/dashboard` | Platform metrics, seller verification & approvals, audit log tracking |
| **Verified Seller** | `/seller/dashboard` | Product catalogue management, inventory tracking, order dispatch & status lifecycle |
| **Customer** | Storefront, Cart, Checkout, `/orders` | Browsing, search & filter, cart management, checkout with COD/Card, order tracking |

Users can register directly on `/register` as Customers or apply as Verified Sellers on `/seller/register`. Authentication is handled securely through the `/login` portal.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The application includes a pre-configured `.env` file set up for instant local SQLite persistence (`dev.db`).
```bash
cp .env.example .env
```

### 3. Generate Database Client & Seed Data
```bash
# Push schema to database
npx prisma db push

# Seed initial categories, brands, sellers, products, flash sales, and users
node prisma/seed.ts
```

### 4. Run Automated Test Suite
```bash
npm test
```
All 23 unit & integration assertions test database relations, password hashing, stock rules, order creation transactions, seller isolation, and coupon logic.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐘 Production PostgreSQL Deployment

To deploy Fayzee with a cloud PostgreSQL database (e.g., Supabase, Neon, AWS RDS, Railway):

1. Set your `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@db-host:5432/fayzee?schema=public"
   ```
2. Replace `prisma/schema.prisma` with `prisma/schema.postgresql.prisma`:
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   npx prisma generate
   npx prisma db push
   node prisma/seed.ts
   ```
3. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Architecture

```
├── app/
│   ├── (marketplace)/           # Customer storefront
│   │   ├── page.tsx             # Homepage with dynamic DB feeds & hero
│   │   ├── products/            # Catalog & /products/[slug] detail
│   │   ├── category/[slug]/     # Hierarchical category browsing
│   │   ├── search/              # Real-time multi-filter search & sort
│   │   ├── cart/                # Persistent cart & stock validator
│   │   ├── checkout/            # Multi-step checkout & payment
│   │   ├── orders/ & [id]/      # Customer order tracking & timeline
│   │   ├── wishlist/            # Customer wishlist
│   │   ├── account/             # Profile, addresses, security, reviews
│   │   ├── sellers/[slug]/      # Public seller store page
│   │   ├── flash-sale/          # Active flash sales with countdowns
│   │   ├── help/                # Customer support & FAQ
│   │   ├── login/ & register/   # Authentication screens
│   ├── seller/                  # Seller Dashboard & Portal
│   │   ├── dashboard/           # Revenue, sales, low-stock, best-sellers
│   │   └── register/            # Seller application form
│   ├── admin/                   # Admin & Super Admin Management
│   │   └── dashboard/           # High-level analytics & metrics
│   ├── api/                     # REST API Endpoints
│   │   ├── auth/                # register, login, me, logout
│   │   ├── products/            # product listing, details, search
│   │   ├── cart/                # cart fetch, add, update, remove
│   │   ├── checkout/            # order calculation & placement
│   │   ├── orders/              # customer & seller order actions
│   │   ├── seller/              # seller store & product management
│   │   ├── admin/               # admin management & approvals
│   │   └── ai/chat/             # Fayzee AI streaming with tool execution
├── components/
│   ├── ai/                      # FayzeeAIAssistant floating drawer & cards
│   ├── layout/                  # Navbar, Footer
│   ├── marketplace/             # ProductCard, ProductDetailView, FlashCountdown
│   └── providers/               # AuthProvider, CartProvider
├── lib/
│   ├── db.ts                    # Prisma Client singleton
│   ├── auth.ts                  # JWT, bcrypt hashing, cookie session, RBAC
│   ├── utils.ts                 # Formatting, currency, slugify
│   └── payment/                 # Payment abstraction layer (COD, Online)
├── services/
│   ├── productService.ts        # Filtering, queries, details
│   ├── orderService.ts          # Transactional checkout, stock decrements
│   ├── cartService.ts           # Persistent cart actions
│   └── aiService.ts             # Fayzee AI tool calling & Gemini reasoning
├── prisma/
│   ├── schema.prisma            # Relational database schema
│   ├── schema.postgresql.prisma # PostgreSQL production schema
│   └── seed.ts                  # Database seed script
└── scripts/
    └── test-e2e.ts              # Automated test suite
```
