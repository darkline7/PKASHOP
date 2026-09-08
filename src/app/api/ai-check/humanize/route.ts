import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { humanizeText, generateSentenceSuggestion } from "@/lib/aiDetector";
import { calculateAICheckFee } from "@/lib/aiPricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text || "";
    const mode = body?.mode || "standard"; // standard | academic | creative
    const isSingleSentence = Boolean(body?.isSingleSentence);

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Vui lòng cung cấp văn bản cần viết lại." }, { status: 400 });
    }

    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);

    // Nếu chỉ là 1 câu ngắn, viết lại tức thì
    if (isSingleSentence && words.length <= 60) {
      const suggestion = generateSentenceSuggestion(trimmed);
      return NextResponse.json({
        success: true,
        humanized: suggestion,
        originalWordCount: words.length,
        newWordCount: suggestion.split(/\s+/).filter(Boolean).length,
      });
    }

    const user = await getCurrentUser();

    // Hạn mức Humanize theo chính sách giá:
    // - Dưới 1.000 từ: Miễn phí hoàn toàn
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
            error: `Tính năng Viết lại tự nhiên (Humanize) toàn bài (${words.length.toLocaleString("vi-VN")} từ - ${pricing.tierLabel} phí ${pricing.fee.toLocaleString("vi-VN")}đ) yêu cầu đăng nhập tài khoản sinh viên.`,
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
            error: `Số dư ví không đủ (${fee.toLocaleString("vi-VN")}đ cho ${words.length.toLocaleString("vi-VN")} từ theo bảng giá: ${pricing.pricePerUnitText}). Vui lòng nạp thêm tiền vào ví để viết lại văn bản dài.`,
            requireDeposit: true,
            feeRequired: fee,
            currentBalance: freshUser?.walletBalance || 0,
          },
          { status: 400 }
        );
      }

      // Trừ tiền ví
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
            description: `Dịch vụ Humanize AI & Viết lại tự nhiên (${words.length.toLocaleString("vi-VN")} từ - ${pricing.pricePerUnitText})`,
          },
        });
      });
    }

    const result = await humanizeText(trimmed, mode);

    return NextResponse.json({
      success: true,
      ...result,
      feeDeducted: fee,
      userBalance: user
        ? (await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } }))?.walletBalance
        : undefined,
    });
  } catch (error: any) {
    console.error("AI Humanize API error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi khi xử lý văn bản. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
