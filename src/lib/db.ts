import path from 'path';
import fs from 'fs';
import os from 'os';
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

interface StoreData {
  settings: RestaurantSettings;
  categories: Category[];
  products: Product[];
  delivery_zones: DeliveryZone[];
  orders: Order[];
  admin_users: (AdminUser & { password_hash: string })[];
  audit_logs: AdminAuditLog[];
}

// ----------------- Storage File Path Resolution -----------------

function getStoragePath(): string {
  // 1. Try local data directory if writable
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return path.join(localDir, 'trp_store.json');
  } catch {
    // 2. Fall back to OS temp directory (writable in Netlify/AWS Lambda)
    try {
      const tmpDir = os.tmpdir();
      return path.join(tmpDir, 'trp_store.json');
    } catch {
      return '';
    }
  }
}

function initDefaultStore(): StoreData {
  const now = new Date().toISOString();

  // 1. Categories
  const categories: Category[] = INITIAL_CATEGORIES.map((c) => ({
    ...c,
    description: c.description || '',
    image_url: c.image_url || '',
    display_order: c.display_order || 0,
    is_active: Boolean(c.is_active),
    created_at: now,
    updated_at: now,
  }));

  const catMap = new Map(categories.map((c) => [c.slug, c.id]));
  const defaultCatId = categories[0]?.id || 'cat_1';

  // 2. Products
  let idx = 1;
  const products: Product[] = INITIAL_PRODUCTS.map((item) => {
    const catId = catMap.get(item.category_slug) || defaultCatId;
    const catObj = categories.find((c) => c.id === catId);
    const slug =
      item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' +
      idx;

    const p: Product = {
      id: `prod_${idx}`,
      category_id: catId,
      category_name: catObj?.name || '',
      name: item.name,
      slug,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      is_available: true,
      is_featured: Boolean(item.is_featured),
      discount_percent: 0,
      display_order: idx,
      created_at: now,
      updated_at: now,
    };
    idx++;
    return p;
  });

  // 3. Settings
  const settings: RestaurantSettings = {
    ...INITIAL_SETTINGS,
    is_open: true,
    cod_enabled: true,
    online_payment_enabled: true,
    announcement: INITIAL_SETTINGS.announcement || '',
    easypaisa_title: INITIAL_SETTINGS.easypaisa_title || '',
    easypaisa_number: INITIAL_SETTINGS.easypaisa_number || '',
    jazzcash_title: INITIAL_SETTINGS.jazzcash_title || '',
    jazzcash_number: INITIAL_SETTINGS.jazzcash_number || '',
    facebook_url: INITIAL_SETTINGS.facebook_url || '',
    instagram_url: INITIAL_SETTINGS.instagram_url || '',
    updated_at: now,
  };

  // 4. Delivery Zones
  const delivery_zones: DeliveryZone[] = INITIAL_DELIVERY_ZONES.map((z) => ({
    ...z,
    min_order: z.min_order || 0,
    is_active: Boolean(z.is_active),
  }));

  // 5. Admin User
  const email = process.env.ADMIN_EMAIL || 'admin@trp.com';
  const rawPass = process.env.ADMIN_PASSWORD || 'RollPalace#2026!';
  const hash = bcrypt.hashSync(rawPass, 10);
  const admin_users: (AdminUser & { password_hash: string })[] = [
    {
      id: 'usr_admin_1',
      email,
      password_hash: hash,
      name: 'TRP Restaurant Manager',
      role: 'super_admin',
      created_at: now,
      last_login: null as any,
    },
  ];

  return {
    settings,
    categories,
    products,
    delivery_zones,
    orders: [],
    admin_users,
    audit_logs: [],
  };
}

let storeInstance: StoreData | null = null;

function getStore(): StoreData {
  if (!storeInstance) {
    const filePath = getStoragePath();
    if (filePath && fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          storeInstance = parsed;
        }
      } catch (err) {
        console.warn('Could not read existing store from disk, initializing default:', err);
      }
    }
    if (!storeInstance) {
      storeInstance = initDefaultStore();
      saveStore(storeInstance);
    }
  }
  return storeInstance;
}

function saveStore(data: StoreData) {
  const filePath = getStoragePath();
  if (!filePath) return;
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write store to disk (running in memory):', err);
  }
}

// ----------------- Data Access Helpers -----------------

export function getRestaurantSettings(): RestaurantSettings {
  return getStore().settings;
}

export function updateRestaurantSettings(data: Partial<RestaurantSettings>): void {
  const store = getStore();
  store.settings = {
    ...store.settings,
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveStore(store);
}

export function getCategories(onlyActive = false): Category[] {
  const store = getStore();
  let list = store.categories;
  if (onlyActive) {
    list = list.filter((c) => c.is_active);
  }
  return [...list].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0) || a.name.localeCompare(b.name)
  );
}

export function getCategoryById(id: string): Category | null {
  const store = getStore();
  return store.categories.find((c) => c.id === id) || null;
}

export function createCategory(cat: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
}): Category {
  const store = getStore();
  const now = new Date().toISOString();
  const newCat: Category = {
    id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    image_url: cat.image_url || '',
    display_order: cat.display_order || 0,
    is_active: cat.is_active !== false,
    created_at: now,
    updated_at: now,
  };
  store.categories.push(newCat);
  saveStore(store);
  return newCat;
}

export function updateCategory(id: string, cat: Partial<Category>): Category | null {
  const store = getStore();
  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  store.categories[idx] = {
    ...store.categories[idx],
    ...cat,
    updated_at: new Date().toISOString(),
  };
  saveStore(store);
  return store.categories[idx];
}

export function deleteCategory(id: string): boolean {
  const store = getStore();
  const initialLen = store.categories.length;
  store.categories = store.categories.filter((c) => c.id !== id);
  const deleted = store.categories.length < initialLen;
  if (deleted) saveStore(store);
  return deleted;
}

export function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  onlyAvailable?: boolean;
  featuredOnly?: boolean;
  search?: string;
}): Product[] {
  const store = getStore();
  let list = store.products;

  if (options?.categoryId) {
    list = list.filter((p) => p.category_id === options.categoryId);
  }
  if (options?.categorySlug) {
    const cat = store.categories.find((c) => c.slug === options.categorySlug);
    const catId = cat ? cat.id : '__no_match__';
    list = list.filter((p) => p.category_id === catId);
  }
  if (options?.onlyAvailable) {
    const activeCatIds = new Set(store.categories.filter((c) => c.is_active).map((c) => c.id));
    list = list.filter((p) => p.is_available && activeCatIds.has(p.category_id));
  }
  if (options?.featuredOnly) {
    list = list.filter((p) => p.is_featured);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  const catMap = new Map(store.categories.map((c) => [c.id, c.name]));
  return list
    .map((p) => ({
      ...p,
      category_name: catMap.get(p.category_id) || '',
    }))
    .sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0) || a.name.localeCompare(b.name)
    );
}

export function getProductById(id: string): Product | null {
  const store = getStore();
  const prod = store.products.find((p) => p.id === id);
  if (!prod) return null;
  const cat = store.categories.find((c) => c.id === prod.category_id);
  return {
    ...prod,
    category_name: cat?.name || '',
  };
}

export function createProduct(prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
  const store = getStore();
  const now = new Date().toISOString();
  const cat = store.categories.find((c) => c.id === prod.category_id);
  const newProd: Product = {
    ...prod,
    id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    category_name: cat?.name || '',
    description: prod.description || '',
    image_url: prod.image_url || '',
    is_available: Boolean(prod.is_available),
    is_featured: Boolean(prod.is_featured),
    discount_percent: Number(prod.discount_percent) || 0,
    display_order: Number(prod.display_order) || 0,
    created_at: now,
    updated_at: now,
  };
  store.products.push(newProd);
  saveStore(store);
  return newProd;
}

export function updateProduct(id: string, prod: Partial<Product>): Product | null {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const existing = store.products[idx];
  const catId = prod.category_id || existing.category_id;
  const cat = store.categories.find((c) => c.id === catId);

  store.products[idx] = {
    ...existing,
    ...prod,
    category_id: catId,
    category_name: cat?.name || existing.category_name,
    price:
      prod.price !== undefined && !isNaN(Number(prod.price))
        ? Number(prod.price)
        : existing.price,
    discount_percent:
      prod.discount_percent !== undefined && !isNaN(Number(prod.discount_percent))
        ? Number(prod.discount_percent)
        : existing.discount_percent || 0,
    display_order:
      prod.display_order !== undefined && !isNaN(Number(prod.display_order))
        ? Number(prod.display_order)
        : existing.display_order || 0,
    is_available:
      prod.is_available !== undefined ? Boolean(prod.is_available) : existing.is_available,
    is_featured:
      prod.is_featured !== undefined ? Boolean(prod.is_featured) : existing.is_featured,
    updated_at: new Date().toISOString(),
  };

  saveStore(store);
  return store.products[idx];
}

export function deleteProduct(id: string): boolean {
  const store = getStore();
  const initialLen = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  const deleted = store.products.length < initialLen;
  if (deleted) saveStore(store);
  return deleted;
}

export function getDeliveryZones(onlyActive = true): DeliveryZone[] {
  const store = getStore();
  let list = store.delivery_zones;
  if (onlyActive) list = list.filter((z) => z.is_active);
  return [...list].sort((a, b) => a.fee - b.fee);
}

export function getDeliveryZoneById(id: string): DeliveryZone | null {
  const store = getStore();
  return store.delivery_zones.find((z) => z.id === id) || null;
}

// ----------------- Orders & Checkout -----------------

export function createOrder(input: CreateOrderInput): { order: Order; error?: string } {
  const store = getStore();

  if (!input.items || input.items.length === 0) {
    return { order: null as any, error: 'Your cart is empty.' };
  }

  const dateStr = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  const orderNumber = `TRP-${dateStr}${randomSuffix}`;
  const orderId = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const trackingToken =
    'trk_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const now = new Date().toISOString();

  let subtotal = 0;
  const verifiedItems: OrderItem[] = [];

  for (const item of input.items) {
    if (item.quantity <= 0) continue;
    const prod = getProductById(item.product_id);
    if (!prod) {
      return { order: null as any, error: `Product not found: ${item.product_id}` };
    }
    if (!prod.is_available) {
      return { order: null as any, error: `Product is currently unavailable: ${prod.name}` };
    }

    const unitPrice =
      prod.discount_percent > 0
        ? prod.price * (1 - prod.discount_percent / 100)
        : prod.price;

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      id: 'item_' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
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

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    delivery_type: input.delivery_type,
    delivery_address: input.delivery_address || '',
    delivery_zone_id: input.delivery_zone_id || '',
    delivery_zone_name: zoneName,
    delivery_fee: deliveryFee,
    subtotal,
    discount,
    total,
    payment_method: input.payment_method,
    payment_status: paymentStatus,
    order_status: 'Pending',
    notes: input.notes || '',
    transaction_ref: input.transaction_ref || '',
    payment_proof_url: input.payment_proof_url || '',
    tracking_token: trackingToken,
    items: verifiedItems,
    created_at: now,
    updated_at: now,
  };

  store.orders.unshift(newOrder);
  saveStore(store);

  return { order: newOrder };
}

export function getOrderById(id: string): Order | null {
  const store = getStore();
  return store.orders.find((o) => o.id === id) || null;
}

export function getOrderByTracking(identifier: string): Order | null {
  const store = getStore();
  const trimmed = identifier.trim();
  return (
    store.orders.find(
      (o) =>
        o.order_number.toUpperCase() === trimmed.toUpperCase() ||
        o.tracking_token === trimmed
    ) || null
  );
}

export function getOrders(options?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): { orders: Order[]; totalCount: number } {
  const store = getStore();
  let list = store.orders;

  if (options?.status) {
    list = list.filter((o) => o.order_status === options.status);
  }
  if (options?.paymentStatus) {
    list = list.filter((o) => o.payment_status === options.paymentStatus);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.order_number.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        o.customer_phone.includes(s)
    );
  }

  const totalCount = list.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || list.length;
  const paginated = list.slice(offset, offset + limit);

  return { orders: paginated, totalCount };
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminEmail = 'admin'
): Order | null {
  const store = getStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.order_status = status;
  order.updated_at = new Date().toISOString();
  createAuditLog('admin', adminEmail, 'UPDATE_ORDER_STATUS', `Changed status of order ${orderId} to ${status}`);
  saveStore(store);
  return order;
}

export function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
  adminEmail = 'admin'
): Order | null {
  const store = getStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.payment_status = status;
  order.updated_at = new Date().toISOString();
  createAuditLog('admin', adminEmail, 'UPDATE_PAYMENT_STATUS', `Changed payment status of order ${orderId} to ${status}`);
  saveStore(store);
  return order;
}

// ----------------- Analytics & Reporting -----------------

export function getDashboardAnalytics() {
  const store = getStore();
  const orders = store.orders;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'Pending').length;
  const preparingOrders = orders.filter((o) => o.order_status === 'Preparing').length;
  const completedOrders = orders.filter(
    (o) => o.order_status === 'Delivered' || o.order_status === 'Completed'
  ).length;
  const cancelledOrders = orders.filter((o) => o.order_status === 'Cancelled').length;
  const pendingPayments = orders.filter(
    (o) => o.payment_status === 'Pending Verification'
  ).length;

  const nonCancelled = orders.filter((o) => o.order_status !== 'Cancelled');
  const totalRevenue = nonCancelled.reduce((acc, o) => acc + (o.total || 0), 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrdersList = orders.filter((o) => new Date(o.created_at) >= todayStart);
  const todayOrders = todayOrdersList.length;
  const todayRevenue = todayOrdersList
    .filter((o) => o.order_status !== 'Cancelled')
    .reduce((acc, o) => acc + (o.total || 0), 0);

  // Best selling products
  const productSalesMap = new Map<string, { total_sold: number; total_revenue: number }>();
  for (const o of nonCancelled) {
    if (o.items) {
      for (const it of o.items) {
        const cur = productSalesMap.get(it.product_name) || { total_sold: 0, total_revenue: 0 };
        cur.total_sold += it.quantity;
        cur.total_revenue += it.line_total;
        productSalesMap.set(it.product_name, cur);
      }
    }
  }

  const topProducts = Array.from(productSalesMap.entries())
    .map(([product_name, stats]) => ({
      product_name,
      total_sold: stats.total_sold,
      total_revenue: stats.total_revenue,
    }))
    .sort((a, b) => b.total_sold - a.total_sold)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 6).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    customer_name: o.customer_name,
    total: o.total,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    order_status: o.order_status,
    created_at: o.created_at,
  }));

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
  const store = getStore();
  return (
    store.admin_users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null
  );
}

export function updateAdminLastLogin(id: string): void {
  const store = getStore();
  const user = store.admin_users.find((u) => u.id === id);
  if (user) {
    user.last_login = new Date().toISOString();
    saveStore(store);
  }
}

export function createAuditLog(
  adminId: string,
  adminEmail: string,
  action: string,
  details: string,
  ip?: string
): void {
  const store = getStore();
  const newLog: AdminAuditLog = {
    id: 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    details,
    ip_address: ip || '',
    created_at: new Date().toISOString(),
  };
  store.audit_logs.unshift(newLog);
  if (store.audit_logs.length > 200) {
    store.audit_logs = store.audit_logs.slice(0, 200);
  }
  saveStore(store);
}

export function getAuditLogs(limit = 50): AdminAuditLog[] {
  const store = getStore();
  return store.audit_logs.slice(0, limit);
}


export function getDetailedAnalytics(range = '30d') {
  const store = getStore();
  const now = new Date();
  const startDate = new Date();
  if (range === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === '90d') {
    startDate.setDate(now.getDate() - 90);
  } else {
    startDate.setDate(now.getDate() - 30);
  }

  const filteredOrders = store.orders.filter(
    (o) => new Date(o.created_at) >= startDate
  );

  const nonCancelled = filteredOrders.filter((o) => o.order_status !== 'Cancelled');

  const trendMap = new Map<string, { date: string; orders_count: number; revenue: number }>();
  for (const o of nonCancelled) {
    const d = o.created_at.slice(0, 10);
    const cur = trendMap.get(d) || { date: d, orders_count: 0, revenue: 0 };
    cur.orders_count += 1;
    cur.revenue += o.total;
    trendMap.set(d, cur);
  }
  const dailyTrends = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const payMap = new Map<string, { payment_method: string; count: number; total_amount: number }>();
  for (const o of nonCancelled) {
    const m = o.payment_method || 'Cash on Delivery';
    const cur = payMap.get(m) || { payment_method: m, count: 0, total_amount: 0 };
    cur.count += 1;
    cur.total_amount += o.total;
    payMap.set(m, cur);
  }
  const paymentBreakdown = Array.from(payMap.values());

  const statusMap = new Map<string, { order_status: string; count: number }>();
  for (const o of filteredOrders) {
    const s = o.order_status || 'Pending';
    const cur = statusMap.get(s) || { order_status: s, count: 0 };
    cur.count += 1;
    statusMap.set(s, cur);
  }
  const statusBreakdown = Array.from(statusMap.values());

  const periodRevenue = nonCancelled.reduce((acc, o) => acc + o.total, 0);
  const periodOrders = nonCancelled.length;
  const aov = periodOrders > 0 ? Math.round(periodRevenue / periodOrders) : 0;

  return {
    dailyTrends,
    paymentBreakdown,
    statusBreakdown,
    aov,
    periodRevenue,
    periodOrders,
  };
}

export function getAllOrdersForCsv(): string {
  const store = getStore();
  let csv =
    'Order Number,Customer Name,Phone,Type,Subtotal (PKR),Delivery Fee (PKR),Total (PKR),Payment Method,Payment Status,Order Status,Date\n';
  const clean = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
  for (const o of store.orders) {
    csv += `${clean(o.order_number)},${clean(o.customer_name)},${clean(o.customer_phone)},${clean(o.delivery_type)},${o.subtotal},${o.delivery_fee},${o.total},${clean(o.payment_method)},${clean(o.payment_status)},${clean(o.order_status)},${clean(o.created_at)}\n`;
  }
  return csv;
}
