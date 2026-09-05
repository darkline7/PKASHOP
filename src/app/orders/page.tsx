"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge, Card, EmptyState } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import type { Order } from "@/types";

const STATUSES: Record<string, { label: string; variant: any }> = {
  PENDING: { label: "Chờ xử lý", variant: "warning" }, PAID: { label: "Đã thanh toán", variant: "info" },
  PROCESSING: { label: "Đang xử lý", variant: "info" }, SHIPPING: { label: "Đang giao", variant: "warning" },
  COMPLETED: { label: "Hoàn thành", variant: "success" }, CANCELLED: { label: "Đã hủy", variant: "error" },
  REFUNDED: { label: "Hoàn tiền", variant: "error" },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({ role: "buyer" });
    if (filter) params.set("status", filter);
    fetch(`/api/orders?${params}`).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
  }, [user, filter]);

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">📦 Đơn hàng của tôi</h1>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[{ v: "", l: "Tất cả" }, ...Object.entries(STATUSES).map(([v, s]) => ({ v, l: s.label }))].map(s => (
            <button key={s.v} onClick={() => setFilter(s.v)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === s.v ? "bg-primary-600 text-white" : "bg-muted hover:bg-muted/80"}`}>{s.l}</button>
          ))}
        </div>
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        : orders.length === 0 ? <EmptyState title="Chưa có đơn hàng" description="Bắt đầu mua sắm ngay" />
        : <div className="space-y-4">{orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div><span className="font-mono text-sm font-semibold">#{o.orderNumber}</span><span className="text-xs text-muted-foreground ml-2">{formatRelativeTime(o.createdAt)}</span></div>
              <Badge variant={STATUSES[o.status]?.variant || "default"}>{STATUSES[o.status]?.label || o.status}</Badge>
            </div>
            {o.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-t border-border">
                <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-muted flex-shrink-0"><Image src={item.thumbnail || "/placeholder.jpg"} alt="" fill className="object-cover" sizes="48px" /></div>
                <div className="flex-1"><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">x{item.quantity}</p></div>
                <span className="text-sm font-semibold">{formatVND(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-3 border-t border-border"><span className="text-sm text-muted-foreground">Tổng</span><span className="font-bold text-primary-600">{formatVND(o.finalAmount)}</span></div>
          </Card>
        ))}</div>}
      </main><Footer />
    </div>
  );
}
