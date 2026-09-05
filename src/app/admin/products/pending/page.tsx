"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import { Check, X, RefreshCw, Eye } from "lucide-react";

export default function AdminPendingProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=products&status=PENDING");
      const d = await res.json();
      setProducts(d.products || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_product", id }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Lý do từ chối:", "Vi phạm quy định / thông tin không hợp lệ");
    if (reason === null) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_product", id, data: { reason } }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Sản phẩm & Tài liệu Chờ duyệt"
        subtitle="Kiểm tra chất lượng tài liệu học tập và đồ dùng sinh viên trước khi đăng tải chính thức"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadPending} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
            </Button>
            <Link href="/admin/products">
              <Button variant="secondary" size="sm">Tất cả sản phẩm</Button>
            </Link>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Người bán</th>
                <th className="px-4 py-3">Ngày gửi</th>
                <th className="px-4 py-3 text-right">Kiểm duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Đang tải danh sách chờ duyệt...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 mb-3">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Đã duyệt hết sản phẩm!</p>
                    <p className="text-xs text-muted-foreground mt-1">Không có sản phẩm nào đang chờ kiểm duyệt.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                          <Image src={p.thumbnail || "/placeholder.jpg"} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <p className="font-semibold text-foreground truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-muted font-medium">
                        {p.type === "QUIZ" ? "🧠 Quiz" : p.type === "DOCUMENT" ? "📄 Tài liệu" : "🎁 Đồ dùng"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground text-xs sm:text-sm">
                      {formatVND(p.price)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-foreground">{p.seller?.name || "Ẩn danh"}</p>
                      <p className="text-muted-foreground text-[11px]">{p.seller?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeTime(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                          title="Xem trước bài đăng"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Button
                          size="sm"
                          variant="gradient"
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          onClick={() => handleApprove(p.id)}
                          isLoading={actionLoading === p.id}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 border-red-500/50 text-red-600 hover:bg-red-50 text-xs"
                          onClick={() => handleReject(p.id)}
                          disabled={actionLoading === p.id}
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Từ chối
                        </Button>
                      </div>
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
