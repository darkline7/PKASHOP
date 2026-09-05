import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

// Cache for public settings (reCAPTCHA key) - avoid DB query on every login/register page load
let settingsCache: { data: Record<string, string>; ts: number } | null = null;
const SETTINGS_CACHE_TTL = 60_000; // 1 minute

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "dashboard";

    // Public endpoint: settings (no auth required, used by login/register for reCAPTCHA key)
    if (action === "settings") {
      const now = Date.now();
      if (settingsCache && now - settingsCache.ts < SETTINGS_CACHE_TTL) {
        return NextResponse.json({ settings: settingsCache.data });
      }
      const settings = await prisma.systemSetting.findMany();
      const map: Record<string, string> = {};
      settings.forEach(s => { map[s.key] = s.value; });
      settingsCache = { data: map, ts: now };
      return NextResponse.json({ settings: map });
    }

    // All other admin actions require admin role
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    if (action === "dashboard") {
      const [totalUsers, totalProducts, totalOrders, pendingProducts, revenue] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.product.count({ where: { status: "PENDING" } }),
        prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { finalAmount: true } }),
      ]);
      const sellers = await prisma.user.count({ where: { role: "SELLER" } });
      const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { buyer: { select: { name: true, avatar: true } }, items: true } });
      const pendingListings = await prisma.product.findMany({ where: { status: "PENDING" }, take: 10, include: { seller: { select: { name: true } }, category: true } });

      return NextResponse.json({
        stats: { totalUsers, sellers, totalProducts, totalOrders, pendingProducts, revenue: revenue._sum.finalAmount || 0 },
        recentOrders, pendingListings,
      });
    }

    if (action === "users") {
      const page = Number(url.searchParams.get("page")) || 1;
      const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20, select: { id: true, email: true, username: true, name: true, avatar: true, role: true, isVerified: true, rating: true, totalSales: true, walletBalance: true, createdAt: true } });
      const total = await prisma.user.count();
      return NextResponse.json({ users, total });
    }

    if (action === "products") {
      const status = url.searchParams.get("status") || "";
      const page = Number(url.searchParams.get("page")) || 1;
      const where: any = {};
      if (status) where.status = status;
      const [products, total] = await Promise.all([
        prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20, include: { seller: { select: { name: true } }, category: true } }),
        prisma.product.count({ where }),
      ]);
      return NextResponse.json({ products, total });
    }

    if (action === "orders") {
      const page = Number(url.searchParams.get("page")) || 1;
      const status = url.searchParams.get("status") || "";
      const where: any = {};
      if (status) where.status = status;
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * 20,
          take: 20,
          include: {
            buyer: { select: { id: true, name: true, email: true, avatar: true } },
            seller: { select: { id: true, name: true, email: true } },
            items: true,
          },
        }),
        prisma.order.count({ where }),
      ]);
      return NextResponse.json({ orders, total });
    }

    if (action === "categories") {
      const categories = await prisma.category.findMany({
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
      });
      return NextResponse.json({ categories });
    }

    if (action === "reports") {
      const reports = await prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, title: true, slug: true } },
        },
      });
      return NextResponse.json({ reports });
    }

    if (action === "autobank") {
      const configs = await prisma.autoBankConfig.findMany({ orderBy: { bankCode: "asc" } });
      return NextResponse.json({ configs });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { action, id, data } = await req.json();

    if (action === "approve_product") {
      await prisma.product.update({ where: { id }, data: { status: "ACTIVE" } });
      const product = await prisma.product.findUnique({ where: { id } });
      if (product) await prisma.notification.create({ data: { userId: product.sellerId, title: "Sản phẩm đã được duyệt", message: `"${product.title}" đã được duyệt`, type: "PRODUCT", link: `/product/${product.slug}` } });
      return NextResponse.json({ success: true });
    }
    if (action === "reject_product") {
      await prisma.product.update({ where: { id }, data: { status: "REJECTED" } });
      const product = await prisma.product.findUnique({ where: { id } });
      if (product) await prisma.notification.create({ data: { userId: product.sellerId, title: "Sản phẩm bị từ chối", message: `"${product.title}" bị từ chối. Lý do: ${data?.reason || "Vi phạm quy định"}`, type: "PRODUCT" } });
      return NextResponse.json({ success: true });
    }
    if (action === "update_user_role") {
      await prisma.user.update({ where: { id }, data: { role: data.role } });
      return NextResponse.json({ success: true });
    }
    if (action === "update_order_status") {
      await prisma.order.update({ where: { id }, data: { status: data.status } });
      return NextResponse.json({ success: true });
    }

    if (action === "save_autobank") {
      const { bankCode, apiBaseUrl, apiToken, accountNumber, accountName, isActive } = data;
      if (!bankCode || !apiBaseUrl || !apiToken) {
        return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
      }
      await prisma.autoBankConfig.upsert({
        where: { bankCode },
        update: { apiBaseUrl, apiToken, accountNumber: accountNumber || "", accountName: accountName || "", isActive: isActive ?? true },
        create: { bankCode, apiBaseUrl, apiToken, accountNumber: accountNumber || "", accountName: accountName || "", isActive: isActive ?? true },
      });
      return NextResponse.json({ success: true });
    if (action === "resolve_report") {
      await prisma.report.update({
        where: { id },
        data: { status: data.status || "RESOLVED", resolution: data.resolution || "" },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "save_category") {
      const { name, slug, description, icon, type, order } = data;
      if (!name || !slug) return NextResponse.json({ error: "Thiếu tên hoặc slug" }, { status: 400 });
      if (id) {
        await prisma.category.update({
          where: { id },
          data: { name, slug, description, icon, type: type || "ALL", order: Number(order) || 0 },
        });
      } else {
        await prisma.category.create({
          data: { name, slug, description, icon, type: type || "ALL", order: Number(order) || 0 },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "delete_category") {
      if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
      await prisma.category.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    }

    if (action === "delete_autobank") {
      if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
      await prisma.autoBankConfig.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === "save_setting") {
      const { key, value } = data;
      if (!key) return NextResponse.json({ error: "Thiếu key" }, { status: 400 });
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
