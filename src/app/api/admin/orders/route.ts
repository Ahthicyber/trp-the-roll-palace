import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getOrders } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as OrderStatus) || undefined;
    const paymentStatus = (searchParams.get('paymentStatus') as PaymentStatus) || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const result = getOrders({
      status,
      paymentStatus,
      search,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

