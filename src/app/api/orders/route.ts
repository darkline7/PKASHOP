import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const url = new URL(req.url);
    const role = url.searchParams.get("role") || "buyer";
    const status = url.searchParams.get("status") || "";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const where: any = role === "seller" ? { sellerId: user.id } : { buyerId: user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
        include: {
          items: {
            select: {
              id: true, title: true, price: true, quantity: true, type: true,
              thumbnail: true, documentUrl: true, downloadCount: true, productId: true,
              product: {
                select: {
                  id: true, slug: true, title: true, type: true, documentUrl: true,
                },
              },
            },
          },
          buyer: { select: { id: true, name: true, avatar: true, email: true } },
          seller: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return NextResponse.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { paymentMethod, shippingName, shippingPhone, shippingAddress, shippingCity, note } = await req.json();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: { include: { seller: true } } },
    });
    if (cartItems.length === 0) return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });

    // Group by seller
    const sellerGroups: Record<string, typeof cartItems> = {};
    for (const item of cartItems) {
      const sid = item.product.sellerId;
      if (!sellerGroups[sid]) sellerGroups[sid] = [];
      sellerGroups[sid].push(item);
    }

    // Pre-validate: Documents & Quizzes must be paid with WALLET
    const hasDigital = cartItems.some(i => i.product.type === "DOCUMENT" || i.product.type === "QUIZ");
    if (hasDigital && paymentMethod !== "WALLET") {
      return NextResponse.json({ error: "Tài liệu và Quiz chỉ được thanh toán bằng số dư Ví PKASHOP trên web." }, { status: 400 });
    }

    // Pre-validate wallet balance
    if (paymentMethod === "WALLET") {
      const totalAll = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } });
      if (!fresh || fresh.walletBalance < totalAll) {
        return NextResponse.json({ error: "Số dư ví không đủ" }, { status: 400 });
      }
    }

    // Wrap all mutations in a transaction for data integrity
    const result = await prisma.$transaction(async (tx) => {
      const orders = [];
      for (const [sellerId, items] of Object.entries(sellerGroups)) {
        const totalAmount = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const orderNumber = `PKA${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        const order = await tx.order.create({
          data: {
            orderNumber, buyerId: user.id, sellerId,
            totalAmount, finalAmount: totalAmount,
            status: paymentMethod === "WALLET" ? "PAID" : "PENDING",
            paymentMethod: paymentMethod || "WALLET",
            paymentStatus: paymentMethod === "WALLET" ? "PAID" : "UNPAID",
            shippingName, shippingPhone, shippingAddress, shippingCity, note,
            items: {
              create: items.map(i => ({
                productId: i.product.id, title: i.product.title, price: i.product.price,
                quantity: i.quantity, type: i.product.type, thumbnail: i.product.thumbnail,
                documentUrl: (i.product.type === "DOCUMENT" || !i.product.type) ? (i.product.documentUrl || null) : null,
              })),
            },
          },
          include: { items: true },
        });

        if (paymentMethod === "WALLET") {
          const freshBuyer = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalance: true } });
          if (freshBuyer.walletBalance < totalAmount) throw new Error("INSUFFICIENT_BALANCE");
          await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: totalAmount } } });
          await tx.transaction.create({ data: { userId: user.id, type: "PAYMENT", amount: -totalAmount, balanceAfter: freshBuyer.walletBalance - totalAmount, description: `Thanh toán đơn #${orderNumber}`, referenceId: order.id } });
          // Calculate cuts: for QUIZ and DOCUMENT, platform fee is 30% (seller gets 70%)
          let sellerCut = 0;
          let platformFee = 0;
          for (const item of items) {
            const itemTotal = item.product.price * item.quantity;
            if (item.product.type === "DOCUMENT" || item.product.type === "QUIZ") {
              // 30% commission
              const fee = itemTotal * 0.3;
              platformFee += fee;
              sellerCut += (itemTotal - fee);
            } else {
              // Physical items: 10% or free
              const fee = itemTotal * 0.1;
              platformFee += fee;
              sellerCut += (itemTotal - fee);
            }
          }

          await tx.user.update({ where: { id: sellerId }, data: { walletBalance: { increment: sellerCut }, frozenBalance: { increment: platformFee } } });
          for (const item of items) {
            await tx.product.update({ where: { id: item.product.id }, data: { soldCount: { increment: item.quantity } } });

            // If product is QUIZ, create or extend QuizAccess for 7 days
            if (item.product.type === "QUIZ") {
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              await tx.quizAccess.upsert({
                where: { userId_productId: { userId: user.id, productId: item.product.id } },
                create: { userId: user.id, productId: item.product.id, orderId: order.id, expiresAt },
                update: { expiresAt, orderId: order.id },
              });
            }
          }
          await tx.notification.create({ data: { userId: sellerId, title: "Đơn hàng mới", message: `Bạn có đơn hàng mới #${orderNumber}`, type: "ORDER", link: `/seller/orders` } });
        }
        orders.push(order);
      }
      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return orders;
    });

    return NextResponse.json({ success: true, orders: result });
  } catch (error: any) {
    console.error("Order create error:", error);
    if (error?.message === "INSUFFICIENT_BALANCE") return NextResponse.json({ error: "Số dư ví không đủ" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
