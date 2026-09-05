import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true, username: true, name: true, avatar: true, bio: true,
        university: true, faculty: true, city: true, isVerified: true,
        rating: true, totalSales: true, totalReviews: true, createdAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    const products = await prisma.product.findMany({
      where: { sellerId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { category: true, seller: { select: { id: true, name: true, username: true, avatar: true, rating: true } } },
    });

    return NextResponse.json({ user, products });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
