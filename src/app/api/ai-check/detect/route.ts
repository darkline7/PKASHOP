import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { detectAIText } from "@/lib/aiDetector";
import { calculateAICheckFee } from "@/lib/aiPricing";

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

    // Hạn mức kiểm tra AI theo chính sách giá:
    // - Dưới 1.000 từ: Miễn phí
    // - 1.000 – 5.000 từ: 2.000đ / 1.000 từ
    // - 5.000 – 10.000 từ: 1.500đ / 1.000 từ
    // - 10.000 – 30.000 từ: 1.000đ / 1.000 từ
    // - Trên 30.000 từ: 800đ / 1.000 từ
    const pricing = calculateAICheckFee(words.length);
    let fee = pricing.fee;

    if (!pricing.isFree) {
      if (!user) {
        return NextResponse.json(
          {
            error: `Văn bản dài ${words.length.toLocaleString("vi-VN")} từ (${pricing.tierLabel} - phí ${pricing.fee.toLocaleString("vi-VN")}đ) yêu cầu đăng nhập tài khoản sinh viên PKASHOP để tiếp tục.`,
            requireLogin: true,
          },
          { status: 401 }
        );
      }

      const freshUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { walletBalance: true },
      });

      if (!freshUser || freshUser.walletBalance < fee) {
        return NextResponse.json(
          {
            error: `Số dư ví không đủ (${fee.toLocaleString("vi-VN")}đ cho ${words.length.toLocaleString("vi-VN")} từ theo bảng giá: ${pricing.pricePerUnitText}). Vui lòng nạp thêm tiền vào ví để kiểm tra tài liệu dài.`,
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
            description: `Dịch vụ Check AI & Đánh giá nội dung (${words.length.toLocaleString("vi-VN")} từ - ${pricing.pricePerUnitText})`,
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
