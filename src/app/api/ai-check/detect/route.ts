import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { detectAIText } from "@/lib/aiDetector";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text || "";

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Vui lòng nhập văn bản cần kiểm tra." }, { status: 400 });
    }

    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 10) {
      return NextResponse.json(
        { error: "Văn bản quá ngắn. Vui lòng nhập tối thiểu 10 từ để hệ thống phân tích chuẩn xác." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    // Hạn mức kiểm tra:
    // Dưới 250 từ: Miễn phí hoàn toàn cho sinh viên trải nghiệm
    // Trên 250 từ: Tính phí tượng trưng 500đ / 1.000 từ trừ qua số dư Ví PKASHOP
    let fee = 0;
    if (words.length > 250) {
      if (!user) {
        return NextResponse.json(
          {
            error: "Văn bản dài trên 250 từ yêu cầu đăng nhập tài khoản sinh viên PKASHOP để tiếp tục.",
            requireLogin: true,
          },
          { status: 401 }
        );
      }

      // 500đ cho mỗi 1.000 từ (làm tròn lên)
      fee = Math.max(500, Math.ceil(words.length / 1000) * 500);

      const freshUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { walletBalance: true },
      });

      if (!freshUser || freshUser.walletBalance < fee) {
        return NextResponse.json(
          {
            error: `Số dư ví không đủ (${fee.toLocaleString("vi-VN")}đ cho ${words.length} từ). Vui lòng nạp thêm tiền vào ví để kiểm tra tài liệu dài.`,
            requireDeposit: true,
            feeRequired: fee,
            currentBalance: freshUser?.walletBalance || 0,
          },
          { status: 400 }
        );
      }

      // Trừ tiền ví và ghi nhận lịch sử giao dịch
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { walletBalance: { decrement: fee } },
        });

        await tx.transaction.create({
          data: {
            userId: user.id,
            type: "PAYMENT",
            amount: -fee,
            balanceAfter: freshUser.walletBalance - fee,
            status: "SUCCESS",
            description: `Dịch vụ Check AI & Đánh giá nội dung (${words.length} từ)`,
          },
        });
      });
    }

    // Tiến hành phân tích AI bằng Core Engine
    const result = await detectAIText(trimmed);

    return NextResponse.json({
      success: true,
      ...result,
      feeDeducted: fee,
      userBalance: user ? (await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } }))?.walletBalance : undefined,
    });
  } catch (error: any) {
    console.error("AI Detect API error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi khi phân tích văn bản. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
