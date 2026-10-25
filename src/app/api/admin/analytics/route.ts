import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDashboardAnalytics, getDetailedAnalytics, getAllOrdersForCsv } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const range = searchParams.get('range') || '30d';

    if (format === 'csv') {
      const csv = getAllOrdersForCsv();
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="trp-sales-report-${Date.now()}.csv"`,
        },
      });
    }

    const dashboard = getDashboardAnalytics();
    const detailed = getDetailedAnalytics(range);

    return NextResponse.json({
      dashboard,
      dailyTrends: detailed.dailyTrends,
      paymentBreakdown: detailed.paymentBreakdown,
      statusBreakdown: detailed.statusBreakdown,
      aov: detailed.aov,
      periodRevenue: detailed.periodRevenue,
      periodOrders: detailed.periodOrders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
