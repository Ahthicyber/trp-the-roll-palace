import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UtensilsCrossed,
  Flame,
} from 'lucide-react';
import { getDashboardAnalytics, getProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const analytics = getDashboardAnalytics();
  const allProducts = getProducts({ onlyAvailable: false });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2027]">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block mb-1">
            Overview & Live Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Restaurant Dashboard
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            Real-time analytics and kitchen order dispatch control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161920] hover:bg-[#20242e] text-white border border-[#2b303a] font-bold text-xs transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Add / Edit Food</span>
          </Link>
        </div>
      </div>

      {/* Payment Verification Banner Alert if any pending payments */}
      {analytics.pendingPayments > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">
                {analytics.pendingPayments} Payment Verification Action(s) Required
              </p>
              <p className="text-xs text-amber-300/80">
                Customers submitted manual Easypaisa / JazzCash payments awaiting staff verification.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?paymentStatus=Pending Verification"
            className="px-3.5 py-1.5 rounded-lg bg-[#ffc52f] text-black font-extrabold text-xs flex-shrink-0 hover:bg-[#e5a812]"
          >
            Review Payments
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Revenue */}
        <div className="p-5 rounded-2xl bg-[#111419] border border-[#20252e] space-y-3">
          <div className="flex items-center justify-between text-[#8e8e8e]">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white block">
              Rs. {analytics.todayRevenue.toLocaleString('en-PK')}
            </span>
            <span className="text-[11px] text-[#8e8e8e]">
              From {analytics.todayOrders} order(s) today
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#111419] border border-[#20252e] space-y-3">
          <div className="flex items-center justify-between text-[#8e8e8e]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales (PKR)</span>
            <div className="w-8 h-8 rounded-lg bg-[#ffc52f]/10 text-[#ffc52f] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#ffc52f] block">
              Rs. {analytics.totalRevenue.toLocaleString('en-PK')}
            </span>
            <span className="text-[11px] text-[#8e8e8e]">
              Excluding cancelled orders
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-[#111419] border border-[#20252e] space-y-3">
          <div className="flex items-center justify-between text-[#8e8e8e]">
            <span className="text-xs font-bold uppercase tracking-wider">Active / Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {analytics.pendingOrders + analytics.preparingOrders}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">
              {analytics.pendingOrders} pending • {analytics.preparingOrders} preparing
            </span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="p-5 rounded-2xl bg-[#111419] border border-[#20252e] space-y-3">
          <div className="flex items-center justify-between text-[#8e8e8e]">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {analytics.completedOrders}
            </span>
            <span className="text-[11px] text-[#8e8e8e]">
              {analytics.cancelledOrders} cancelled • {allProducts.length} menu items
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Recent Customer Orders</h2>
              <p className="text-xs text-[#8e8e8e]">Latest transactions recorded in database</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#ffc52f] hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>View All ({analytics.totalOrders})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171b22] text-[#8e8e8e] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e232b]">
                {analytics.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#666]">
                      No orders placed yet. Orders will show here in real time.
                    </td>
                  </tr>
                ) : (
                  analytics.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#151921] transition-colors">
                      <td className="p-3 font-mono font-bold text-white">
                        {ord.order_number}
                      </td>
                      <td className="p-3 font-medium text-[#ccc]">
                        {ord.customer_name}
                      </td>
                      <td className="p-3 font-bold text-[#ffc52f]">
                        Rs. {ord.total.toLocaleString('en-PK')}
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] text-[#aaa]">
                          {ord.payment_method}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.order_status === 'Delivered' || ord.order_status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ord.order_status === 'Cancelled'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-[#ffc52f]/20 text-[#ffc52f]'
                        }`}>
                          {ord.order_status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href="/admin/orders"
                          className="px-2.5 py-1 rounded bg-[#20252e] hover:bg-[#ffc52f] hover:text-black text-white font-bold text-[11px] transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Best Selling Products & Quick Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#ffc52f]" />
              <h3 className="text-base font-bold text-white">Top Menu Performers</h3>
            </div>
            <p className="text-xs text-[#8e8e8e]">
              Top sold dishes based on authoritative purchase history.
            </p>

            <div className="space-y-3 pt-2">
              {analytics.topProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#666]">
                  Sales metrics will populate after customer orders are completed.
                </div>
              ) : (
                analytics.topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#161a22] text-xs">
                    <div>
                      <span className="font-bold text-white block">{p.product_name}</span>
                      <span className="text-[#888]">{p.total_sold} units sold</span>
                    </div>
                    <span className="font-bold text-[#ffc52f]">
                      Rs. {p.total_revenue.toLocaleString('en-PK')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Menu Summary */}
          <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-3">
            <h3 className="text-sm font-bold text-white">Restaurant Quick Stats</h3>
            <div className="divide-y divide-[#1e232b] text-xs text-[#aaa]">
              <div className="py-2 flex justify-between">
                <span>Active Menu Items</span>
                <span className="text-white font-bold">{allProducts.filter(p => p.is_available).length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>Out-of-Stock Items</span>
                <span className="text-white font-bold">{allProducts.filter(p => !p.is_available).length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>WhatsApp Helpline</span>
                <span className="text-[#ffc52f] font-mono">03243235253</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>System Timezone</span>
                <span className="text-white font-mono">Asia/Karachi (PKT)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
