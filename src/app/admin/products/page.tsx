"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import { Check, X, RefreshCw, Eye } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/admin?action=products&status=${filter}` : "/api/admin?action=products";
      const res = await fetch(url);
      const d = await res.json();
      setProducts(d.products || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_product", id }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "ACTIVE" } : p))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Nhập lý do từ chối sản phẩm:", "Không đúng quy định đăng bài");
    if (reason === null) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_product", id, data: { reason } }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "REJECTED" } : p))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quản lý Sản phẩm"
        subtitle="Duyệt sản phẩm đăng bán, theo dõi tài liệu học tập và vật phẩm sinh viên Phenikaa"
        actions={
          <Button variant="outline" size="sm" onClick={loadProducts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
          {[
            { label: "Tất cả", value: "" },
            { label: "Chờ duyệt", value: "PENDING" },
            { label: "Đang hiển thị", value: "ACTIVE" },
            { label: "Bị từ chối", value: "REJECTED" },
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
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Người bán</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <ProductRows
                  loading={loading}
                  products={products}
                  actionLoading={actionLoading}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductRows({ loading, products, actionLoading, handleApprove, handleReject }: any) {
  if (loading) {
    return (
      <tr>
        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
          Đang tải danh sách sản phẩm...
        </td>
      </tr>
    );
  }
  if (products.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
          Không tìm thấy sản phẩm nào
        </td>
      </tr>
    );
  }
  return products.map((p: any) => (
    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
            <Image src={p.thumbnail || "/placeholder.jpg"} alt={p.title} fill className="object-cover" />
          </div>
          <div className="min-w-0 max-w-xs">
            <p className="font-semibold text-foreground truncate">{p.title}</p>
            <p className="text-xs text-muted-foreground truncate">{p.category?.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs">
        <span className="px-2 py-0.5 rounded bg-muted font-medium">
          {p.type === "DOCUMENT" ? "📄 Tài liệu" : "📦 Vật phẩm"}
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground text-xs sm:text-sm">{formatVND(p.price)}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{p.seller?.name || "Ẩn danh"}</td>
      <td className="px-4 py-3 text-xs">
        <StatusBadge status={p.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/product/${p.slug}`}
            target="_blank"
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {p.status === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="gradient"
                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleApprove(p.id)}
                isLoading={actionLoading === p.id}
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Duyệt
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 border-red-500/50 text-red-600 hover:bg-red-50"
                onClick={() => handleReject(p.id)}
                disabled={actionLoading === p.id}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  ));
}
