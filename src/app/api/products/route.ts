import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const type = url.searchParams.get("type") || "";
    const sort = url.searchParams.get("sort") || "newest";
    const minPrice = Number(url.searchParams.get("minPrice")) || 0;
    const maxPrice = Number(url.searchParams.get("maxPrice")) || 0;
    const city = url.searchParams.get("city") || "";
    const condition = url.searchParams.get("condition") || "";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 12));
    const featured = url.searchParams.get("featured") === "true";

    const where: any = { status: "ACTIVE" };
    if (search) where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { university: { contains: search } },
      { courseCode: { contains: search } },
    ];
    if (category) {
      // Use category relation directly instead of separate lookup
      where.category = { slug: category };
    }
    if (type) where.type = type;
    if (minPrice > 0) where.price = { ...where.price, gte: minPrice };
    if (maxPrice > 0) where.price = { ...where.price, lte: maxPrice };
    if (city) where.city = { contains: city };
    if (condition) where.condition = condition;
    if (featured) where.isFeatured = true;

    const orderBy: any = sort === "price_asc" ? { price: "asc" }
      : sort === "price_desc" ? { price: "desc" }
      : sort === "bestselling" ? { soldCount: "desc" }
      : sort === "rating" ? { rating: "desc" }
      : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { seller: { select: { id: true, name: true, username: true, avatar: true, rating: true, isVerified: true } }, category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const body = await req.json();
    const { title, description, price, originalPrice, type, condition, categoryId, thumbnail, images, documentUrl, fileFormat, fileSize, pageCount, university, faculty, courseCode, semester, city, address, tags } = body;

    if (!title || !description || !price || !categoryId || !thumbnail) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Create slug
    const baseSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        title, slug, description, price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : null,
        type: type || "DOCUMENT", condition: condition || "NEW", status: "PENDING",
        thumbnail, images: JSON.stringify(images || []),
        documentUrl, fileFormat, fileSize: fileSize ? Number(fileSize) : null, pageCount: pageCount ? Number(pageCount) : null,
        university, faculty, courseCode, semester, city, address,
        tags: JSON.stringify(tags || []),
        sellerId: user.id, categoryId,
      },
      include: { seller: { select: { id: true, name: true, username: true, avatar: true } }, category: true },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
