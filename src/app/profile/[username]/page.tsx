"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Avatar, Badge, StarRating, Card, Skeleton } from "@/components/ui/Components";
import { formatRelativeTime } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/users/${username}`).then(r => r.json()).then(d => {
      setProfile(d.user); setProducts(d.products || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><div className="max-w-4xl mx-auto px-4 py-8"><Skeleton className="h-48 rounded-2xl" /></div><Footer /></div>;
  if (!profile) return <div className="min-h-screen flex flex-col"><Header /><div className="py-20 text-center"><h1 className="text-2xl font-bold">Không tìm thấy người dùng</h1></div><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Card className="p-6 flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Avatar src={profile.avatar} name={profile.name} size="xl" />
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start"><h1 className="text-2xl font-bold">{profile.name}</h1>{profile.isVerified && <Badge variant="success">✓ Verified</Badge>}</div>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
            {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
            <div className="flex gap-4 mt-3 text-sm text-muted-foreground justify-center sm:justify-start">
              {profile.university && <span>🏫 {profile.university}</span>}
              {profile.city && <span>📍 {profile.city}</span>}
              <span>📅 {formatRelativeTime(profile.createdAt)}</span>
            </div>
            <div className="flex gap-4 mt-2 text-sm"><StarRating rating={profile.rating || 5} /><span>{profile.totalSales || 0} đã bán</span></div>
          </div>
        </Card>
        <h2 className="text-xl font-bold mb-4">Sản phẩm đang bán ({products.length})</h2>
        {products.length === 0 ? <p className="text-muted-foreground py-8 text-center">Chưa có sản phẩm</p>
        : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
      </main><Footer />
    </div>
  );
}
