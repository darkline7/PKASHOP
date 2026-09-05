"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import { RefreshCw, History, Shield, AlertCircle } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=audit_logs");
      const d = await res.json();
      setLogs(d.logs || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Nhật ký Hoạt động (Audit Logs)"
        subtitle="Theo dõi toàn bộ lịch sử thao tác của các Quản trị viên trên hệ thống Phenikaa Shop"
        actions={
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Quản trị viên</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Lý do / Chi tiết</th>
                <th className="px-4 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 mb-3">
                      <History className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Chưa có bản ghi hoạt động nào</p>
                    <p className="text-xs text-muted-foreground mt-1">Các thao tác duyệt bài, cấu hình, xử lý khiếu nại sẽ được ghi nhận tại đây.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">{log.admin?.name || "Hệ thống"}</p>
                          <p className="text-muted-foreground text-[11px]">{log.admin?.email || "system@phenikaa.edu.vn"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-foreground">{log.entityType}</p>
                      {log.entityId && (
                        <p className="font-mono text-[11px] text-muted-foreground truncate max-w-xs">{log.entityId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-sm">
                      <p className="truncate">{log.reason || log.newValue || log.oldValue || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground text-right">
                      {formatRelativeTime(log.createdAt)}
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
