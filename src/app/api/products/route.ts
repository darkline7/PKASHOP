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

    // Auto cleanup expired PHYSICAL products (> 7 days)
    const now = new Date();
    await prisma.product.updateMany({
      where: {
        type: "PHYSICAL",
        status: "ACTIVE",
        expiresAt: { lt: now },
      },
      data: { status: "HIDDEN" },
    }).catch(() => {});

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
    const {
      title,
      description,
      price,
      originalPrice,
      type,
      condition,
      categoryId,
      thumbnail,
      images,
      documentUrl,
      fileFormat,
      fileSize,
      pageCount,
      university,
      faculty,
      courseCode,
      semester,
      city,
      address,
      tags,
      proofImages,
      quizQuestions,
    } = body;

    const prodType = type || "DOCUMENT";

    // Validate pricing rules
    let finalPrice = Number(price);
    if (isNaN(finalPrice) || finalPrice < 0) finalPrice = 0;

    if (prodType === "QUIZ") {
      if (finalPrice !== 15000 && finalPrice !== 20000) {
        return NextResponse.json({ error: "Quiz chỉ có 2 mức giá cố định là 15.000đ hoặc 20.000đ." }, { status: 400 });
      }
      if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
        return NextResponse.json({ error: "Vui lòng nhập danh sách câu hỏi trắc nghiệm Quiz." }, { status: 400 });
      }
    } else if (prodType === "DOCUMENT") {
      if (finalPrice <= 0) {
        return NextResponse.json({ error: "Vui lòng nhập giá bán tài liệu hợp lệ." }, { status: 400 });
      }
    }

    if (!title || !description || !categoryId || !thumbnail) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Physical item expires in 7 days
    let expiresAt: Date | null = null;
    if (prodType === "PHYSICAL") {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // Create slug
    const baseSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price: finalPrice,
        originalPrice: originalPrice ? Number(originalPrice) : null,
        type: prodType,
        condition: condition || "NEW",
        status: "PENDING", // Luôn qua kiểm duyệt của admin
        thumbnail,
        images: JSON.stringify(images || []),
        proofImages: JSON.stringify(proofImages || []),
        documentUrl: prodType === "DOCUMENT" ? documentUrl : null,
        fileFormat: prodType === "DOCUMENT" ? fileFormat : null,
        fileSize: fileSize ? Number(fileSize) : null,
        pageCount: pageCount ? Number(pageCount) : null,
        university,
        faculty,
        courseCode,
        semester,
        city,
        address,
        tags: JSON.stringify(tags || []),
        sellerId: user.id,
        categoryId,
        expiresAt,
        ...(prodType === "QUIZ" && Array.isArray(quizQuestions)
          ? {
              quizQuestions: {
                create: quizQuestions.map((q: any, idx: number) => ({
                  question: q.question,
                  option1: q.option1,
                  option2: q.option2,
                  option3: q.option3,
                  option4: q.option4,
                  correctAnswer: Number(q.correctAnswer) || 1,
                  explanation: q.explanation || null,
                  order: idx + 1,
                })),
              },
            }
          : {}),
      },
      include: {
        seller: { select: { id: true, name: true, username: true, avatar: true } },
        category: true,
        quizQuestions: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
