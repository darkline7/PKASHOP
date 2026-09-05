"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, Skeleton } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";
import { formatVND } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, balance: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      fetch("/api/orders?role=buyer").then(r => r.json()).catch(() => ({ orders: [] })),
      fetch("/api/wishlist").then(r => r.json()).catch(() => ({ items: [] })),
      fetch("/api/wallet").then(r => r.json()).catch(() => ({ balance: 0 })),
    ]).then(([o, w, wa]) => {
      setStats({ orders: o.orders?.length || 0, wishlist: w.items?.length || 0, balance: wa.balance || 0, products: 0 });
      setLoading(false);
    });
  }, [user]);

  const cards = [
    { icon: "📦", label: "Đơn hàng", value: stats.orders, href: "/orders", color: "from-blue-500 to-blue-600" },
    { icon: "❤️", label: "Yêu thích", value: stats.wishlist, href: "/wishlist", color: "from-pink-500 to-pink-600" },
    { icon: "💰", label: "Ví", value: formatVND(stats.balance), href: "/wallet", color: "from-green-500 to-green-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Xin chào, {user?.name} 👋</h1>
        <p className="text-muted-foreground mb-6">Quản lý tài khoản PKASHOP của bạn</p>
        {loading ? (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {cards.map(c => (
              <Link key={c.label} href={c.href}><Card className={`p-4 bg-gradient-to-br ${c.color} text-white rounded-2xl hover:shadow-lg transition-shadow`}>
                <span className="text-2xl">{c.icon}</span><p className="text-sm opacity-80 mt-2">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p>
              </Card></Link>
            ))}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: "🛍️", label: "Đơn hàng", desc: "Xem đơn đã đặt", href: "/orders" },
            { icon: "📤", label: "Bán hàng", desc: "Đăng sản phẩm mới", href: "/sell" },
            { icon: "💬", label: "Tin nhắn", desc: "Chat với người mua/bán", href: "/messages" },
            { icon: "⚙️", label: "Cài đặt", desc: "Chỉnh sửa thông tin", href: "/settings" },
          ].map(l => (
            <Link key={l.label} href={l.href}><Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <span className="text-3xl">{l.icon}</span><div><p className="font-semibold">{l.label}</p><p className="text-sm text-muted-foreground">{l.desc}</p></div>
            </Card></Link>
          ))}
        </div>
      </main><Footer />
    </div>
  );
}
