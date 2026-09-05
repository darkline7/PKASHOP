import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { productId, reason, description } = await req.json();

    if (!productId || !reason) {
      return NextResponse.json({ error: "Vui lòng chọn lý do báo cáo" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // If the seller is reporting their own item (e.g. "Đã bán", "Hỏng")
    const isSeller = product.sellerId === user.id;

    if (isSeller && reason === "Đã bán") {
      // Mark product as SOLD
      await prisma.product.update({
        where: { id: productId },
        data: { status: "SOLD" },
      });
      return NextResponse.json({ success: true, message: "Đã cập nhật trạng thái: Đã bán" });
    }

    if (isSeller && reason === "Hỏng") {
      // Mark product as HIDDEN / SOLD
      await prisma.product.update({
        where: { id: productId },
        data: { status: "HIDDEN" },
      });
      return NextResponse.json({ success: true, message: "Đã ẩn sản phẩm do bị hỏng" });
    }

    // Create report for Admin review
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        productId,
        reason,
        description: description || "",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Báo cáo của bạn đã được gửi tới BQT để kiểm duyệt.",
      report,
    });
  } catch (error) {
    console.error("Report submit error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}