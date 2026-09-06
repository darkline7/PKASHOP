import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_CATEGORIES = [
  { name: "Tài liệu học tập & Đề thi", slug: "tai-lieu-hoc-tap", icon: "📚", type: "DOCUMENT", order: 1, description: "Slide, đề thi, tóm tắt bài giảng các môn học" },
  { name: "Quiz trắc nghiệm ôn tập", slug: "quiz-trac-nghiem", icon: "🧠", type: "DOCUMENT", order: 2, description: "Bộ câu hỏi ôn thi trắc nghiệm kèm đáp án" },
  { name: "Giáo trình & Sách đại học", slug: "giao-trinh-sach", icon: "📖", type: "PHYSICAL", order: 3, description: "Giáo trình Phenikaa và sách chuyên ngành" },
  { name: "Đồ điện tử & Máy tính cầm tay", slug: "do-dien-tu", icon: "💻", type: "PHYSICAL", order: 4, description: "Máy tính Casio fx-580, chuột, bàn phím, laptop" },
  { name: "Pass đồ dùng sinh viên", slug: "pass-do-sinh-vien", icon: "🎁", type: "PHYSICAL", order: 5, description: "Đồ dùng KTX, sách vở, vật dụng sinh viên" },
  { name: "Công nghệ thông tin & Lập trình", slug: "cntt-lap-trinh", icon: "⚡", type: "DOCUMENT", order: 6, description: "Tài liệu C/C++, Java, Python, Web, Thuật toán" },
  { name: "Kinh tế & Quản trị kinh doanh", slug: "kinh-te-qtkd", icon: "📊", type: "DOCUMENT", order: 7, description: "Kinh tế vi mô, vĩ mô, Marketing, Kế toán" },
  { name: "Lý luận chính trị & Pháp luật", slug: "chinh-tri-phap-luat", icon: "⚖️", type: "DOCUMENT", order: 8, description: "Triết học Mác - Lênin, Kinh tế chính trị, Tư tưởng HCM" },
  { name: "Ngoại ngữ (Tiếng Anh, TOEIC)", slug: "ngoai-ngu", icon: "🌐", type: "DOCUMENT", order: 9, description: "Tài liệu tiếng Anh, tài liệu ôn thi chuẩn đầu ra" },
  { name: "Danh mục khác", slug: "danh-muc-khac", icon: "📁", type: "ALL", order: 10, description: "Các tài liệu và vật phẩm sinh viên khác" },
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    });

    // Auto-seed if categories are completely empty on database
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.create({ data: cat }).catch(() => {});
      }
      categories = await prisma.category.findMany({
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ categories: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thêm danh mục" }, { status: 401 });
    }

    const body = await req.json();
    const { name, icon, type, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên danh mục không được để trống" }, { status: 400 });
    }

    const cleanName = name.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const slug = `${baseSlug || "danh-muc"}-${Date.now().toString(36)}`;

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        slug,
        icon: icon || "📁",
        type: type || "ALL",
        description: description || `Danh mục ${cleanName}`,
        order: 99,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: error?.message || "Lỗi tạo danh mục" }, { status: 500 });
  }
}

