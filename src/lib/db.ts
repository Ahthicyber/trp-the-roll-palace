import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import {
  RestaurantSettings,
  Category,
  Product,
  DeliveryZone,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  AdminUser,
  AdminAuditLog,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
} from './seed-data';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'trp.db');

// Global database connection singleton
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: Database.Database) {
  // 1. Restaurant Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurant_settings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      headline TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      address TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 1,
      announcement TEXT,
      easypaisa_title TEXT,
      easypaisa_number TEXT,
      jazzcash_title TEXT,
      jazzcash_number TEXT,
      cod_enabled INTEGER NOT NULL DEFAULT 1,
      online_payment_enabled INTEGER NOT NULL DEFAULT 1,
      currency TEXT NOT NULL DEFAULT 'PKR',
      currency_symbol TEXT NOT NULL DEFAULT 'Rs. ',
      facebook_url TEXT,
      instagram_url TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      discount_percent REAL NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // 4. Product Variants
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price_modifier REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // 5. Product Addons
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_addons (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // 6. Delivery Zones
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fee REAL NOT NULL,
      estimated_time TEXT NOT NULL,
      min_order REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );
  `);

  // 7. Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_type TEXT NOT NULL,
      delivery_address TEXT,
      delivery_zone_id TEXT,
      delivery_zone_name TEXT,
      delivery_fee REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Cash on Delivery',
      order_status TEXT NOT NULL DEFAULT 'Pending',
      notes TEXT,
      transaction_ref TEXT,
      payment_proof_url TEXT,
      tracking_token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  `);

  // 8. Order Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      variant_name TEXT,
      addons_json TEXT,
      line_total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);

  // 9. Admin Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    );
  `);

  // 10. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData(db);
}

function seedInitialData(db: Database.Database) {
  // Seed Settings
  const settingsCount = (db.prepare('SELECT count(*) as count FROM restaurant_settings').get() as { count: number }).count;
  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO restaurant_settings (
        id, name, tagline, headline, phone, whatsapp_number, address, opening_hours,
        is_open, announcement, easypaisa_title, easypaisa_number, jazzcash_title, jazzcash_number,
        cod_enabled, online_payment_enabled, currency, currency_symbol, facebook_url, instagram_url
      ) VALUES (
        @id, @name, @tagline, @headline, @phone, @whatsapp_number, @address, @opening_hours,
        @is_open, @announcement, @easypaisa_title, @easypaisa_number, @jazzcash_title, @jazzcash_number,
        @cod_enabled, @online_payment_enabled, @currency, @currency_symbol, @facebook_url, @instagram_url
      )
    `).run(INITIAL_SETTINGS);
  }

  // Seed Categories
  const catCount = (db.prepare('SELECT count(*) as count FROM categories').get() as { count: number }).count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
      VALUES (@id, @name, @slug, @description, @image_url, @display_order, @is_active)
    `);
    const insertMany = db.transaction((categories: typeof INITIAL_CATEGORIES) => {
      for (const cat of categories) {
        insertCat.run(cat);
      }
    });
    insertMany(INITIAL_CATEGORIES);
  }

  // Seed Products
  const prodCount = (db.prepare('SELECT count(*) as count FROM products').get() as { count: number }).count;
  if (prodCount === 0) {
    // Map category slugs to IDs
    const cats = db.prepare('SELECT id, slug FROM categories').all() as { id: string; slug: string }[];
    const catMap = new Map(cats.map(c => [c.slug, c.id]));

    const insertProd = db.prepare(`
      INSERT INTO products (
        id, category_id, name, slug, description, price, image_url,
        is_available, is_featured, discount_percent, display_order
      ) VALUES (
        @id, @category_id, @name, @slug, @description, @price, @image_url,
        @is_available, @is_featured, @discount_percent, @display_order
      )
    `);

    const insertProds = db.transaction((items: typeof INITIAL_PRODUCTS) => {
      let idx = 1;
      for (const item of items) {
        const catId = catMap.get(item.category_slug) || cats[0].id;
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + idx;
        insertProd.run({
          id: `prod_${idx}`,
          category_id: catId,
          name: item.name,
          slug,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          is_available: 1,
          is_featured: item.is_featured,
          discount_percent: 0,
          display_order: idx,
        });
        idx++;
      }
    });
    insertProds(INITIAL_PRODUCTS);
  }

  // Seed Delivery Zones
  const zoneCount = (db.prepare('SELECT count(*) as count FROM delivery_zones').get() as { count: number }).count;
  if (zoneCount === 0) {
    const insertZone = db.prepare(`
      INSERT INTO delivery_zones (id, name, fee, estimated_time, min_order, is_active)
      VALUES (@id, @name, @fee, @estimated_time, @min_order, @is_active)
    `);
    const insertZones = db.transaction((zones: typeof INITIAL_DELIVERY_ZONES) => {
      for (const z of zones) {
        insertZone.run(z);
      }
    });
    insertZones(INITIAL_DELIVERY_ZONES);
  }

  // Seed Initial Admin User
  const adminCount = (db.prepare('SELECT count(*) as count FROM admin_users').get() as { count: number }).count;
  if (adminCount === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@trp.com';
    const rawPass = process.env.ADMIN_PASSWORD || 'RollPalace#2026!';
    const hash = bcrypt.hashSync(rawPass, 10);
    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('usr_admin_1', email, hash, 'TRP Restaurant Manager', 'super_admin');
  }
}

// ----------------- Data Access Helpers -----------------

export function getRestaurantSettings(): RestaurantSettings {
  const db = getDb();
  const row = db.prepare('SELECT * FROM restaurant_settings LIMIT 1').get() as any;
  if (!row) return INITIAL_SETTINGS as any;
  return {
    ...row,
    is_open: Boolean(row.is_open),
    cod_enabled: Boolean(row.cod_enabled),
    online_payment_enabled: Boolean(row.online_payment_enabled),
  };
}

export function updateRestaurantSettings(data: Partial<RestaurantSettings>): void {
  const db = getDb();
  const current = getRestaurantSettings();
  const updated = { ...current, ...data, updated_at: new Date().toISOString() };

  db.prepare(`
    UPDATE restaurant_settings SET
      name = @name, tagline = @tagline, headline = @headline, phone = @phone,
      whatsapp_number = @whatsapp_number, address = @address, opening_hours = @opening_hours,
      is_open = @is_open, announcement = @announcement, easypaisa_title = @easypaisa_title,
      easypaisa_number = @easypaisa_number, jazzcash_title = @jazzcash_title,
      jazzcash_number = @jazzcash_number, cod_enabled = @cod_enabled,
      online_payment_enabled = @online_payment_enabled, currency = @currency,
      currency_symbol = @currency_symbol, facebook_url = @facebook_url,
      instagram_url = @instagram_url, updated_at = @updated_at
    WHERE id = @id
  `).run({
    ...updated,
    is_open: updated.is_open ? 1 : 0,
    cod_enabled: updated.cod_enabled ? 1 : 0,
    online_payment_enabled: updated.online_payment_enabled ? 1 : 0,
  });
}

export function getCategories(onlyActive = false): Category[] {
  const db = getDb();
  let query = 'SELECT * FROM categories';
  if (onlyActive) {
    query += ' WHERE is_active = 1';
  }
  query += ' ORDER BY display_order ASC, name ASC';
  const rows = db.prepare(query).all() as any[];
  return rows.map(r => ({ ...r, is_active: Boolean(r.is_active) }));
}

export function getCategoryById(id: string): Category | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  if (!row) return null;
  return { ...row, is_active: Boolean(row.is_active) };
}

export function createCategory(cat: { name: string; slug: string; description?: string; image_url?: string; display_order?: number; is_active?: boolean }): Category {
  const db = getDb();
  const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    cat.name,
    cat.slug,
    cat.description || '',
    cat.image_url || '',
    cat.display_order || 0,
    cat.is_active !== false ? 1 : 0,
    now,
    now
  );
  return getCategoryById(id)!;
}

export function updateCategory(id: string, cat: Partial<Category>): Category | null {
  const db = getDb();
  const existing = getCategoryById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = { ...existing, ...cat, updated_at: now };
  db.prepare(`
    UPDATE categories SET
      name = @name,
      slug = @slug,
      description = @description,
      image_url = @image_url,
      display_order = @display_order,
      is_active = @is_active,
      updated_at = @updated_at
    WHERE id = @id
  `).run({
    ...updated,
    is_active: updated.is_active ? 1 : 0,
  });
  return getCategoryById(id);
}

export function deleteCategory(id: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return res.changes > 0;
}


export function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  onlyAvailable?: boolean;
  featuredOnly?: boolean;
  search?: string;
}): Product[] {
  const db = getDb();
  let sql = `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (options?.categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(options.categoryId);
  }
  if (options?.categorySlug) {
    sql += ' AND c.slug = ?';
    params.push(options.categorySlug);
  }
  if (options?.onlyAvailable) {
    sql += ' AND p.is_available = 1 AND c.is_active = 1';
  }
  if (options?.featuredOnly) {
    sql += ' AND p.is_featured = 1';
  }
  if (options?.search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${options.search}%`, `%${options.search}%`);
  }

  sql += ' ORDER BY p.display_order ASC, p.name ASC';
  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(r => ({
    ...r,
    is_available: Boolean(r.is_available),
    is_featured: Boolean(r.is_featured),
  }));
}

export function getProductById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(id) as any;

  if (!row) return null;
  return {
    ...row,
    is_available: Boolean(row.is_available),
    is_featured: Boolean(row.is_featured),
  };
}

export function createProduct(prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
  const db = getDb();
  const id = 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO products (
      id, category_id, name, slug, description, price, image_url,
      is_available, is_featured, discount_percent, display_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    prod.category_id,
    prod.name,
    prod.slug,
    prod.description || '',
    prod.price,
    prod.image_url || '',
    prod.is_available ? 1 : 0,
    prod.is_featured ? 1 : 0,
    prod.discount_percent || 0,
    prod.display_order || 0,
    now,
    now
  );
  return getProductById(id)!;
}

export function updateProduct(id: string, prod: Partial<Product>): Product | null {
  const db = getDb();
  const existing = getProductById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...prod, updated_at: now };

  db.prepare(`
    UPDATE products SET
      category_id = @category_id,
      name = @name,
      slug = @slug,
      description = @description,
      price = @price,
      image_url = @image_url,
      is_available = @is_available,
      is_featured = @is_featured,
      discount_percent = @discount_percent,
      display_order = @display_order,
      updated_at = @updated_at
    WHERE id = @id
  `).run({
    id,
    category_id: updated.category_id || existing.category_id,
    name: updated.name || existing.name,
    slug: updated.slug || existing.slug,
    description: updated.description ?? existing.description ?? '',
    price: updated.price !== undefined && !isNaN(Number(updated.price)) ? Number(updated.price) : existing.price,
    image_url: updated.image_url ?? existing.image_url ?? '',
    is_available: updated.is_available ? 1 : 0,
    is_featured: updated.is_featured ? 1 : 0,
    discount_percent: updated.discount_percent !== undefined && !isNaN(Number(updated.discount_percent)) ? Number(updated.discount_percent) : (existing.discount_percent || 0),
    display_order: updated.display_order !== undefined && !isNaN(Number(updated.display_order)) ? Number(updated.display_order) : (existing.display_order || 0),
    updated_at: now,
  });

  return getProductById(id);
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getDeliveryZones(onlyActive = true): DeliveryZone[] {
  const db = getDb();
  let sql = 'SELECT * FROM delivery_zones';
  if (onlyActive) sql += ' WHERE is_active = 1';
  sql += ' ORDER BY fee ASC';
  const rows = db.prepare(sql).all() as any[];
  return rows.map(r => ({ ...r, is_active: Boolean(r.is_active) }));
}

export function getDeliveryZoneById(id: string): DeliveryZone | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM delivery_zones WHERE id = ?').get(id) as any;
  if (!row) return null;
  return { ...row, is_active: Boolean(row.is_active) };
}

// ----------------- Orders & Checkout -----------------

export interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  delivery_type: 'Delivery' | 'Pickup';
  delivery_address?: string;
  delivery_zone_id?: string;
  payment_method: 'Cash on Delivery' | 'Easypaisa' | 'JazzCash';
  notes?: string;
  transaction_ref?: string;
  payment_proof_url?: string;
  items: {
    product_id: string;
    quantity: number;
    variant_name?: string;
    addons?: string[];
  }[];
}

export function createOrder(input: CreateOrderInput): { order: Order; error?: string } {
  const db = getDb();

  if (!input.items || input.items.length === 0) {
    return { order: null as any, error: 'Your cart is empty.' };
  }

  // Generate unique order number: e.g. TRP-104928
  const dateStr = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  const orderNumber = `TRP-${dateStr}${randomSuffix}`;
  const orderId = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const trackingToken = 'trk_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const now = new Date().toISOString();

  // Validate and fetch each product price from authoritative database
  let subtotal = 0;
  const verifiedItems: {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    variant_name?: string;
    addons_json?: string;
    line_total: number;
  }[] = [];

  for (const item of input.items) {
    if (item.quantity <= 0) continue;
    const prod = getProductById(item.product_id);
    if (!prod) {
      return { order: null as any, error: `Product not found: ${item.product_id}` };
    }
    if (!prod.is_available) {
      return { order: null as any, error: `Product is currently unavailable: ${prod.name}` };
    }

    // Apply discount if any
    const unitPrice = prod.discount_percent > 0
      ? prod.price * (1 - prod.discount_percent / 100)
      : prod.price;

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      id: 'item_' + Math.random().toString(36).substring(2, 9),
      product_id: prod.id,
      product_name: prod.name,
      price: unitPrice,
      quantity: item.quantity,
      variant_name: item.variant_name || '',
      addons_json: item.addons ? JSON.stringify(item.addons) : '',
      line_total: lineTotal,
    });
  }

  if (verifiedItems.length === 0) {
    return { order: null as any, error: 'No valid items found in order.' };
  }

  // Calculate delivery fee
  let deliveryFee = 0;
  let zoneName = '';
  if (input.delivery_type === 'Delivery') {
    if (input.delivery_zone_id) {
      const zone = getDeliveryZoneById(input.delivery_zone_id);
      if (zone) {
        deliveryFee = zone.fee;
        zoneName = zone.name;
      }
    } else {
      // Default nearby fee
      deliveryFee = 100;
      zoneName = 'Standard Delivery';
    }
  }

  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  const paymentStatus: PaymentStatus =
    input.payment_method === 'Cash on Delivery'
      ? 'Cash on Delivery'
      : 'Pending Verification';

  const orderStatus: OrderStatus = 'Pending';

  // Atomic database transaction
  const executeOrderTransaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, delivery_type,
        delivery_address, delivery_zone_id, delivery_zone_name, delivery_fee,
        subtotal, discount, total, payment_method, payment_status, order_status,
        notes, transaction_ref, payment_proof_url, tracking_token, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `).run(
      orderId,
      orderNumber,
      input.customer_name,
      input.customer_phone,
      input.delivery_type,
      input.delivery_address || '',
      input.delivery_zone_id || '',
      zoneName,
      deliveryFee,
      subtotal,
      discount,
      total,
      input.payment_method,
      paymentStatus,
      orderStatus,
      input.notes || '',
      input.transaction_ref || '',
      input.payment_proof_url || '',
      trackingToken,
      now,
      now
    );

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, price, quantity,
        variant_name, addons_json, line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const it of verifiedItems) {
      insertItemStmt.run(
        it.id,
        orderId,
        it.product_id,
        it.product_name,
        it.price,
        it.quantity,
        it.variant_name,
        it.addons_json,
        it.line_total
      );
    }
  });

  executeOrderTransaction();

  const fullOrder = getOrderById(orderId);
  return { order: fullOrder! };
}

export function getOrderById(id: string): Order | null {
  const db = getDb();
  const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!orderRow) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) as OrderItem[];
  return {
    ...orderRow,
    items,
  };
}

export function getOrderByTracking(identifier: string): Order | null {
  const db = getDb();
  // Find by order number (e.g. TRP-123456) or tracking_token
  const orderRow = db.prepare(`
    SELECT * FROM orders
    WHERE order_number = ? OR tracking_token = ?
    LIMIT 1
  `).get(identifier.trim(), identifier.trim()) as any;

  if (!orderRow) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderRow.id) as OrderItem[];
  return {
    ...orderRow,
    items,
  };
}

export function getOrders(options?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): { orders: Order[]; totalCount: number } {
  const db = getDb();
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (options?.status) {
    where += ' AND order_status = ?';
    params.push(options.status);
  }
  if (options?.paymentStatus) {
    where += ' AND payment_status = ?';
    params.push(options.paymentStatus);
  }
  if (options?.search) {
    where += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    const s = `%${options.search}%`;
    params.push(s, s, s);
  }

  const countRow = db.prepare(`SELECT count(*) as count FROM orders ${where}`).get(...params) as { count: number };
  const totalCount = countRow.count;

  let sql = `SELECT * FROM orders ${where} ORDER BY created_at DESC`;
  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`;
    if (options.offset) sql += ` OFFSET ${options.offset}`;
  }

  const orderRows = db.prepare(sql).all(...params) as any[];

  // Fetch items for these orders
  const orders: Order[] = orderRows.map(o => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as OrderItem[];
    return { ...o, items };
  });

  return { orders, totalCount };
}

export function updateOrderStatus(orderId: string, status: OrderStatus, adminEmail = 'admin'): Order | null {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?').run(status, now, orderId);

  createAuditLog('admin', adminEmail, 'UPDATE_ORDER_STATUS', `Changed status of order ${orderId} to ${status}`);
  return getOrderById(orderId);
}

export function updatePaymentStatus(orderId: string, status: PaymentStatus, adminEmail = 'admin'): Order | null {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?').run(status, now, orderId);

  createAuditLog('admin', adminEmail, 'UPDATE_PAYMENT_STATUS', `Changed payment status of order ${orderId} to ${status}`);
  return getOrderById(orderId);
}

// ----------------- Analytics & Reporting -----------------

export function getDashboardAnalytics() {
  const db = getDb();

  // Summary counts
  const totalOrders = (db.prepare('SELECT count(*) as count FROM orders').get() as any).count;
  const pendingOrders = (db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Pending'").get() as any).count;
  const preparingOrders = (db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Preparing'").get() as any).count;
  const completedOrders = (db.prepare("SELECT count(*) as count FROM orders WHERE order_status IN ('Delivered', 'Completed')").get() as any).count;
  const cancelledOrders = (db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Cancelled'").get() as any).count;
  const pendingPayments = (db.prepare("SELECT count(*) as count FROM orders WHERE payment_status = 'Pending Verification'").get() as any).count;

  // Revenue (excluding cancelled orders)
  const totalRevenueRow = db.prepare("SELECT sum(total) as revenue FROM orders WHERE order_status != 'Cancelled'").get() as any;
  const totalRevenue = totalRevenueRow?.revenue || 0;

  // Today's orders and revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const todayOrders = (db.prepare('SELECT count(*) as count FROM orders WHERE created_at >= ?').get(todayIso) as any).count;
  const todayRevenueRow = db.prepare("SELECT sum(total) as revenue FROM orders WHERE created_at >= ? AND order_status != 'Cancelled'").get(todayIso) as any;
  const todayRevenue = todayRevenueRow?.revenue || 0;

  // Best selling products
  const topProducts = db.prepare(`
    SELECT oi.product_name, sum(oi.quantity) as total_sold, sum(oi.line_total) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.order_status != 'Cancelled'
    GROUP BY oi.product_name
    ORDER BY total_sold DESC
    LIMIT 6
  `).all();

  // Recent 6 orders
  const recentOrders = db.prepare(`
    SELECT id, order_number, customer_name, total, payment_method, payment_status, order_status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 6
  `).all();

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    preparingOrders,
    completedOrders,
    cancelledOrders,
    pendingPayments,
    totalRevenue,
    todayRevenue,
    topProducts,
    recentOrders,
  };
}

// ----------------- Admin Auth & Logs -----------------

export function getAdminByEmail(email: string): (AdminUser & { password_hash: string }) | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as any;
  if (!row) return null;
  return row;
}

export function updateAdminLastLogin(id: string): void {
  const db = getDb();
  db.prepare('UPDATE admin_users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), id);
}

export function createAuditLog(adminId: string, adminEmail: string, action: string, details: string, ip?: string): void {
  const db = getDb();
  const id = 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  db.prepare(`
    INSERT INTO audit_logs (id, admin_id, admin_email, action, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, adminId, adminEmail, action, details, ip || '');
}

export function getAuditLogs(limit = 50): AdminAuditLog[] {
  const db = getDb();
  return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit) as AdminAuditLog[];
}
