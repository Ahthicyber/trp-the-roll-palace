'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  Phone,
  MapPin,
  RefreshCw,
  X,
  MessageSquare,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';

const STATUS_LIST: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Completed',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? data.order : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? data.order : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    window.open('/api/admin/analytics?format=csv', '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2027]">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block mb-1">
            Dispatch & Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Customer Orders Management
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            View orders, verify payments, track rider dispatch, and update statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-[#161920] hover:bg-[#20252e] text-[#8e8e8e] hover:text-white border border-[#2b303a] transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161920] hover:bg-[#20252e] text-white border border-[#2b303a] font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#ffc52f]" />
            <span>Export Orders to CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111419] border border-[#20252e] flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchOrders()}
            placeholder="Search by order # (TRP-104928), customer name, or phone..."
            className="w-full bg-[#181c22] border border-[#2a2f38] focus:border-[#ffc52f] rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#181c22] border border-[#2a2f38] text-white rounded-xl px-3 py-2 text-xs outline-none"
          >
            <option value="all">All Order Statuses</option>
            {STATUS_LIST.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="bg-[#181c22] border border-[#2a2f38] text-white rounded-xl px-3 py-2 text-xs outline-none"
          >
            <option value="all">All Payments</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Paid">Paid</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-[#111419] border border-[#20252e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a22] text-[#8e8e8e] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Delivery Area</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e232b]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8e8e8e]">
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8e8e8e]">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#161a22] transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 font-mono font-bold text-white">
                      {order.order_number}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{order.customer_name}</span>
                      <span className="text-[#888] font-mono">{order.customer_phone}</span>
                    </td>
                    <td className="p-4 text-[#aaa]">
                      {order.delivery_type === 'Delivery' ? (
                        <span>{order.delivery_zone_name || 'Home Delivery'}</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Pickup / Takeaway</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-[#ffc52f]">
                      Rs. {order.total.toLocaleString('en-PK')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.payment_status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.payment_status === 'Pending Verification'
                          ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                          : order.payment_status === 'Rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-[#2b303a] text-[#bbb]'
                      }`}>
                        {order.payment_status}
                      </span>
                      <span className="block text-[10px] text-[#777] mt-0.5">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        order.order_status === 'Delivered' || order.order_status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.order_status === 'Cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : order.order_status === 'Preparing'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-[#ffc52f]/20 text-[#ffc52f]'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="p-4 text-[#777] font-mono">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="p-1.5 rounded-lg bg-[#20252e] hover:bg-[#ffc52f] hover:text-black text-white transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#111419] border border-[#262b35] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#212630]">
              <div>
                <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block">
                  Order Details
                </span>
                <span className="text-2xl font-black text-[#ffc52f] font-mono">
                  {selectedOrder.order_number}
                </span>
                <div className="text-xs text-[#888]">
                  Created at: {new Date(selectedOrder.created_at).toLocaleString('en-PK')}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-[#888] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact & Quick WhatsApp */}
            <div className="p-4 rounded-2xl bg-[#171b22] border border-[#262b35] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{selectedOrder.customer_name}</span>
                <a
                  href={`https://wa.me/${selectedOrder.customer_phone.replace(/^0/, '92')}?text=Salam%20${encodeURIComponent(selectedOrder.customer_name)},%20regarding%20your%20TRP%20order%20${selectedOrder.order_number}...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#25D366] text-white font-bold text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Customer
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#aaa]">
                <Phone className="w-3.5 h-3.5 text-[#ffc52f]" />
                <span className="font-mono text-white">{selectedOrder.customer_phone}</span>
              </div>
              {selectedOrder.delivery_type === 'Delivery' && (
                <div className="flex items-start gap-2 text-[#aaa]">
                  <MapPin className="w-3.5 h-3.5 text-[#ffc52f] flex-shrink-0 mt-0.5" />
                  <span>{selectedOrder.delivery_address}</span>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="pt-2 text-[#ffc52f] italic border-t border-[#232832]">
                  Note from customer: &quot;{selectedOrder.notes}&quot;
                </div>
              )}
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#888]">
                Purchased Dishes
              </h4>
              <div className="divide-y divide-[#1e232b] bg-[#161a22] rounded-2xl p-4">
                {selectedOrder.items?.map(it => (
                  <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{it.product_name}</span>
                      <span className="text-[#888] ml-2">x{it.quantity} @ Rs. {it.price}</span>
                    </div>
                    <span className="font-bold text-white">
                      Rs. {it.line_total.toLocaleString('en-PK')}
                    </span>
                  </div>
                ))}

                {/* Subtotal & Delivery Fee */}
                <div className="pt-3 space-y-1 text-xs text-[#aaa]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal.toLocaleString('en-PK')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee ({selectedOrder.delivery_zone_name || 'Standard'})</span>
                    <span>Rs. {selectedOrder.delivery_fee.toLocaleString('en-PK')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#252b36]">
                    <span>Grand Total</span>
                    <span className="text-[#ffc52f]">Rs. {selectedOrder.total.toLocaleString('en-PK')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Order Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#888] uppercase block">
                  Update Order Dispatch Status
                </label>
                <select
                  disabled={actionLoading}
                  value={selectedOrder.order_status}
                  onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full bg-[#181c22] border border-[#2b3038] text-white rounded-xl p-2.5 text-xs font-bold outline-none focus:border-[#ffc52f]"
                >
                  {STATUS_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#888] uppercase block">
                  Payment Verification ({selectedOrder.payment_method})
                </label>
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading || selectedOrder.payment_status === 'Paid'}
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'Paid')}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-40"
                  >
                    Mark Paid
                  </button>
                  <button
                    disabled={actionLoading || selectedOrder.payment_status === 'Rejected'}
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'Rejected')}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone: Cancel Order */}
            {selectedOrder.order_status !== 'Cancelled' && (
              <div className="pt-4 border-t border-[#212630] flex justify-end">
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      handleUpdateStatus(selectedOrder.id, 'Cancelled');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 border border-red-900/50"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
