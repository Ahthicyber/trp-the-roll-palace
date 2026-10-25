import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDashboardAnalytics, getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const range = searchParams.get('range') || '30d';

    const db = getDb();

    // Calculate dates
    const now = new Date();
    const startDate = new Date();
    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else {
      // 30d default
      startDate.setDate(now.getDate() - 30);
    }
    const startIso = startDate.toISOString();

    // Daily revenue trends
    const dailyTrends = db.prepare(`
      SELECT date(created_at) as date, count(*) as orders_count, coalesce(sum(total), 0) as revenue
      FROM orders
      WHERE created_at >= ? AND order_status != 'Cancelled'
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `).all(startIso);

    // Payment method breakdown
    const paymentBreakdown = db.prepare(`
      SELECT payment_method, count(*) as count, coalesce(sum(total), 0) as total_amount
      FROM orders
      WHERE created_at >= ? AND order_status != 'Cancelled'
      GROUP BY payment_method
    `).all(startIso);

    // Order status breakdown
    const statusBreakdown = db.prepare(`
      SELECT order_status, count(*) as count
      FROM orders
      WHERE created_at >= ?
      GROUP BY order_status
    `).all(startIso);

    // Average order value
    const aovRow = db.prepare(`
      SELECT avg(total) as aov, sum(total) as revenue, count(*) as total_orders
      FROM orders
      WHERE created_at >= ? AND order_status != 'Cancelled'
    `).get(startIso) as any;

    if (format === 'csv') {
      // Generate CSV
      const allOrders = db.prepare(`
        SELECT order_number, customer_name, customer_phone, delivery_type,
               subtotal, delivery_fee, total, payment_method, payment_status,
               order_status, created_at
        FROM orders
        ORDER BY created_at DESC
      `).all() as any[];

      let csv = 'Order Number,Customer Name,Phone,Type,Subtotal (PKR),Delivery Fee (PKR),Total (PKR),Payment Method,Payment Status,Order Status,Date\n';
      for (const o of allOrders) {
        const clean = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
        csv += `${clean(o.order_number)},${clean(o.customer_name)},${clean(o.customer_phone)},${clean(o.delivery_type)},${o.subtotal},${o.delivery_fee},${o.total},${clean(o.payment_method)},${clean(o.payment_status)},${clean(o.order_status)},${clean(o.created_at)}\n`;
      }

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="trp-sales-report-${Date.now()}.csv"`,
        },
      });
    }

    const dashboard = getDashboardAnalytics();

    return NextResponse.json({
      dashboard,
      dailyTrends,
      paymentBreakdown,
      statusBreakdown,
      aov: Math.round(aovRow?.aov || 0),
      periodRevenue: aovRow?.revenue || 0,
      periodOrders: aovRow?.total_orders || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
