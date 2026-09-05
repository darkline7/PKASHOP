import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        seller: { select: { id: true, name: true, username: true, avatar: true, rating: true, totalSales: true, totalReviews: true, isVerified: true, university: true, city: true, createdAt: true } },
        category: true,
        reviews: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });

    // Increment views
    await prisma.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } });

    // Related products
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, status: "ACTIVE" },
      include: { seller: { select: { id: true, name: true, avatar: true } }, category: true },
      take: 4, orderBy: { soldCount: "desc" },
    });

    return NextResponse.json({ product: { ...product, views: product.views + 1 }, related });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
