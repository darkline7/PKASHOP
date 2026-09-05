"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import { RefreshCw, ArrowLeftRight } from "lucide-react";

export default function AdminTransactionsPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  const loadTxns = async () => {
    setLoading(true);
    try {
      const url = filterType
        ? `/api/admin?action=transactions&type=${filterType}`
        : "/api/admin?action=transactions";
      const res = await fetch(url);
      const d = await res.json();
      setTxns(d.transactions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTxns();
  }, [filterType]);

  return (
    <>
      <AdminPageHeader
        title="Lịch sử Giao dịch"
        subtitle="Theo dõi biến động số dư, nạp tiền tự động, thanh toán đơn hàng và tiền rút của sinh viên"
        actions={
          <Button variant="outline" size="sm" onClick={loadTxns} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
          {[
            { label: "Tất cả", value: "" },
            { label: "Nạp tiền", value: "DEPOSIT" },
            { label: "Rút tiền", value: "WITHDRAW" },
            { label: "Thanh toán", value: "PAYMENT" },
            { label: "Nhận tiền bán", value: "RECEIVE_MONEY" },
            { label: "Hoàn tiền", value: "REFUND" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === tab.value
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
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Loại giao dịch</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Số dư sau</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Đang tải danh sách giao dịch...
                    </td>
                  </tr>
                ) : txns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Không có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  txns.map((t: any) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-foreground">{t.user?.name || "Người dùng"}</p>
                        <p className="text-muted-foreground text-[11px]">{t.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs sm:text-sm">
                        <span className={t.amount > 0 ? "text-emerald-600" : "text-red-600"}>
                          {t.amount > 0 ? "+" : ""}
                          {formatVND(t.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatVND(t.balanceAfter)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground text-right">
                        {formatRelativeTime(t.createdAt)}
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