"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "📁", description: "", type: "ALL", order: "0" });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=categories");
      const d = await res.json();
      setCategories(d.categories || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openEdit = (cat?: any) => {
    if (cat) {
      setEditing(cat);
      setForm({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || "📁",
        description: cat.description || "",
        type: cat.type || "ALL",
        order: String(cat.order || 0),
      });
    } else {
      setEditing({});
      setForm({ name: "", slug: "", icon: "📁", description: "", type: "ALL", order: "0" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return alert("Vui lòng điền tên và slug danh mục");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_category",
          id: editing?.id,
          data: form,
        }),
      });
      if (res.ok) {
        setEditing(null);
        loadCategories();
      } else {
        const d = await res.json();
        alert(d.error || "Lỗi lưu danh mục");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xoá danh mục "${name}"?`)) return;

    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_category", id }),
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("Không thể xoá danh mục này");
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quản lý Danh mục"
        subtitle="Quản lý các nhóm tài liệu và sản phẩm hỗ trợ học tập tại Phenikaa"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadCategories} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
            </Button>
            <Button variant="gradient" size="sm" onClick={() => openEdit()}>
              <Plus className="w-4 h-4 mr-1.5" /> Thêm danh mục
            </Button>
          </div>
        }
      />

      {editing !== null && (
        <CategoryModal
          editing={editing}
          form={form}
          setForm={setForm}
          submitting={submitting}
          handleSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Số sản phẩm</th>
                <th className="px-4 py-3">Thứ tự</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <CategoryRows
                loading={loading}
                categories={categories}
                openEdit={openEdit}
                handleDelete={handleDelete}
              />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CategoryModal({ editing, form, setForm, submitting, handleSave, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          {editing?.id ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tên danh mục *"
              placeholder="VD: CNTT & Phần mềm"
              value={form.name}
              onChange={(e: any) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Slug URL *"
              placeholder="cntt-phan-mem"
              value={form.slug}
              onChange={(e: any) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Biểu tượng Emoji"
              placeholder="💻"
              value={form.icon}
              onChange={(e: any) => setForm({ ...form, icon: e.target.value })}
            />
            <Input
              label="Thứ tự hiển thị"
              type="number"
              value={form.order}
              onChange={(e: any) => setForm({ ...form, order: e.target.value })}
            />
          </div>
          <Textarea
            label="Mô tả danh mục"
            placeholder="Mô tả ngắn..."
            value={form.description}
            onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" variant="gradient" isLoading={submitting}>
              Lưu danh mục
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryRows({ loading, categories, openEdit, handleDelete }: any) {
  if (loading) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
          Đang tải danh mục...
        </td>
      </tr>
    );
  }
  if (categories.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
          Chưa có danh mục nào
        </td>
      </tr>
    );
  }
  return categories.map((c: any) => (
    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
            {c.icon || "📁"}
          </span>
          <div>
            <p className="font-semibold text-foreground">{c.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{c.description || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
      <td className="px-4 py-3 text-xs font-semibold text-foreground">{c._count?.products || 0}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{c.order}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEdit(c)}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(c.id, c.name)}
            className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-muted-foreground hover:text-red-600"
            title="Xoá"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  ));
}
