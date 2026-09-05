"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/admin?action=orders&status=${filter}` : "/api/admin?action=orders";
      const res = await fetch(url);
      const d = await res.json();
      setOrders(d.orders || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_order_status", id, data: { status } }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quản lý Đơn hàng"
        subtitle="Theo dõi giao dịch tài liệu và đơn hàng giao nhận giữa sinh viên Phenikaa"
        actions={
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
          {[
            { label: "Tất cả", value: "" },
            { label: "Đã thanh toán", value: "PAID" },
            { label: "Chờ xử lý", value: "PENDING" },
            { label: "Hoàn tất", value: "COMPLETED" },
            { label: "Đã huỷ", value: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Người mua</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <OrderRows
                  loading={loading}
                  orders={orders}
                  updating={updating}
                  handleUpdateStatus={handleUpdateStatus}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function OrderRows({ loading, orders, updating, handleUpdateStatus }: any) {
  if (loading) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
          Đang tải danh sách đơn hàng...
        </td>
      </tr>
    );
  }
  if (orders.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
          Không có đơn hàng nào
        </td>
      </tr>
    );
  }
  return orders.map((o: any) => (
    <tr key={o.id} className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">#{o.orderNumber}</td>
      <td className="px-4 py-3 text-xs">
        <p className="font-semibold text-foreground">{o.buyer?.name}</p>
        <p className="text-muted-foreground text-[11px]">{o.buyer?.email}</p>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground text-xs sm:text-sm">{formatVND(o.finalAmount)}</td>
      <td className="px-4 py-3 text-xs">
        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">{o.paymentMethod}</span>
      </td>
      <td className="px-4 py-3 text-xs">
        <StatusBadge status={o.status} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelativeTime(o.createdAt)}</td>
      <td className="px-4 py-3 text-right">
        <select
          value={o.status}
          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
          disabled={updating === o.id}
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPING">SHIPPING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </td>
    </tr>
  ));
}
