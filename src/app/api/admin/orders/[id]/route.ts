import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getOrderById, updateOrderStatus, updatePaymentStatus } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    let updatedOrder = null;

    if (body.order_status) {
      updatedOrder = updateOrderStatus(id, body.order_status as OrderStatus, session.email);
    }

    if (body.payment_status) {
      updatedOrder = updatePaymentStatus(id, body.payment_status as PaymentStatus, session.email);
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found or not modified' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

