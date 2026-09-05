import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * AutoBank Sync API
 * POST /api/autobank/sync  – Admin-triggered manual sync
 * GET  /api/autobank/sync  – Can be called by cron / external scheduler
 *
 * Supports: ACB, MBBANK via modtool.fun history APIs
 */

interface BankTransaction {
  transactionID: string | number;
  amount: string | number;
  description: string;
  transactionDate: string;
  type: "IN" | "OUT";
}

interface BankApiResponse {
  status: string;
  message: string;
  transactions: BankTransaction[];
}

async function fetchBankHistory(baseUrl: string, token: string): Promise<BankTransaction[]> {
  const url = `${baseUrl.replace(/\/+$/, "")}/${token}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Bank API returned ${res.status}`);
  const data: BankApiResponse = await res.json();
  if (data.status !== "success") throw new Error(data.message || "Bank API error");
  return data.transactions || [];
}

function parseAmount(val: string | number): number {
  if (typeof val === "number") return Math.abs(val);
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export async function POST() {
  try {
    const configs = await prisma.autoBankConfig.findMany({ where: { isActive: true } });
    if (configs.length === 0) {
      return NextResponse.json({ synced: 0, message: "Không có cấu hình auto-bank nào đang bật" });
    }

    let totalSynced = 0;
    const results: Record<string, { synced: number; error?: string }> = {};

    for (const cfg of configs) {
      try {
        const txns = await fetchBankHistory(cfg.apiBaseUrl, cfg.apiToken);
        let synced = 0;

        for (const t of txns) {
          const refId = `${cfg.bankCode}_${t.transactionID}`;
          const existing = await prisma.transaction.findFirst({ where: { referenceId: refId } });
          if (existing) continue;

          const amount = parseAmount(t.amount);
          if (amount <= 0) continue;

          const desc = t.description || "";
          const isIn = t.type === "IN";

          // Try to find a user whose bankAccount matches this config (seller receiving money)
          const targetUser = await prisma.user.findFirst({
            where: { bankAccount: cfg.accountNumber },
            select: { id: true, walletBalance: true },
          });

          if (isIn && targetUser) {
            await prisma.$transaction(async (tx) => {
              const fresh = await tx.user.findUniqueOrThrow({ where: { id: targetUser.id }, select: { walletBalance: true } });
              await tx.user.update({ where: { id: targetUser.id }, data: { walletBalance: { increment: amount } } });
              await tx.transaction.create({
                data: {
                  userId: targetUser.id,
                  type: "AUTOBANK_IN",
                  amount,
                  balanceAfter: fresh.walletBalance + amount,
                  paymentMethod: "BANK_TRANSFER",
                  referenceId: refId,
                  description: `[${cfg.bankCode}] ${desc}`,
                  status: "SUCCESS",
                },
              });
            });
          } else {
            // System-level fallback: credit/debit first admin account
            const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true, walletBalance: true } });
            if (admin) {
              await prisma.$transaction(async (tx) => {
                const fresh = await tx.user.findUniqueOrThrow({ where: { id: admin.id }, select: { walletBalance: true } });
                const delta = isIn ? amount : -amount;
                await tx.user.update({ where: { id: admin.id }, data: { walletBalance: { increment: delta } } });
                await tx.transaction.create({
                  data: {
                    userId: admin.id,
                    type: isIn ? "AUTOBANK_IN" : "AUTOBANK_OUT",
                    amount: delta,
                    balanceAfter: fresh.walletBalance + delta,
                    paymentMethod: "BANK_TRANSFER",
                    referenceId: refId,
                    description: `[${cfg.bankCode}] ${desc}`,
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

        results[cfg.bankCode] = { synced };
        totalSynced += synced;
      } catch (err: any) {
        results[cfg.bankCode] = { synced: 0, error: err?.message || "Unknown error" };
      }
    }

    return NextResponse.json({ synced: totalSynced, results });
  } catch (error: any) {
    console.error("AutoBank sync error:", error);
    return NextResponse.json({ error: error?.message || "Lỗi đồng bộ auto-bank" }, { status: 500 });
  }
}

// Allow GET for easy cron / browser testing
export async function GET() {
  return POST();
}
