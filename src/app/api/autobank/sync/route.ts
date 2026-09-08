import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  fetchBankHistory,
  parseAmount,
  matchUserFromDescription,
} from "@/lib/autoBank";

/**
 * AutoBank Sync API
 * POST /api/autobank/sync  – Admin-triggered manual sync / Webhook
 * GET  /api/autobank/sync  – Can be called by cron / external scheduler
 *
 * Supports: MBBANK v2, ACB via modtool.fun history APIs:
 * Example: https://api.modtool.fun/historyapimbbankv2/token
 */

export async function POST() {
  try {
    const configs = await prisma.autoBankConfig.findMany({ where: { isActive: true } });
    if (configs.length === 0) {
      return NextResponse.json({
        synced: 0,
        message: "Không có cấu hình auto-bank nào đang kích hoạt (bật isActive trong Admin).",
      });
    }

    let totalSynced = 0;
    const results: Record<string, { synced: number; error?: string; latestTxn?: string }> = {};

    for (const cfg of configs) {
      try {
        const txns = await fetchBankHistory(cfg.apiBaseUrl, cfg.apiToken);
        let synced = 0;

        for (const t of txns) {
          if (!t.transactionID) continue;
          const refId = `${cfg.bankCode}_${t.transactionID}`;

          const existing = await prisma.transaction.findFirst({ where: { referenceId: refId } });
          if (existing) continue;

          const amount = parseAmount(t.amount);
          if (amount <= 0) continue;

          const desc = t.description || "";
          const isIn = t.type === "IN";

          let targetUser: { id: string; username: string; walletBalance: number } | null = null;

          if (isIn) {
            targetUser = await matchUserFromDescription(desc);

            // Fallback: If description didn't match username, check if user bankAccount matches
            if (!targetUser && cfg.accountNumber) {
              const u = await prisma.user.findFirst({
                where: { bankAccount: cfg.accountNumber },
                select: { id: true, username: true, walletBalance: true },
              });
              if (u) targetUser = u;
            }
          }

          if (isIn && targetUser) {
            // Credit directly to student's PKASHOP wallet
            await prisma.$transaction(async (tx) => {
              const fresh = await tx.user.findUniqueOrThrow({
                where: { id: targetUser.id },
                select: { walletBalance: true },
              });
              await tx.user.update({
                where: { id: targetUser.id },
                data: { walletBalance: { increment: amount } },
              });
              await tx.transaction.create({
                data: {
                  userId: targetUser.id,
                  type: "AUTOBANK_IN",
                  amount,
                  balanceAfter: fresh.walletBalance + amount,
                  paymentMethod: "VIETQR",
                  referenceId: refId,
                  description: `[${cfg.bankCode}] Nạp tiền tự động: ${desc}`,
                  status: "SUCCESS",
                },
              });
            });

            // Notification for student
            await prisma.notification.create({
              data: {
                userId: targetUser.id,
                title: "Nạp tiền tự động thành công",
                message: `Bạn vừa được cộng +${amount.toLocaleString("vi-VN")}đ vào Ví PKASHOP qua chuyển khoản VietQR (${cfg.bankCode}).`,
                type: "WALLET",
                link: "/wallet",
              },
            }).catch(() => {});
          } else {
            // System-level fallback: record under first Admin user
            const admin = await prisma.user.findFirst({
              where: { role: "ADMIN" },
              select: { id: true, walletBalance: true },
            });
            if (admin) {
              await prisma.$transaction(async (tx) => {
                const fresh = await tx.user.findUniqueOrThrow({
                  where: { id: admin.id },
                  select: { walletBalance: true },
                });
                const delta = isIn ? amount : -amount;
                await tx.user.update({
                  where: { id: admin.id },
                  data: { walletBalance: { increment: delta } },
                });
                await tx.transaction.create({
                  data: {
                    userId: admin.id,
                    type: isIn ? "AUTOBANK_IN" : "AUTOBANK_OUT",
                    amount: delta,
                    balanceAfter: fresh.walletBalance + delta,
                    paymentMethod: "BANK_TRANSFER",
                    referenceId: refId,
                    description: `[${cfg.bankCode} ${isIn ? "Thu" : "Chi"}] ${desc}`,
                    status: "SUCCESS",
                  },
                });
              });
            }
          }

          synced++;
        }

        const latestTxn = txns[0];
        await prisma.autoBankConfig.update({
          where: { id: cfg.id },
          data: {
            lastSyncAt: new Date(),
            lastTransactionId: latestTxn ? String(latestTxn.transactionID) : cfg.lastTransactionId,
          },
        });

        results[cfg.bankCode] = {
          synced,
          latestTxn: latestTxn ? String(latestTxn.transactionID) : undefined,
        };
        totalSynced += synced;
      } catch (err: any) {
        results[cfg.bankCode] = { synced: 0, error: err?.message || "Lỗi xử lý API ngân hàng" };
      }
    }

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AutoBank sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi đồng bộ auto-bank" },
      { status: 500 }
    );
  }
}

// Allow GET for easy cron / browser testing
export async function GET() {
  return POST();
}
