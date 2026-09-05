import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseRange(period: string, from?: string, to?: string): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;
  if (period === "today") {
    start = startOfDay(end);
  } else if (period === "30d") {
    start = new Date(end.getTime() - 30 * 86400000);
  } else if (period === "month") {
    start = new Date(end.getFullYear(), end.getMonth(), 1);
  } else if (period === "custom" && from) {
    start = new Date(`${from}T00:00:00`);
    if (to) end.setTime(new Date(`${to}T23:59:59`).getTime());
    if (Number.isNaN(start.getTime())) start = new Date(end.getTime() - 7 * 86400000);
  } else {
    start = new Date(end.getTime() - 7 * 86400000);
  }
  if (start >= end) start = startOfDay(start);
  return { start, end };
}

function dayLabel(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Bạn không có quyền truy cập khu vực quản trị" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get("period") || "7d";
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const { start, end } = parseRange(periodParam, from, to);
  const duration = end.getTime() - start.getTime();
  const prevEnd = start;
  const prevStart = new Date(start.getTime() - duration);

  const inRange = (s: Date, e: Date) => ({ gte: s, lte: e });

  const [
    revenueCur,
    revenuePrev,
    ordersCur,
    ordersPrev,
    ordersPending,
    pendingProducts,
    newUsersCur,
    newUsersPrev,
    withdrawAgg,
    withdrawCount,
    failedTx,
    openReports,
    chartOrders,
    statusGroups,
    recentOrders,
    topItems,
    recentActivity,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: inRange(start, end) },
      _sum: { finalAmount: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: inRange(prevStart, prevEnd) },
      _sum: { finalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: inRange(start, end) } }),
    prisma.order.count({ where: { createdAt: inRange(prevStart, prevEnd) } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { createdAt: inRange(start, end) } }),
    prisma.user.count({ where: { createdAt: inRange(prevStart, prevEnd) } }),
    prisma.transaction.aggregate({
      where: { type: "WITHDRAW", status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { type: "WITHDRAW", status: "PENDING" } }),
    prisma.transaction.count({ where: { status: "FAILED", createdAt: inRange(start, end) } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      where: { createdAt: inRange(start, end) },
      select: { createdAt: true, finalAmount: true, paymentStatus: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        finalAmount: true,
        paymentMethod: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        buyer: { select: { id: true, name: true, avatar: true } },
        items: { take: 2, select: { title: true } },
      },
    }),
    prisma.orderItem.findMany({
      where: { createdAt: inRange(start, end), order: { paymentStatus: "PAID" } },
      select: { productId: true, price: true, quantity: true },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        entityType: true,
        newValue: true,
        reason: true,
        createdAt: true,
        admin: { select: { name: true } },
      },
    }),
  ]);

  const revenueValue = revenueCur._sum.finalAmount ?? 0;
  const revenuePrevValue = revenuePrev._sum.finalAmount ?? 0;

  // ---- Chart: bucket theo ngày ----
  const buckets = new Map<string, { revenue: number; orders: number }>();
  const days: Date[] = [];
  const d1 = startOfDay(end);
  for (let d = startOfDay(start); d <= d1; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
    buckets.set(d.toDateString(), { revenue: 0, orders: 0 });
  }
  for (const o of chartOrders) {
    const b = buckets.get(new Date(o.createdAt).toDateString());
    if (!b) continue;
    b.orders += 1;
    if (o.paymentStatus === "PAID") b.revenue += o.finalAmount;
  }
  const chart = days.map((d) => {
    const b = buckets.get(d.toDateString())!;
    return { label: dayLabel(d), revenue: b.revenue, orders: b.orders };
  });

  // ---- Top sản phẩm theo doanh thu trong khoảng ----
  const revenueByProduct = new Map<string, number>();
  for (const item of topItems) {
    revenueByProduct.set(
      item.productId,
      (revenueByProduct.get(item.productId) || 0) + item.price * item.quantity
    );
  }
  const topIds = Array.from(revenueByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const topProductsRaw = topIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          soldCount: true,
          seller: { select: { name: true } },
        },
      })
    : [];
  const topProducts = topProductsRaw
    .map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      sellerName: p.seller?.name || "-",
      soldCount: p.soldCount,
      revenue: revenueByProduct.get(p.id) || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const pct = (cur: number, prev: number): number | null => {
    if (!prev) return null;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  };

  const pendingWithdrawTotal = withdrawAgg._sum.amount ?? 0;

  const pendingTasks = [
    { id: "products", label: "Sản phẩm chờ duyệt", count: pendingProducts, href: "/admin/products/pending" },
    { id: "withdrawals", label: "Yêu cầu rút tiền", count: withdrawCount, href: "/admin/withdrawals" },
    { id: "reports", label: "Khiếu nại đang mở", count: openReports, href: "/admin/reports" },
    { id: "orders", label: "Đơn hàng đang xử lý", count: ordersPending, href: "/admin/orders" },
  ].filter((t) => t.count > 0);

  return NextResponse.json({
    period: periodParam,
    range: { start: start.toISOString(), end: end.toISOString() },
    kpis: {
      revenue: { value: revenueValue, prevValue: revenuePrevValue, deltaPct: pct(revenueValue, revenuePrevValue) },
      orders: { value: ordersCur, prevValue: ordersPrev, deltaPct: pct(ordersCur, ordersPrev) },
      pendingOrders: ordersPending,
      pendingProducts,
      newUsers: { value: newUsersCur, prevValue: newUsersPrev, deltaPct: pct(newUsersCur, newUsersPrev) },
      pendingWithdrawals: { total: pendingWithdrawTotal, count: withdrawCount },
      attention: {
        total: openReports + withdrawCount + failedTx,
        complaints: openReports,
        withdrawals: withdrawCount,
        failedTx,
      },
    },
    chart,
    orderStatusBreakdown: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyer: o.buyer,
      total: o.finalAmount,
      paymentMethod: o.paymentMethod,
      status: o.status,
      paymentStatus: o.paymentStatus,
      items: o.items,
      createdAt: o.createdAt.toISOString(),
    })),
    pendingTasks,
    topProducts,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      adminName: a.admin?.name || null,
      newValue: a.newValue,
      reason: a.reason,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}

