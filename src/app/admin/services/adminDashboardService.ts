import type { AdminMeta, DashboardData, DashboardPeriod } from "../types";

/**
 * Service client-side cho khu vực admin.
 * Tách fetch API ra khỏi component để dễ tái sử dụng & test.
 */

const BASE = "/api/admin";

export interface DashboardQuery {
  period: DashboardPeriod;
  from?: string;
  to?: string;
}

export async function fetchDashboard(query: DashboardQuery): Promise<DashboardData> {
  const params = new URLSearchParams({ period: query.period });
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);

  const res = await fetch(`${BASE}/dashboard?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Không thể tải dữ liệu tổng quan");
  }
  return res.json();
}

export async function fetchAdminMeta(): Promise<AdminMeta | null> {
  try {
    const res = await fetch(`${BASE}/meta?${new URLSearchParams({ t: String(Date.now()) })}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
