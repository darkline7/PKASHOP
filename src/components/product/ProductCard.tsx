"use client";
import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Avatar, StarRating } from "@/components/ui/Components";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import type { Product } from "@/types";

function ProductCardComponent({ product }: { product: Product }) {
  let imgs: string[] = [];
  try {
    imgs = JSON.parse(product.images || "[]");
  } catch {
    imgs = [];
  }
  const imgSrc = product.thumbnail || imgs[0] || "/placeholder.jpg";
  return (
    <Link href={`/product/${product.slug}`} className="group block product-card-contain">
      <div className="rounded-xl border border-border bg-card overflow-hidden transition-shadow duration-200 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            {product.type === "DOCUMENT" && <Badge variant="info">📄 Tài liệu</Badge>}
            {product.type === "PHYSICAL" && <Badge variant="success">📦 Vật phẩm</Badge>}
            {product.isFeatured && <Badge variant="warning">⭐ Nổi bật</Badge>}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 right-2">
              <Badge variant="error">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</Badge>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="font-medium text-sm line-clamp-2 mb-1.5 group-hover:text-primary-600 transition-colors">{product.title}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.totalReviews})</span>
            {product.soldCount > 0 && <span className="text-xs text-muted-foreground">· {product.soldCount} đã bán</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline flex-wrap gap-1">
              <span className="text-base sm:text-lg font-bold text-primary-600">{formatVND(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatVND(product.originalPrice)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Avatar src={product.seller?.avatar} name={product.seller?.name || "User"} size="sm" />
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">{product.seller?.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(product.createdAt)}</span>
          </div>
          {product.city && <p className="text-xs text-muted-foreground mt-1.5">📍 {product.city}</p>}
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCardComponent);
