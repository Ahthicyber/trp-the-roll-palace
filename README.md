# TRP – The Roll Palace
> **ONE BITE – FULL FLAVOUR** | **TASTE THAT RULES**

A full-stack, production-ready restaurant ordering platform and restaurant management system developed for **TRP – The Roll Palace**.

---

## 🍽️ Overview

This platform replaces the previous static browser-only demo (`starlit-gingersnap-697252.netlify.app`) with a full-stack web application featuring persistent relational database storage, server-side pricing calculation, Pakistani mobile number validation, multi-stage order tracking, and a secure restaurant administration dashboard.

### Core Capabilities
- **Customer Storefront:**
  - Modern dark luxury aesthetic (`#05090B` background, `#FFC52F` golden yellow accents).
  - Official brand logo preserved and displayed in navigation, favicon, footer, and admin login.
  - 44+ verified authentic menu items across 10 categories imported directly from the source menu.
  - Interactive search bar, category pill tabs, and detailed food preview modals.
  - Shopping cart with real-time subtotal, delivery zone fee calculator, and pickup toggle.
  - Checkout form with Pakistani mobile validation (`03XXXXXXXXX`), delivery address, and order notes.
  - Dual checkout options: Direct Online Order or WhatsApp Order (saves to database first with unique order number `TRP-XXXXXX` before opening WhatsApp `03243235253`).
  - Public order tracking (`/track`) with visual 6-stage kitchen and delivery timeline.
- **Admin Management Portal (`/admin/*`):**
  - **Login (`/admin/login`):** Secured with bcrypt password hashing and JWT sessions.
  - **Dashboard (`/admin/dashboard`):** Real-time metrics (Today's revenue, total revenue, active orders, completed, cancelled), top performers, recent orders, and payment verification alerts.
  - **Orders Management (`/admin/orders`):** Full dispatch control, status updates (Pending -> Confirmed -> Preparing -> Ready -> Out for Delivery -> Delivered / Completed / Cancelled), manual Easypaisa/JazzCash payment approval/rejection, customer WhatsApp link, and downloadable CSV exports.
  - **Product Catalog (`/admin/products`):** Create, edit, delete dishes, dynamic price changes without redeployment, image file uploads (`/api/admin/upload`), discount percentages, and availability toggles.
  - **Category Management (`/admin/categories`):** Manage categories, reorder display sequence, upload header images, enable/disable categories.
  - **Sales Analytics (`/admin/analytics`):** Daily sales volume, average order value (AOV), payment method breakdown, time-range filters (7d, 30d, 90d), and downloadable financial CSV reports.
  - **Restaurant Settings (`/admin/settings`):** Store open/closed toggle, WhatsApp ordering helpline, opening hours (`4:00 PM – 3:00 AM`), address, announcement banner, and Easypaisa / JazzCash account credentials.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router with Turbopack) & React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 & Lucide Icons |
| **Local Database** | Persistent SQLite (`better-sqlite3`) with WAL mode & foreign key constraints |
| **Cloud Database** | Supabase PostgreSQL schema (`supabase/schema.sql`) with Row Level Security (RLS) |
| **Authentication** | `jose` (JWT HTTP-only cookies) & `bcryptjs` (password hashing) |
| **Validation** | Zod v3 |
| **Deployment** | Netlify-compatible configuration (`netlify.toml` + `@netlify/plugin-nextjs`) |

---

## 🗄️ Database Architecture

The system uses an ACID-compliant relational schema:

1. `restaurant_settings`: Stores restaurant name, phone, WhatsApp, timings, payment titles, and announcement.
2. `categories`: Menu categories with unique slugs, images, and display orders.
3. `products`: Dishes with authoritative prices, discounts, availability, and featured status.
4. `product_variants`: Optional size and style pricing modifiers.
5. `product_addons`: Optional add-on items.
6. `delivery_zones`: Configurable delivery zones with distance ranges, fees, and estimated delivery times.
7. `orders`: Authoritative purchase orders with unique order numbers, tracking tokens, subtotal, delivery fee, total, payment status, and order status.
8. `order_items`: Line items capturing unit price at purchase time to maintain historical accuracy.
9. `admin_users`: Restaurant administrators with hashed passwords.
10. `audit_logs`: Timestamped audit trail of sensitive actions (logins, price edits, status changes).

> **Local Storage Note:** LocalStorage is used only on the customer's browser to retain their pending shopping cart between page refreshes. All submitted orders, menu items, prices, payments, and accounts are strictly stored and verified in the database.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or pnpm

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the environment variables:
```env
# Initial Administrator Setup
ADMIN_EMAIL=admin@trp.com
ADMIN_PASSWORD=RollPalace#2026!
ADMIN_JWT_SECRET=trp-roll-palace-secure-jwt-super-secret-key-2026

# Restaurant Contact
NEXT_PUBLIC_RESTAURANT_WHATSAPP=923243235253
NEXT_PUBLIC_RESTAURANT_PHONE=03243235253

# Optional: Supabase PostgreSQL Cloud Sync
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Build & Run

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```
The application will be accessible at `http://localhost:3000`.

---

## 🔐 Default Administrator Credentials

On initial startup, the database seeds the first super administrator:
- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@trp.com` (configurable via `ADMIN_EMAIL`)
- **Password:** `RollPalace#2026!` (configurable via `ADMIN_PASSWORD`)

---

## 🧪 Automated Testing Suite (Phase 18)

A comprehensive 26-test integration suite is included in `tests/e2e-test.ts`.

To run the test suite:
```bash
# Terminal 1: Start production server
npm start

# Terminal 2: Run test suite
npx tsx tests/e2e-test.ts
```

### Verified Test Cases:
1. **Customer & Storefront:**
   - Homepage loads with verified branding and tagline.
   - Official logo asset loads properly.
   - Menu loads 44+ verified products from database across all 10 categories.
   - Live search filters accurately.
   - Category tabs filter accurately.
   - Delivery zones and fees load properly.
   - Authoritative restaurant settings provide verified phone (`03243235253`).
2. **Checkout & Order Transactions:**
   - Pakistani phone format validation (rejects invalid formats).
   - Empty cart submission rejection.
   - Atomic order transaction calculation with server-verified prices.
   - Public order tracking lookup via Order Number (`TRP-XXXXXX`).
3. **Cybersecurity & Access Control:**
   - Unauthorized requests to `/admin/*` redirect to `/admin/login`.
   - Unauthorized requests to `/api/admin/*` return HTTP 401.
   - Server strictly ignores client-tampered prices and enforces database prices.
   - Non-image malicious file uploads blocked.
4. **Admin Operations:**
   - Admin login rejection on incorrect password.
   - Admin login success with bcrypt password validation and secure JWT cookie issuance.
   - Session verification.
   - Order list retrieval with customer contact info.
   - Order dispatch status updates.
   - Manual payment verification/approval.
   - Product addition with file upload.
   - Dynamic product price updates.
   - Product deletion.
   - Downloadable CSV sales export.
   - Storefront settings and announcement update.

---

## 📦 Verified Menu Import Report

All 44 items from the original website (`starlit-gingersnap-697252.netlify.app`) were extracted verbatim and seeded:

| Category | Item Count | Key Highlights |
|---|---|---|
| **Burgers** | 9 | Crispy Zinger (Rs. 400), Double Decker (Rs. 700), Beef Smashed with Cheese (Rs. 480) |
| **Rolls** | 7 | TRP Crispy Roll (Rs. 300), Jumbo Jet (Rs. 800), Chicken Chatni (Rs. 220), Beef Roll (Rs. 350) |
| **BBQ** | 6 | Chicken Tikka Chest (Rs. 500), Malai Boti (Rs. 450), BBQ Platter Full (Rs. 1,950) |
| **Wraps** | 1 | Tortilla Lava Wrap (Rs. 400) |
| **Appetizers / Snacks** | 4 | Plain Fries (Rs. 150), Pizza Fries (Rs. 280), TRP Loaded Fries (Rs. 380), Masala Fries (Rs. 200) |
| **Broast** | 1 | Crispy Broast (Rs. 480) |
| **Sandwiches** | 5 | Mexican Sandwich (Rs. 480), BBQ Tikka Sandwich (Rs. 450), Double Decker Sandwich (Rs. 800) |
| **TRP Special Items** | 6 | Beef Lava Burger (Rs. 650), Crispy Lava Burger (Rs. 650), Jumbo Lava Roll (Rs. 1,000), Lava Platter (Rs. 1,850) |
| **Drinks** | 5 | Soft Drinks (Small Rs. 80, Large Rs. 100, 1 Ltr Rs. 180), Mineral Water |
| **Extra Dip** | 4 | Extra Mayo Dip, Mustard Sauce, Smokey Sauce, Garlic Sauce (Rs. 40 each) |
| **Total** | **48 Items** | 100% of source menu preserved with verified pricing |

---

## 🌐 Production Deployment

### Netlify Deployment
1. Push repository to your Git provider (GitHub / GitLab).
2. Link the repository in Netlify.
3. Netlify automatically detects `netlify.toml` and installs `@netlify/plugin-nextjs`.
4. Add environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, etc.) in the Netlify site settings.
5. Deploy!

### Supabase Cloud Database (Optional)
If running against remote Supabase PostgreSQL instead of local SQLite:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and execute `supabase/schema.sql`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your environment variables.
