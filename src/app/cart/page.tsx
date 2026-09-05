"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Components";
import { useCartStore, useAuthStore } from "@/stores";
import { formatVND } from "@/lib/utils";

export default function CartPage() {
  const { user } = useAuthStore();
  const { items, fetchCart, removeFromCart, updateQuantity } = useCartStore();

  useEffect(() => { if (user) fetchCart(); }, [user, fetchCart]);

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">🛒 Giỏ hàng ({items.length})</h1>
        {!user ? (
          <EmptyState title="Chưa đăng nhập" description="Đăng nhập để xem giỏ hàng" action={<Link href="/login"><Button variant="gradient">Đăng nhập</Button></Link>} />
        ) : items.length === 0 ? (
          <EmptyState title="Giỏ hàng trống" description="Khám phá marketplace để tìm sản phẩm phù hợp" action={<Link href="/marketplace"><Button variant="gradient">Khám phá ngay</Button></Link>} />
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <Link href={`/product/${item.product.slug}`} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                    <Image src={item.product.thumbnail || "/placeholder.jpg"} alt={item.product.title} fill className="object-cover" sizes="80px" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`} className="font-medium text-sm hover:text-primary-600 line-clamp-2">{item.product.title}</Link>
                    <p className="text-xs text-muted-foreground mt-1">{item.product.type === "DOCUMENT" ? "📄 Tài liệu" : "📦 Vật phẩm"}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary-600">{formatVND(item.product.price)}</span>
                      {item.product.type === "PHYSICAL" ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 rounded border border-border flex items-center justify-center text-sm hover:bg-muted">-</button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded border border-border flex items-center justify-center text-sm hover:bg-muted">+</button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">x1</span>}
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">Xóa</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary-600">{formatVND(total)}</span>
              </div>
              <Link href="/checkout"><Button variant="gradient" size="lg" className="w-full">Thanh toán</Button></Link>
            </Card>
          </div>
        )}
      </main><Footer />
    </div>
  );
}
