import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder, getOrderByTracking } from '@/lib/db';

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_phone: z.string().regex(/^(?:\+92|0092|92|0)?3[0-9]{9}$/, 'Please enter a valid Pakistani mobile number (e.g. 03243235253)'),
  delivery_type: z.enum(['Delivery', 'Pickup']),
  delivery_address: z.string().optional(),
  delivery_zone_id: z.string().optional(),
  payment_method: z.enum(['Cash on Delivery', 'Easypaisa', 'JazzCash']),
  notes: z.string().max(500).optional(),
  transaction_ref: z.string().max(100).optional(),
  payment_proof_url: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      quantity: z.number().int().positive(),
      variant_name: z.string().optional(),
      addons: z.array(z.string()).optional(),
    })
  ).min(1, 'At least one item is required in the cart'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0]?.message || 'Invalid order data' },
        { status: 400 }
      );
    }

    if (validatedData.data.delivery_type === 'Delivery' && !validatedData.data.delivery_address?.trim()) {
      return NextResponse.json(
        { error: 'Delivery address is required for home delivery orders.' },
        { status: 400 }
      );
    }

    const result = createOrder(validatedData.data);
    if (result.error || !result.order) {
      return NextResponse.json(
        { error: result.error || 'Failed to process order' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: 'Order placed successfully and recorded in restaurant database.',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while placing the order.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking = searchParams.get('tracking') || searchParams.get('number');

    if (!tracking) {
      return NextResponse.json({ error: 'Tracking number is required.' }, { status: 400 });
    }

    const order = getOrderByTracking(tracking);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Return sanitized public tracking info
    return NextResponse.json({
      order_number: order.order_number,
      customer_name: order.customer_name,
      delivery_type: order.delivery_type,
      delivery_zone_name: order.delivery_zone_name,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
      items: order.items?.map(i => ({
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
        line_total: i.line_total,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

