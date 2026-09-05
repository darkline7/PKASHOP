"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/Components";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores";
import type { Wishlist } from "@/types";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/wishlist").then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">❤️ Yêu thích ({items.length})</h1>
        {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}</div>
        : items.length === 0 ? <EmptyState title="Chưa có sản phẩm yêu thích" description="Khám phá marketplace" action={<Link href="/marketplace"><Button variant="gradient">Khám phá</Button></Link>} />
        : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{items.map(w => <ProductCard key={w.id} product={w.product} />)}</div>}
      </main><Footer />
    </div>
  );
}
