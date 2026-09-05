import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const [transactions, autoBankConfigs, sysSettings] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.autoBankConfig.findMany({ where: { isActive: true } }),
      prisma.systemSetting.findMany({
        where: { key: { in: ["bank_name", "bank_code", "bank_account_number", "bank_account_name"] } },
      }),
    ]);

    const sMap: Record<string, string> = {};
    sysSettings.forEach((s) => { sMap[s.key] = s.value; });

    const activeBank = autoBankConfigs[0] || null;
    const bankInfo = {
      bankCode: activeBank?.bankCode || sMap["bank_code"] || "MBBANK",
      bankName: activeBank?.bankCode || sMap["bank_name"] || "MB Bank",
      accountNumber: activeBank?.accountNumber || sMap["bank_account_number"] || "0868888999",
      accountName: activeBank?.accountName || sMap["bank_account_name"] || "PKASHOP VIETNAM",
      transferNote: `PKA NAP ${user.username.toUpperCase()}`,
      userId: user.id,
      username: user.username,
    };

    return NextResponse.json({
      balance: user.walletBalance,
      frozenBalance: user.frozenBalance,
      transactions,
      bankInfo,
    });
  } catch (error) {
    console.error("Wallet GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { type, amount, bankName, accountNumber, accountName } = await req.json();
    const num = Number(amount);
    if (!type || isNaN(num) || num <= 0) {
      return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }

    if (type === "DEPOSIT") {
      const result = await prisma.$transaction(async (tx) => {
        const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalance: true } });
        await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: num } } });
        const txn = await tx.transaction.create({
          data: {
            userId: user.id, type: "DEPOSIT", amount: num,
            balanceAfter: fresh.walletBalance + num, status: "SUCCESS",
            paymentMethod: "VIETQR",
            description: `Nạp tiền vào ví (+${num.toLocaleString("vi-VN")}đ)`,
          },
        });
        await tx.notification.create({
          data: {
            userId: user.id, title: "Nạp tiền thành công! 💰",
            message: `Ví đã được cộng +${num.toLocaleString("vi-VN")}đ.`,
            type: "WALLET", link: "/wallet",
          },
        });
        return { balance: fresh.walletBalance + num, transaction: txn };
      });
      return NextResponse.json({ success: true, balance: result.balance, transaction: result.transaction });
    }

    if (type === "WITHDRAW") {
      if (num < 10000) return NextResponse.json({ error: "Rút tối thiểu 10.000đ" }, { status: 400 });
      const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalance: true } });
      if (fresh.walletBalance < num) return NextResponse.json({ error: "Số dư không đủ" }, { status: 400 });

      const result = await prisma.$transaction(async (tx) => {
        const freshUser = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalance: true } });
        if (freshUser.walletBalance < num) throw new Error("INSUFFICIENT_BALANCE");
        await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: num } } });
        const desc = bankName && accountNumber ? `Rút về ${bankName} - ${accountNumber}` : `Rút tiền về ngân hàng`;
        const txn = await tx.transaction.create({
          data: {
            userId: user.id, type: "WITHDRAW", amount: -num,
            balanceAfter: freshUser.walletBalance - num, status: "PENDING",
            paymentMethod: "BANK_TRANSFER", description: desc,
          },
        });
        return { balance: freshUser.walletBalance - num, transaction: txn };
      });
      return NextResponse.json({ success: true, balance: result.balance, transaction: result.transaction });
    }

    return NextResponse.json({ error: "Loại giao dịch không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    if (error?.message === "INSUFFICIENT_BALANCE") return NextResponse.json({ error: "Số dư không đủ" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}




