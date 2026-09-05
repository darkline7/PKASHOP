"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import { RefreshCw, CheckCircle, XCircle, Landmark, Copy, Check } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/admin?action=withdrawals&status=${filter}` : "/api/admin?action=withdrawals";
      const res = await fetch(url);
      const d = await res.json();
      setWithdrawals(d.withdrawals || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const handleApprove = async (id: string, amount: number) => {
    if (!confirm(`Xác nhận bạn đã chuyển khoản ${Math.abs(amount).toLocaleString("vi-VN")}đ cho sinh viên?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_withdrawal", id }),
      });
      if (res.ok) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "SUCCESS" } : w))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Lý do từ chối rút tiền (tiền sẽ hoàn lại vào ví của SV):", "Sai thông tin STK hoặc tên chủ tài khoản");
    if (reason === null) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_withdrawal", id, data: { reason } }),
      });
      if (res.ok) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "FAILED" } : w))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const copyAccount = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <AdminPageHeader
        title="Quản lý Rút tiền"
        subtitle="Duyệt chuyển khoản tiền bán tài liệu cho sinh viên và đối soát số tài khoản ngân hàng"
        actions={
          <Button variant="outline" size="sm" onClick={loadWithdrawals} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
          {[
            { label: "Chờ chuyển khoản", value: "PENDING" },
            { label: "Đã chuyển tiền", value: "SUCCESS" },
            { label: "Bị từ chối / Thất bại", value: "FAILED" },
            { label: "Tất cả", value: "" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Người rút tiền</th>
                  <th className="px-4 py-3">Số tiền yêu cầu</th>
                  <th className="px-4 py-3">Thông tin tài khoản nhận</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Đang tải danh sách rút tiền...
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">
                      Không có yêu cầu rút tiền nào trong mục này
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-foreground">{w.user?.name || "Sinh viên"}</p>
                        <p className="text-muted-foreground text-[11px]">{w.user?.email}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">
                          Số dư ví hiện tại: {formatVND(w.user?.walletBalance || 0)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-red-600 text-sm sm:text-base">
                          {formatVND(Math.abs(w.amount))}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Phí: 0đ</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {w.user?.bankAccount ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{w.user?.bankName || "Ngân hàng"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                                {w.user?.bankAccount}
                              </span>
                              <button
                                onClick={() => copyAccount(w.user.bankAccount, w.id)}
                                className="p-1 text-muted-foreground hover:text-foreground"
                                title="Copy số tài khoản"
                              >
                                {copiedId === w.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground uppercase font-medium">
                              {w.user?.bankAccountName || w.user?.name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600">Chưa lưu STK trong hồ sơ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatRelativeTime(w.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <StatusBadge status={w.status} kind="transaction" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {w.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="gradient"
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              onClick={() => handleApprove(w.id, w.amount)}
                              isLoading={actionLoading === w.id}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Đã chuyển khoản
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 border-red-500/50 text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleReject(w.id)}
                              disabled={actionLoading === w.id}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {w.status === "SUCCESS" ? "Đã thanh toán" : "Đã hoàn ví"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
