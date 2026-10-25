'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  TrendingUp,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleExportCSV = () => {
    window.open('/api/admin/analytics?format=csv', '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2027]">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block mb-1">
            Financial & Sales Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Sales & Order Analytics
            {loading && <span className="text-xs text-[#ffc52f] ml-2 font-normal animate-pulse">Updating...</span>}
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            Business reporting formatted in PKR (Rs.) with Asia/Karachi timezone.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex bg-[#121519] border border-[#262a34] rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === '7d' ? 'bg-[#ffc52f] text-black shadow' : 'text-[#888] hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === '30d' ? 'bg-[#ffc52f] text-black shadow' : 'text-[#888] hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setRange('90d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === '90d' ? 'bg-[#ffc52f] text-black shadow' : 'text-[#888] hover:text-white'
              }`}
            >
              Last 90 Days
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black font-extrabold text-xs shadow-md hover:brightness-110"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e8e]">
            Period Sales Revenue
          </span>
          <div className="text-3xl font-black text-[#ffc52f]">
            Rs. {(data?.periodRevenue || 0).toLocaleString('en-PK')}
          </div>
          <p className="text-xs text-[#8e8e8e]">
            From {data?.periodOrders || 0} valid order(s) in this timeframe
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e8e]">
            Average Order Value (AOV)
          </span>
          <div className="text-3xl font-black text-white">
            Rs. {(data?.aov || 0).toLocaleString('en-PK')}
          </div>
          <p className="text-xs text-[#8e8e8e]">
            Average spending per completed customer order
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e8e]">
            All-Time Gross Sales
          </span>
          <div className="text-3xl font-black text-emerald-400">
            Rs. {(data?.dashboard?.totalRevenue || 0).toLocaleString('en-PK')}
          </div>
          <p className="text-xs text-[#8e8e8e]">
            Across {data?.dashboard?.totalOrders || 0} total restaurant orders
          </p>
        </div>
      </div>

      {/* Daily Revenue Trends List & Chart representation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111419] border border-[#20252e] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ffc52f]" />
              <span>Daily Sales Trend</span>
            </h3>
            <p className="text-xs text-[#8e8e8e]">
              Daily order volume and total revenue in PKR.
            </p>
          </div>
        </div>

        {/* Bar representation */}
        {data?.dailyTrends?.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#888]">
            No sales recorded in the selected date range yet.
          </div>
        ) : (
          <div className="space-y-3">
            {data?.dailyTrends?.map((d: any) => {
              const maxRev = Math.max(...data.dailyTrends.map((x: any) => x.revenue), 1000);
              const pct = Math.min(100, Math.round((d.revenue / maxRev) * 100));

              return (
                <div key={d.date} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white font-mono">{d.date}</span>
                    <span className="text-[#ffc52f]">
                      Rs. {d.revenue.toLocaleString('en-PK')}{' '}
                      <span className="text-[#888] font-normal">({d.orders_count} orders)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#1b2029] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ffc52f] to-[#e5a812] transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Breakdown: Payment Methods & Order Statuses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#ffc52f]" />
            <span>Payment Method Distribution</span>
          </h3>
          <div className="divide-y divide-[#1e232b]">
            {data?.paymentBreakdown?.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#888]">No data</div>
            ) : (
              data?.paymentBreakdown?.map((p: any) => (
                <div key={p.payment_method} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{p.payment_method}</span>
                    <span className="text-[#888]">{p.count} transactions</span>
                  </div>
                  <span className="font-extrabold text-[#ffc52f]">
                    Rs. {p.total_amount.toLocaleString('en-PK')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="p-6 rounded-3xl bg-[#111419] border border-[#20252e] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Order Status Breakdown</span>
          </h3>
          <div className="divide-y divide-[#1e232b]">
            {data?.statusBreakdown?.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#888]">No data</div>
            ) : (
              data?.statusBreakdown?.map((s: any) => (
                <div key={s.order_status} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{s.order_status}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1c212b] text-[#ffc52f] font-mono font-bold">
                    {s.count} orders
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
