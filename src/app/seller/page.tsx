"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge, Card, EmptyState } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import type { Product } from "@/types";

export default function SellerPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/products?sellerId=" + user.id).then(r => r.json()),
      fetch("/api/orders?role=seller").then(r => r.json()),
    ]).then(([p, o]) => { setProducts(p.items || []); setOrders(o.orders || []); setLoading(false); });
  }, [user]);

  const statuses: Record<string, any> = { PENDING: { l: "Chờ duyệt", v: "warning" }, APPROVED: { l: "Đang bán", v: "success" }, REJECTED: { l: "Bị từ chối", v: "error" }, SOLD_OUT: { l: "Hết hàng", v: "default" } };

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">🏪 Seller Dashboard</h1><a href="/sell"><Button variant="gradient">+ Đăng bán</Button></a></div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("products")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "products" ? "bg-primary-600 text-white" : "bg-muted"}`}>Sản phẩm ({products.length})</button>
          <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "orders" ? "bg-primary-600 text-white" : "bg-muted"}`}>Đơn hàng ({orders.length})</button>
        </div>
        {tab === "products" && (loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
          : products.length === 0 ? <EmptyState title="Chưa có sản phẩm" description="Đăng bán sản phẩm đầu tiên" />
          : <div className="space-y-3">{products.map(p => (
            <Card key={p.id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image src={p.thumbnail || "/placeholder.jpg"} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{p.title}</p><p className="text-sm text-primary-600 font-bold">{formatVND(p.price)}</p></div>
              <Badge variant={statuses[p.status]?.v || "default"}>{statuses[p.status]?.l || p.status}</Badge>
              <span className="text-sm text-muted-foreground">{p.soldCount} bán</span>
            </Card>
          ))}</div>
        )}
        {tab === "orders" && (loading ? <div className="h-40 rounded-xl bg-muted animate-pulse" />
          : orders.length === 0 ? <EmptyState title="Chưa có đơn bán" description="Đợi người mua đặt hàng" />
          : <div className="space-y-3">{orders.map(o => (
            <Card key={o.id} className="p-4">
              <div className="flex justify-between mb-2"><span className="font-mono text-sm">#{o.orderNumber}</span><Badge>{o.status}</Badge></div>
              <p className="text-sm text-muted-foreground">{formatRelativeTime(o.createdAt)}</p>
              <p className="font-bold mt-1">{formatVND(o.finalAmount)}</p>
            </Card>
          ))}</div>
        )}
      </main><Footer />
    </div>
  );
}
