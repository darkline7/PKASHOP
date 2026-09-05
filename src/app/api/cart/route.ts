import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: [] });
    const items = await prisma.cartItem.findMany({
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
    if (!productId) return NextResponse.json({ error: "Thiếu productId" }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "ACTIVE") return NextResponse.json({ error: "Sản phẩm không khả dụng" }, { status: 404 });
    if (product.sellerId === user.id) return NextResponse.json({ error: "Không thể mua sản phẩm của chính mình" }, { status: 400 });

    // Check duplicate for digital
    if (product.type === "DOCUMENT") {
      const existing = await prisma.cartItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
      if (existing) return NextResponse.json({ error: "Sản phẩm đã có trong giỏ hàng" }, { status: 400 });
      // Check already purchased
      const purchased = await prisma.orderItem.findFirst({ where: { productId, order: { buyerId: user.id, status: { in: ["PAID", "COMPLETED"] } } } });
      if (purchased) return NextResponse.json({ error: "Bạn đã mua tài liệu này" }, { status: 400 });
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { quantity: product.type === "DOCUMENT" ? 1 : { increment: 1 } },
      create: { userId: user.id, productId, quantity: 1 },
      include: { product: true },
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    await prisma.cartItem.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Lỗi server" }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { itemId, quantity } = await req.json();
    if (!itemId || !quantity || quantity < 1) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    await prisma.cartItem.updateMany({ where: { id: itemId, userId: user.id }, data: { quantity } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Lỗi server" }, { status: 500 }); }
}
