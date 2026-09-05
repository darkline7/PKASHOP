"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import { ArrowLeft, RefreshCw, Package, User, Landmark } from "lucide-react";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?action=order_detail&id=${resolvedParams.id}`);
      const d = await res.json();
      setOrder(d.order || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [resolvedParams.id]);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_order_status", id: resolvedParams.id, data: { status } }),
      });
      if (res.ok) {
        setOrder((prev: any) => prev ? { ...prev, status } : prev);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground text-sm">Đang tải chi tiết đơn hàng...</div>;
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="font-semibold text-foreground">Không tìm thấy đơn hàng</p>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={`Chi tiết đơn hàng #${order.orderNumber}`}
        subtitle={`Ngày tạo: ${new Date(order.createdAt).toLocaleString("vi-VN")}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={loadOrder} disabled={loading}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        }
      />
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Trạng thái:</span>
              <StatusBadge status={order.status} kind="order" />
              <StatusBadge status={order.paymentStatus} kind="payment" />
            </div>
            <p className="text-xs text-muted-foreground">PTTT: <span className="font-semibold text-foreground">{order.paymentMethod}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Trạng thái:</span>
            <select
              value={order.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={updating}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPING">SHIPPING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="border-b border-border px-5 py-3.5 bg-muted/30">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" /> Sản phẩm ({order.items?.length || 0})
                </h3>
              </div>
              <div className="divide-y divide-border/60">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                        <Image src={item.thumbnail || "/placeholder.jpg"} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.type} • SL: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground text-sm">{formatVND(item.price * item.quantity)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatVND(item.price)}/sp</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-5 py-4 bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Tạm tính</span><span>{formatVND(order.totalAmount)}</span></div>
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/60 pt-2">
                  <span>Tổng thanh toán</span><span className="text-indigo-600 text-base">{formatVND(order.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 border-b border-border/60 pb-2">
                <User className="w-4 h-4 text-indigo-600" /> Người mua
              </h3>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground text-sm">{order.buyer?.name || "Khách hàng"}</p>
                <p className="text-muted-foreground">Email: {order.buyer?.email}</p>
                <p className="text-muted-foreground">SĐT: {order.shippingPhone || order.buyer?.phone || "—"}</p>
                <p className="text-muted-foreground">Địa chỉ: {order.shippingAddress || "Phenikaa Campus"}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 border-b border-border/60 pb-2">
                <Landmark className="w-4 h-4 text-indigo-600" /> Người bán
              </h3>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground text-sm">{order.seller?.name || "Người bán"}</p>
                <p className="text-muted-foreground">Email: {order.seller?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}