"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import { Check, X, RefreshCw, Eye, Edit2, Trash2, EyeOff } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";

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

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", originalPrice: "", description: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleToggleHide = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hide_product", id }),
      });
      if (res.ok) {
        const d = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: d.status } : p))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá vĩnh viễn bài đăng này?")) return;
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", id }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setEditForm({
      title: p.title,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      description: p.description || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_product",
          id: editingProduct.id,
          data: {
            title: editForm.title,
            price: editForm.price,
            originalPrice: editForm.originalPrice,
            description: editForm.description,
          },
        }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  title: editForm.title,
                  price: Number(editForm.price),
                  originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : null,
                  description: editForm.description,
                }
              : p
          )
        );
        setEditingProduct(null);
      }
    } finally {
      setSavingEdit(false);
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
                  handleToggleHide={handleToggleHide}
                  handleDelete={handleDelete}
                  openEdit={openEdit}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">✏️ Sửa thông tin sản phẩm</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <Input
                label="Tiêu đề sản phẩm *"
                value={editForm.title}
                onChange={(e: any) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Giá bán (VNĐ) *"
                  type="number"
                  value={editForm.price}
                  onChange={(e: any) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
                <Input
                  label="Giá gốc (VNĐ)"
                  type="number"
                  value={editForm.originalPrice}
                  onChange={(e: any) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                />
              </div>
              <Textarea
                label="Mô tả chi tiết"
                rows={4}
                value={editForm.description}
                onChange={(e: any) => setEditForm({ ...editForm, description: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                  Hủy
                </Button>
                <Button type="submit" variant="gradient" isLoading={savingEdit}>
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

function ProductRows({
  loading,
  products,
  actionLoading,
  handleApprove,
  handleReject,
  handleToggleHide,
  handleDelete,
  openEdit,
}: any) {
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
          {p.type === "QUIZ" ? "🧠 Quiz" : p.type === "DOCUMENT" ? "📄 Tài liệu" : "🎁 Đồ sinh viên"}
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
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => openEdit(p)}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary-600"
            title="Chỉnh sửa bài đăng"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleToggleHide(p.id)}
            className={`p-1.5 rounded-lg border border-border hover:bg-muted ${
              p.status === "HIDDEN" ? "text-emerald-600" : "text-amber-600"
            }`}
            title={p.status === "HIDDEN" ? "Hiện lại bài đăng" : "Ẩn bài đăng"}
            disabled={actionLoading === p.id}
          >
            <EyeOff className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleDelete(p.id)}
            className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-red-600"
            title="Xóa vĩnh viễn"
            disabled={actionLoading === p.id}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {p.status === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="gradient"
                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleApprove(p.id)}
                isLoading={actionLoading === p.id}
                title="Duyệt sản phẩm"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Duyệt
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 border-red-500/50 text-red-600 hover:bg-red-50"
                onClick={() => handleReject(p.id)}
                disabled={actionLoading === p.id}
                title="Từ chối sản phẩm"
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
