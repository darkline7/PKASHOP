"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=reports");
      const d = await res.json();
      setReports(d.reports || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (id: string, status: "RESOLVED" | "REJECTED") => {
    const resolution = prompt(
      status === "RESOLVED" ? "Ghi chú giải quyết khiếu nại:" : "Lý do bác bỏ khiếu nại:",
      status === "RESOLVED" ? "Đã xử lý và nhắc nhở người dùng" : "Không có dấu hiệu vi phạm"
    );
    if (resolution === null) return;

    setResolving(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_report", id, data: { status, resolution } }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, resolution } : r))
        );
      }
    } finally {
      setResolving(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Khiếu nại & Báo cáo"
        subtitle="Tiếp nhận và xử lý các phản ánh vi phạm, tranh chấp giữa sinh viên Phenikaa"
        actions={
          <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Người báo cáo</th>
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Nội dung chi tiết</th>
                <th className="px-4 py-3">Sản phẩm liên quan</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Đang tải danh sách khiếu nại...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Không có khiếu nại nào 🎉
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold text-foreground">{r.reporter?.name}</p>
                      <p className="text-muted-foreground text-[11px]">{r.reporter?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{r.reason}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {r.description}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.product ? (
                        <span className="font-medium text-indigo-600">{r.product.title}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : r.status === "REJECTED"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="gradient"
                            className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() => handleResolve(r.id, "RESOLVED")}
                            isLoading={resolving === r.id}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Giải quyết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 border-red-500/50 text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => handleResolve(r.id, "REJECTED")}
                            disabled={resolving === r.id}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Bác bỏ
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
