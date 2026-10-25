export interface RestaurantSettings {
  id: string;
  name: string;
  tagline: string;
  headline: string;
  phone: string;
  whatsapp_number: string;
  address: string;
  opening_hours: string;
  is_open: boolean;
  announcement: string;
  easypaisa_title: string;
  easypaisa_number: string;
  jazzcash_title: string;
  jazzcash_number: string;
  cod_enabled: boolean;
  online_payment_enabled: boolean;
  currency: string;
  currency_symbol: string;
  facebook_url?: string;
  instagram_url?: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  created_at?: string;
}

export interface ProductAddon {
  id: string;
  product_id: string;
  name: string;
  price: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  discount_percent: number;
  display_order: number;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  estimated_time: string;
  is_active: boolean;
  min_order: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending Verification'
  | 'Paid'
  | 'Cash on Delivery'
  | 'Rejected';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  variant_name?: string;
  addons_json?: string;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'Delivery' | 'Pickup';
  delivery_address: string;
  delivery_zone_id?: string;
  delivery_zone_name?: string;
  delivery_fee: number;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: 'Cash on Delivery' | 'Easypaisa' | 'JazzCash';
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string;
  transaction_ref?: string;
  payment_proof_url?: string;
  tracking_token: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'staff';
  created_at: string;
  last_login?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

