import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Badge số liệu cho sidebar admin (đếm nhanh, không filter phức tạp). */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const [pendingProducts, pendingWithdrawals, openReports] = await Promise.all([
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.transaction.count({ where: { type: "WITHDRAW", status: "PENDING" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({ pendingProducts, pendingWithdrawals, openReports });
}
