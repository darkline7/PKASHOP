import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Badge, Avatar, StarRating, Card } from "@/components/ui/Components";
import { formatVND, formatRelativeTime, formatFileSize } from "@/lib/utils";
import type { Product, Review } from "@/types";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      seller: { select: { id: true, name: true, username: true, avatar: true, rating: true, isVerified: true, totalSales: true } },
      category: true,
      reviews: { take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });
  if (!product || product.status !== "ACTIVE") return null;
  const related = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4, orderBy: { soldCount: "desc" },
    include: { seller: { select: { id: true, name: true, avatar: true } }, category: { select: { id: true, name: true, slug: true } } },
  });
  return { product: JSON.parse(JSON.stringify(product)) as Product & { reviews: Review[] }, related: JSON.parse(JSON.stringify(related)) as Product[] };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();
  const { product, related } = data;
  const imgs = [product.thumbnail, ...JSON.parse(product.images || "[]")].filter(Boolean) as string[];
  const cond: Record<string, string> = { NEW: "Mới", LIKE_NEW: "Như mới", GOOD: "Tốt", FAIR: "Cũ" };
  const reviews: Review[] = (product as any).reviews || [];
  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <GallerySection imgs={imgs} title={product.title} />
          <InfoSection product={product} cond={cond} />
        </div>
        {reviews.length > 0 && <ReviewsSection reviews={reviews} />}
        {related.length > 0 && <div className="mt-12"><h2 className="text-xl font-bold mb-4">Sản phẩm liên quan</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{related.map(p => <ProductCard key={p.id} product={p} />)}</div></div>}
      </main><Footer />
    </div>
  );
}

function GallerySection({ imgs, title }: { imgs: string[]; title: string }) {
  return (
    <div>
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3 relative">
        <Image src={imgs[0] || "/placeholder.jpg"} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imgs.map((img, i) => (
            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative border-2 border-transparent hover:border-primary-500 transition-colors cursor-pointer">
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="64px" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoSection({ product, cond }: { product: Product & { reviews: Review[] }; cond: Record<string, string> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap"><Badge variant="outline">{product.type === "DOCUMENT" ? "📄 Tài liệu" : "📦 Vật phẩm"}</Badge><Badge variant="outline">{cond[product.condition] || product.condition}</Badge></div>
      <h1 className="text-2xl sm:text-3xl font-bold">{product.title}</h1>
      <div className="flex items-center gap-3 flex-wrap"><StarRating rating={product.rating} size="md" /><span className="text-sm text-muted-foreground">({product.totalReviews} đánh giá) · {product.soldCount} đã bán · {product.views} xem</span></div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-primary-600">{formatVND(product.price)}</span>
        {product.originalPrice && product.originalPrice > product.price && <span className="text-lg text-muted-foreground line-through">{formatVND(product.originalPrice)}</span>}
      </div>
      {product.type === "DOCUMENT" && <Card className="p-4"><div className="grid grid-cols-2 gap-3 text-sm">
        {product.fileFormat && <div><span className="text-muted-foreground">Định dạng:</span> <strong>{product.fileFormat}</strong></div>}
        {product.fileSize && <div><span className="text-muted-foreground">Dung lượng:</span> <strong>{formatFileSize(product.fileSize)}</strong></div>}
        {product.pageCount && <div><span className="text-muted-foreground">Số trang:</span> <strong>{product.pageCount}</strong></div>}
        {product.courseCode && <div><span className="text-muted-foreground">Mã môn:</span> <strong>{product.courseCode}</strong></div>}
      </div></Card>}
      <AddToCartButton productId={product.id} />
      <Card className="p-4"><div className="flex items-center gap-3">
        <Avatar src={product.seller?.avatar} name={product.seller?.name || ""} size="lg" />
        <div className="flex-1"><Link href={`/profile/${product.seller?.username}`} className="font-semibold hover:text-primary-600">{product.seller?.name}</Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><StarRating rating={product.seller?.rating || 5} /><span>{product.seller?.totalSales} đã bán</span>{product.seller?.isVerified && <Badge variant="success">✓</Badge>}</div>
        </div><Link href={`/messages?to=${product.seller?.id}`}><button className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">💬 Chat</button></Link>
      </div></Card>
      <Card className="p-4"><h3 className="font-semibold mb-2">Mô tả</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p></Card>
      {(product.address || product.university || product.city) && <Card className="p-4 text-sm space-y-1">
        {product.address && <p>📍 Địa chỉ nhận / giao dịch: {product.address}</p>}
        {product.university && <p>�� {product.university}{(product as any).faculty ? ` - ${(product as any).faculty}` : ""}</p>}
        {product.city && <p>📍 {product.city}</p>}
        {(product as any).semester && <p>📅 {(product as any).semester}</p>}
      </Card>}
    </div>
  );
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <div className="mt-12"><h2 className="text-xl font-bold mb-4">Đánh giá ({reviews.length})</h2>
      <div className="space-y-4">{reviews.map(r => (
        <Card key={r.id} className="p-4"><div className="flex items-center gap-3 mb-2">
          <Avatar src={r.user?.avatar} name={r.user?.name || ""} size="sm" /><div><p className="font-medium text-sm">{r.user?.name}</p><StarRating rating={r.rating} /></div>
          <span className="ml-auto text-xs text-muted-foreground">{formatRelativeTime(r.createdAt)}</span>
        </div><p className="text-sm">{r.comment}</p></Card>
      ))}</div>
    </div>
  );
}
