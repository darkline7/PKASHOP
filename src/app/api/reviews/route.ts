import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    const sellerId = url.searchParams.get("sellerId");
    const where: any = {};
    if (productId) where.productId = productId;
    if (sellerId) where.product = { sellerId };
    const reviews = await prisma.review.findMany({
      where, orderBy: { createdAt: "desc" }, take: 20,
      include: { user: { select: { id: true, name: true, avatar: true } }, product: { select: { id: true, title: true, slug: true, thumbnail: true } } },
    });
    return NextResponse.json({ reviews });
  } catch { return NextResponse.json({ reviews: [] }); }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { productId, orderId, rating, comment, images } = await req.json();
    if (!productId || !rating || !comment) return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

    // Check if user purchased
    const orderItem = await prisma.orderItem.findFirst({
      where: { productId, order: { buyerId: user.id, status: { in: ["PAID", "COMPLETED"] } } },
    });
    if (!orderItem) return NextResponse.json({ error: "Bạn chưa mua sản phẩm này" }, { status: 403 });

    // Check existing review
    const existing = await prisma.review.findFirst({ where: { userId: user.id, productId } });
    if (existing) return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này" }, { status: 400 });

    const review = await prisma.review.create({
      data: { userId: user.id, productId, orderId, rating: Number(rating), comment, images: JSON.stringify(images || []) },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Update product rating
    const allReviews = await prisma.review.findMany({ where: { productId }, select: { rating: true } });
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await prisma.product.update({ where: { id: productId }, data: { rating: avgRating, totalReviews: allReviews.length } });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
