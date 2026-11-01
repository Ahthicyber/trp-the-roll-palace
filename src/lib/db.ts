import { createClient } from '@supabase/supabase-js';
// bcrypt
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
// INITIAL_PRODUCTS
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

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ----------------- Restaurant Settings -----------------

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        ...INITIAL_SETTINGS,
        is_open: Boolean(INITIAL_SETTINGS.is_open),
        cod_enabled: Boolean(INITIAL_SETTINGS.cod_enabled),
        online_payment_enabled: Boolean(INITIAL_SETTINGS.online_payment_enabled),
        announcement: INITIAL_SETTINGS.announcement || '',
        easypaisa_title: INITIAL_SETTINGS.easypaisa_title || '',
        easypaisa_number: INITIAL_SETTINGS.easypaisa_number || '',
        jazzcash_title: INITIAL_SETTINGS.jazzcash_title || '',
        jazzcash_number: INITIAL_SETTINGS.jazzcash_number || '',
        facebook_url: INITIAL_SETTINGS.facebook_url || '',
        instagram_url: INITIAL_SETTINGS.instagram_url || '',
        updated_at: new Date().toISOString(),
      };
    }

    return {
      ...data,
      is_open: Boolean(data.is_open),
      cod_enabled: Boolean(data.cod_enabled),
      online_payment_enabled: Boolean(data.online_payment_enabled),
    };
  } catch (err) {
    console.error('getRestaurantSettings error:', err);
    return INITIAL_SETTINGS as any;
  }
}

export async function updateRestaurantSettings(data: Partial<RestaurantSettings>): Promise<void> {
  const current = await getRestaurantSettings();
  const updated = {
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('restaurant_settings')
    .upsert({
      id: updated.id || 'trp_settings_main',
      name: updated.name,
      tagline: updated.tagline,
      headline: updated.headline,
      phone: updated.phone,
      whatsapp_number: updated.whatsapp_number,
      address: updated.address,
      opening_hours: updated.opening_hours,
      is_open: Boolean(updated.is_open),
      announcement: updated.announcement || '',
      easypaisa_title: updated.easypaisa_title || '',
      easypaisa_number: updated.easypaisa_number || '',
      jazzcash_title: updated.jazzcash_title || '',
      jazzcash_number: updated.jazzcash_number || '',
      cod_enabled: Boolean(updated.cod_enabled),
      online_payment_enabled: Boolean(updated.online_payment_enabled),
      currency: updated.currency || 'PKR',
      currency_symbol: updated.currency_symbol || 'Rs. ',
      facebook_url: updated.facebook_url || '',
      instagram_url: updated.instagram_url || '',
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('updateRestaurantSettings error:', error);
    throw new Error(error.message);
  }
}

// ----------------- Categories -----------------

export async function getCategories(onlyActive = false): Promise<Category[]> {
  try {
    let query = supabase.from('categories').select('*').order('display_order', { ascending: true });
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error || !data) {
      console.warn('getCategories fallback:', error?.message);
      return INITIAL_CATEGORIES.map(c => ({
        ...c,
        description: c.description || '',
        image_url: c.image_url || '',
        display_order: c.display_order || 0,
        is_active: Boolean(c.is_active),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    return data.map(c => ({
      ...c,
      is_active: Boolean(c.is_active),
      display_order: Number(c.display_order) || 0,
    }));
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return {
    ...data,
    is_active: Boolean(data.is_active),
    display_order: Number(data.display_order) || 0,
  };
}

export async function createCategory(cat: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<Category> {
  const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  const newCat = {
    id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    image_url: cat.image_url || '',
    display_order: cat.display_order || 0,
    is_active: cat.is_active !== false,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('categories').insert(newCat).select().single();
  if (error) throw new Error(error.message);
  return {
    ...data,
    is_active: Boolean(data.is_active),
    display_order: Number(data.display_order) || 0,
  };
}

export async function updateCategory(id: string, cat: Partial<Category>): Promise<Category | null> {
  const updatePayload: any = { ...cat, updated_at: new Date().toISOString() };
  if (cat.is_active !== undefined) updatePayload.is_active = Boolean(cat.is_active);

  const { data, error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error || !data) return null;
  return {
    ...data,
    is_active: Boolean(data.is_active),
    display_order: Number(data.display_order) || 0,
  };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return !error;
}

// ----------------- Products -----------------

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  onlyAvailable?: boolean;
  featuredOnly?: boolean;
  search?: string;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*, categories(name, slug, is_active)')
      .order('display_order', { ascending: true });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.onlyAvailable) {
      query = query.eq('is_available', true);
    }
    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('getProducts fallback:', error?.message);
      return [];
    }

    let products: Product[] = data.map((p: any) => ({
      id: p.id,
      category_id: p.category_id,
      category_name: p.categories?.name || '',
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: Number(p.price),
      image_url: p.image_url || '',
      is_available: Boolean(p.is_available),
      is_featured: Boolean(p.is_featured),
      discount_percent: Number(p.discount_percent) || 0,
      display_order: Number(p.display_order) || 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
      _categorySlug: p.categories?.slug,
      _categoryActive: p.categories?.is_active,
    }));

    if (options?.categorySlug) {
      products = products.filter((p: any) => p._categorySlug === options.categorySlug);
    }
    if (options?.onlyAvailable) {
      products = products.filter((p: any) => p._categoryActive !== false);
    }

    return products;
  } catch (err) {
    console.error('getProducts error:', err);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    category_id: data.category_id,
    category_name: (data as any).categories?.name || '',
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    price: Number(data.price),
    image_url: data.image_url || '',
    is_available: Boolean(data.is_available),
    is_featured: Boolean(data.is_featured),
    discount_percent: Number(data.discount_percent) || 0,
    display_order: Number(data.display_order) || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createProduct(
  prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<Product> {
  const id = 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const insertPayload = {
    id,
    category_id: prod.category_id,
    name: prod.name,
    slug: prod.slug,
    description: prod.description || '',
    price: Number(prod.price),
    image_url: prod.image_url || '',
    is_available: Boolean(prod.is_available),
    is_featured: Boolean(prod.is_featured),
    discount_percent: Number(prod.discount_percent) || 0,
    display_order: Number(prod.display_order) || 0,
    created_at: now,
    updated_at: now,
  };

  const { error } = await supabase.from('products').insert(insertPayload);
  if (error) throw new Error(error.message);

  const created = await getProductById(id);
  return created!;
}

export async function updateProduct(id: string, prod: Partial<Product>): Promise<Product | null> {
  const updatePayload: any = {
    ...prod,
    updated_at: new Date().toISOString(),
  };

  if (prod.price !== undefined) updatePayload.price = Number(prod.price);
  if (prod.discount_percent !== undefined) updatePayload.discount_percent = Number(prod.discount_percent);
  if (prod.display_order !== undefined) updatePayload.display_order = Number(prod.display_order);
  if (prod.is_available !== undefined) updatePayload.is_available = Boolean(prod.is_available);
  if (prod.is_featured !== undefined) updatePayload.is_featured = Boolean(prod.is_featured);

  // Remove helper keys
  delete updatePayload.category_name;
  delete updatePayload.variants;
  delete updatePayload.addons;

  const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
  if (error) {
    console.error('updateProduct error:', error);
    return null;
  }

  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
}

// ----------------- Delivery Zones -----------------

export async function getDeliveryZones(onlyActive = true): Promise<DeliveryZone[]> {
  try {
    let query = supabase.from('delivery_zones').select('*').order('fee', { ascending: true });
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error || !data) {
      return INITIAL_DELIVERY_ZONES.map(z => ({
        ...z,
        is_active: Boolean(z.is_active),
        fee: Number(z.fee),
        min_order: Number(z.min_order) || 0,
      }));
    }
    return data.map(z => ({
      ...z,
      is_active: Boolean(z.is_active),
      fee: Number(z.fee),
      min_order: Number(z.min_order) || 0,
    }));
  } catch (err) {
    console.error('getDeliveryZones error:', err);
    return [];
  }
}

export async function getDeliveryZoneById(id: string): Promise<DeliveryZone | null> {
  const { data, error } = await supabase.from('delivery_zones').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return {
    ...data,
    is_active: Boolean(data.is_active),
    fee: Number(data.fee),
    min_order: Number(data.min_order) || 0,
  };
}

// ----------------- Orders & Checkout -----------------

export async function createOrder(input: CreateOrderInput): Promise<{ order: Order; error?: string }> {
  try {
    if (!input.items || input.items.length === 0) {
      return { order: null as any, error: 'Your cart is empty.' };
    }

    const dateStr = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const orderNumber = `TRP-${dateStr}${randomSuffix}`;
    const orderId = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const trackingToken = 'trk_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const now = new Date().toISOString();

    let subtotal = 0;
    const verifiedItems: OrderItem[] = [];

    for (const item of input.items) {
      if (item.quantity <= 0) continue;
      const prod = await getProductById(item.product_id);
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
        const zone = await getDeliveryZoneById(input.delivery_zone_id);
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

    // 1. Insert order
    const { error: orderError } = await supabase.from('orders').insert({
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
      created_at: now,
      updated_at: now,
    });

    if (orderError) {
      console.error('Order insert error:', orderError);
      return { order: null as any, error: orderError.message };
    }

    // 2. Insert items
    const { error: itemsError } = await supabase.from('order_items').insert(
      verifiedItems.map(it => ({
        id: it.id,
        order_id: it.order_id,
        product_id: it.product_id,
        product_name: it.product_name,
        price: it.price,
        quantity: it.quantity,
        variant_name: it.variant_name || '',
        addons_json: it.addons_json || '',
        line_total: it.line_total,
      }))
    );

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
    }

    const fullOrder = await getOrderById(orderId);
    return { order: fullOrder! };
  } catch (err: any) {
    console.error('createOrder exception:', err);
    return { order: null as any, error: err.message };
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    delivery_fee: Number(data.delivery_fee),
    subtotal: Number(data.subtotal),
    discount: Number(data.discount),
    total: Number(data.total),
    items: (data.order_items || []).map((it: any) => ({
      ...it,
      price: Number(it.price),
      quantity: Number(it.quantity),
      line_total: Number(it.line_total),
    })),
  };
}

export async function getOrderByTracking(identifier: string): Promise<Order | null> {
  const trimmed = identifier.trim();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .or(`order_number.ilike.${trimmed},tracking_token.eq.${trimmed}`)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    delivery_fee: Number(data.delivery_fee),
    subtotal: Number(data.subtotal),
    discount: Number(data.discount),
    total: Number(data.total),
    items: (data.order_items || []).map((it: any) => ({
      ...it,
      price: Number(it.price),
      quantity: Number(it.quantity),
      line_total: Number(it.line_total),
    })),
  };
}

export async function getOrders(options?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: Order[]; totalCount: number }> {
  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('order_status', options.status);
    }
    if (options?.paymentStatus) {
      query = query.eq('payment_status', options.paymentStatus);
    }
    if (options?.search) {
      query = query.or(
        `order_number.ilike.%${options.search}%,customer_name.ilike.%${options.search}%,customer_phone.ilike.%${options.search}%`
      );
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      console.error('getOrders error:', error);
      return { orders: [], totalCount: 0 };
    }

    const orders: Order[] = data.map((d: any) => ({
      ...d,
      delivery_fee: Number(d.delivery_fee),
      subtotal: Number(d.subtotal),
      discount: Number(d.discount),
      total: Number(d.total),
      items: (d.order_items || []).map((it: any) => ({
        ...it,
        price: Number(it.price),
        quantity: Number(it.quantity),
        line_total: Number(it.line_total),
      })),
    }));

    return { orders, totalCount: count || 0 };
  } catch (err) {
    console.error('getOrders error:', err);
    return { orders: [], totalCount: 0 };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminEmail = 'admin'
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .maybeSingle();

  if (error || !data) return null;

  await createAuditLog('admin', adminEmail, 'UPDATE_ORDER_STATUS', `Changed status of order ${orderId} to ${status}`);

  return {
    ...data,
    delivery_fee: Number(data.delivery_fee),
    subtotal: Number(data.subtotal),
    discount: Number(data.discount),
    total: Number(data.total),
    items: (data.order_items || []).map((it: any) => ({
      ...it,
      price: Number(it.price),
      quantity: Number(it.quantity),
      line_total: Number(it.line_total),
    })),
  };
}

export async function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
  adminEmail = 'admin'
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .maybeSingle();

  if (error || !data) return null;

  await createAuditLog('admin', adminEmail, 'UPDATE_PAYMENT_STATUS', `Changed payment status of order ${orderId} to ${status}`);

  return {
    ...data,
    delivery_fee: Number(data.delivery_fee),
    subtotal: Number(data.subtotal),
    discount: Number(data.discount),
    total: Number(data.total),
    items: (data.order_items || []).map((it: any) => ({
      ...it,
      price: Number(it.price),
      quantity: Number(it.quantity),
      line_total: Number(it.line_total),
    })),
  };
}

// ----------------- Analytics & Reporting -----------------

export async function getDashboardAnalytics() {
  try {
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total, payment_method, payment_status, order_status, created_at, order_items(product_name, quantity, line_total)')
      .order('created_at', { ascending: false });

    const orders = allOrders || [];

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.order_status === 'Pending').length;
    const preparingOrders = orders.filter((o: any) => o.order_status === 'Preparing').length;
    const completedOrders = orders.filter(
      (o: any) => o.order_status === 'Delivered' || o.order_status === 'Completed'
    ).length;
    const cancelledOrders = orders.filter((o: any) => o.order_status === 'Cancelled').length;
    const pendingPayments = orders.filter(
      (o: any) => o.payment_status === 'Pending Verification'
    ).length;

    const nonCancelled = orders.filter((o: any) => o.order_status !== 'Cancelled');
    const totalRevenue = nonCancelled.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrdersList = orders.filter((o: any) => new Date(o.created_at) >= todayStart);
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList
      .filter((o: any) => o.order_status !== 'Cancelled')
      .reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0);

    // Top products
    const productSalesMap = new Map<string, { total_sold: number; total_revenue: number }>();
    for (const o of nonCancelled) {
      if (o.order_items) {
        for (const it of o.order_items) {
          const cur = productSalesMap.get(it.product_name) || { total_sold: 0, total_revenue: 0 };
          cur.total_sold += Number(it.quantity) || 0;
          cur.total_revenue += Number(it.line_total) || 0;
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

    const recentOrders = orders.slice(0, 6).map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      total: Number(o.total),
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
  } catch (err) {
    console.error('getDashboardAnalytics error:', err);
    return {
      totalOrders: 0,
      todayOrders: 0,
      pendingOrders: 0,
      preparingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      topProducts: [],
      recentOrders: [],
    };
  }
}

export async function getDetailedAnalytics(range = '30d') {
  const now = new Date();
  const startDate = new Date();
  if (range === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === '90d') {
    startDate.setDate(now.getDate() - 90);
  } else {
    startDate.setDate(now.getDate() - 30);
  }

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  const filteredOrders = ordersData || [];
  const nonCancelled = filteredOrders.filter((o: any) => o.order_status !== 'Cancelled');

  const trendMap = new Map<string, { date: string; orders_count: number; revenue: number }>();
  for (const o of nonCancelled) {
    const d = o.created_at.slice(0, 10);
    const cur = trendMap.get(d) || { date: d, orders_count: 0, revenue: 0 };
    cur.orders_count += 1;
    cur.revenue += Number(o.total);
    trendMap.set(d, cur);
  }
  const dailyTrends = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const payMap = new Map<string, { payment_method: string; count: number; total_amount: number }>();
  for (const o of nonCancelled) {
    const m = o.payment_method || 'Cash on Delivery';
    const cur = payMap.get(m) || { payment_method: m, count: 0, total_amount: 0 };
    cur.count += 1;
    cur.total_amount += Number(o.total);
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

  const periodRevenue = nonCancelled.reduce((acc: number, o: any) => acc + Number(o.total), 0);
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

export async function getAllOrdersForCsv(): Promise<string> {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  let csv =
    'Order Number,Customer Name,Phone,Type,Subtotal (PKR),Delivery Fee (PKR),Total (PKR),Payment Method,Payment Status,Order Status,Date\n';
  const clean = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
  for (const o of data || []) {
    csv += `${clean(o.order_number)},${clean(o.customer_name)},${clean(o.customer_phone)},${clean(o.delivery_type)},${o.subtotal},${o.delivery_fee},${o.total},${clean(o.payment_method)},${clean(o.payment_status)},${clean(o.order_status)},${clean(o.created_at)}\n`;
  }
  return csv;
}

// ----------------- Admin Auth & Logs -----------------

export async function getAdminByEmail(email: string): Promise<(AdminUser & { password_hash: string }) | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function updateAdminLastLogin(id: string): Promise<void> {
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', id);
}

export async function createAuditLog(
  adminId: string,
  adminEmail: string,
  action: string,
  details: string,
  ip?: string
): Promise<void> {
  await supabase.from('audit_logs').insert({
    id: 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    details,
    ip_address: ip || '',
    created_at: new Date().toISOString(),
  });
}

export async function getAuditLogs(limit = 50): Promise<AdminAuditLog[]> {
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}
