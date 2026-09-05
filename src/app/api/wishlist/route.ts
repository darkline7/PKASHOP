import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: [] });
    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { product: { include: { seller: { select: { id: true, name: true, avatar: true } }, category: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch { return NextResponse.json({ items: [] }); }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { productId } = await req.json();
    const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed" });
    }
    await prisma.wishlist.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ success: true, action: "added" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
