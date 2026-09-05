"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, DollarSign, Package, RefreshCw, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatVND } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState } from "@/components/admin/ErrorState";
import { LineAreaChart, DonutChart } from "@/components/admin/AdminCharts";
import type { LineSeries, DonutSlice } from "@/components/admin/AdminCharts";
import { fetchDashboard } from "../services/adminDashboardService";
import type { DashboardData, DashboardPeriod } from "../types";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "month", label: "Tháng này" },
];

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchDashboard({ period });
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Không thể tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <AdminPageHeader
        title="Tổng quan"
        subtitle={data ? `${data.range.start} → ${data.range.end}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                    period === p.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading} title="Làm mới">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={DollarSign}
              label="Doanh thu"
              value={data?.kpis.revenue.value != null ? formatVND(data.kpis.revenue.value) : "—"}
              deltaPct={data?.kpis.revenue.deltaPct}
              accent="indigo"
              loading={loading}
            />
            <StatCard
              icon={ShoppingCart}
              label="Đơn hàng"
              value={data?.kpis.orders.value != null ? data.kpis.orders.value.toLocaleString("vi-VN") : "—"}
              deltaPct={data?.kpis.orders.deltaPct}
              accent="emerald"
              loading={loading}
            />
            <StatCard
              icon={Users}
              label="Người dùng mới"
              value={data?.kpis.newUsers.value != null ? data.kpis.newUsers.value.toLocaleString("vi-VN") : "—"}
              deltaPct={data?.kpis.newUsers.deltaPct}
              accent="sky"
              loading={loading}
            />
            <StatCard
              icon={Package}
              label="Chờ xử lý"
              value={`${data?.kpis.pendingOrders ?? 0} đơn · ${data?.kpis.pendingProducts ?? 0} SP`}
              accent="amber"
              loading={loading}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Xu hướng doanh thu & đơn hàng</h3>
              {loading ? (
                <div className="h-[260px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ) : (
                <LineAreaChart
                  labels={(data?.chart ?? []).map((p) => p.label)}
                  series={[
                    { name: "Doanh thu", values: (data?.chart ?? []).map((p) => p.revenue), color: "#6366f1" },
                    { name: "Đơn hàng", values: (data?.chart ?? []).map((p) => p.orders), color: "#10b981" },
                  ] as LineSeries[]}
                  height={260}
                />
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Trạng thái đơn hàng</h3>
              {loading ? (
                <div className="h-[260px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ) : (
                <DonutChart
                  data={
                    (data?.orderStatusBreakdown ?? []).map((s, i) => ({
                      label: s.status,
                      value: s.count,
                      color: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 6],
                    })) as DonutSlice[]
                  }
                />
              )}
            </div>
          </div>

          {/* Bottom row: recent orders + top products + pending tasks */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* Recent orders */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Đơn hàng gần đây</h3>
                <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Xem tất cả <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : !data?.recentOrders.length ? (
                <p className="px-4 py-8 text-center text-[13px] text-slate-400">Chưa có đơn hàng nào</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.recentOrders.slice(0, 5).map((o) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                          #{o.orderNumber} · {o.buyer.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {o.items.map((it) => it.title).join(", ") || "—"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{formatVND(o.total)}</p>
                        <StatusBadge status={o.status} kind="order" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right column: top products + pending tasks */}
            <div className="space-y-4">
              {/* Top products */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sản phẩm bán chạy</h3>
                </div>
                {loading ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : !data?.topProducts.length ? (
                  <p className="px-4 py-6 text-center text-[13px] text-slate-400">Chưa có dữ liệu</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.topProducts.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{p.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{p.soldCount} đã bán</p>
                        </div>
                        <span className="shrink-0 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                          {formatVND(p.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending tasks */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cần xử lý</h3>
                </div>
                {loading ? (
                  <div className="space-y-3 p-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : !data?.pendingTasks.length ? (
                  <p className="px-4 py-6 text-center text-[13px] text-slate-400">Không có tác vụ chờ xử lý 🎉</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.pendingTasks.map((t) => (
                      <Link
                        key={t.id}
                        href={t.href}
                        className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{t.label}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                          {t.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}