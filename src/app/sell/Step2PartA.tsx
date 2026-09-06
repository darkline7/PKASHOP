"use client";
import React, { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Plus, X, FolderPlus } from "lucide-react";

export function Step2PartA({ form, set, cats, setForm, onCategoryCreated }: any) {
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          type: form.type === "PHYSICAL" ? "PHYSICAL" : "DOCUMENT",
          icon: form.type === "QUIZ" ? "🧠" : form.type === "PHYSICAL" ? "🎁" : "📚",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo danh mục");
      if (data.category) {
        if (onCategoryCreated) onCategoryCreated(data.category);
        setForm((prev: any) => ({ ...prev, categoryId: data.category.id }));
        setNewCatName("");
        setShowAddCat(false);
      }
    } catch (err: any) {
      alert(err?.message || "Lỗi tạo danh mục");
    } finally {
      setCreatingCat(false);
    }
  };
  return (
    <>
      <div>
        <h2 className="text-base font-bold text-foreground mb-1">Thông tin chi tiết</h2>
        <p className="text-xs text-muted-foreground">
          {form.type === "QUIZ"
            ? "Cung cấp câu hỏi trắc nghiệm và mức giá (Miễn phí 0đ, 15.000đ hoặc 20.000đ)"
            : form.type === "DOCUMENT"
            ? "Tải lên file tài liệu trực tiếp & ảnh minh chứng uy tín"
            : "Thông tin đồ pass sinh viên (hiển thị trong 7 ngày, sau đó tự ẩn)"}
        </p>
      </div>

      <Input
        label="Tiêu đề bài đăng *"
        placeholder={
          form.type === "QUIZ"
            ? "VD: Bộ 50 câu trắc nghiệm Triết học Mác - Lênin có đáp án"
            : form.type === "DOCUMENT"
            ? "VD: Slide + Đề thi Giải tích 1 Phenikaa full kì gần nhất"
            : "VD: Máy tính Casio fx 580 VNX còn mới nguyên tem"
        }
        value={form.title}
        onChange={set("title")}
        required
      />

      <Textarea
        label="Mô tả chi tiết *"
        placeholder="Mô tả cụ thể về kiến thức, tình trạng, độ chuẩn xác..."
        rows={3}
        value={form.description}
        onChange={set("description")}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-foreground">Danh mục môn / ngành *</label>
            <button
              type="button"
              onClick={() => setShowAddCat(!showAddCat)}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              {showAddCat ? (
                <>
                  <X className="w-3 h-3" /> Đóng tạo
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" /> + Thêm danh mục
                </>
              )}
            </button>
          </div>

          {showAddCat && (
            <div className="p-2.5 rounded-xl border border-primary-500/30 bg-primary-500/5 space-y-2 mb-2">
              <p className="text-[11px] text-muted-foreground font-medium">
                Tạo danh mục mới cho môn học hoặc đồ dùng của bạn:
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="VD: Triết học Mác - Lênin, Hóa đại cương..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory(e);
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="gradient"
                  onClick={handleCreateCategory}
                  isLoading={creatingCat}
                  className="h-9 px-3 text-xs shrink-0"
                >
                  <FolderPlus className="w-3.5 h-3.5 mr-1" /> Tạo
                </Button>
              </div>
            </div>
          )}

          <select
            value={form.categoryId}
            onChange={set("categoryId")}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {cats.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.icon || "📁"} {c.name}
              </option>
            ))}
          </select>
        </div>

        {form.type === "QUIZ" ? (
          <div>
            <label className="text-sm font-medium block mb-1.5 text-foreground">
              Giá làm Quiz *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 15000, 20000].map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setForm({ ...form, price: String(pr) })}
                  className={`h-10 rounded-lg font-bold text-xs sm:text-sm border-2 transition-all ${
                    Number(form.price) === pr
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                      : "border-border hover:border-primary-300"
                  }`}
                >
                  {pr === 0 ? "Miễn phí (0đ)" : `${pr.toLocaleString("vi-VN")}đ`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Hạn làm bài 7 ngày kể từ lúc mua. Có thể chọn miễn phí hoặc tính phí.
            </p>
          </div>
        ) : form.type === "DOCUMENT" ? (
          <div>
            <label className="text-sm font-medium block mb-1.5 text-foreground">Giá bán tài liệu (VNĐ) *</label>
            <Input
              type="number"
              placeholder="VD: 30000"
              value={form.price}
              onChange={set("price")}
              required
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Thanh toán qua số dư ví web. Hoa hồng hệ thống: 30%.
            </p>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium block mb-1.5 text-foreground">Giá pass đồ (VNĐ) *</label>
            <Input
              type="number"
              placeholder="VD: 50000 (Nhập 0 nếu cho tặng miễn phí)"
              value={form.price}
              onChange={set("price")}
              required
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Nhập giá muốn pass lại (hoặc nhập 0đ nếu tặng miễn phí). Tin đăng tự động ẩn sau 7 ngày.
            </p>
          </div>
        )}
      </div>

      {form.type === "PHYSICAL" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5 text-foreground">Tình trạng đồ</label>
            <select
              value={form.condition || "LIKE_NEW"}
              onChange={set("condition")}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="NEW">Mới 100% (Chưa dùng)</option>
              <option value="LIKE_NEW">Như mới (99%)</option>
              <option value="GOOD">Còn tốt (85% - 95%)</option>
              <option value="FAIR">Đã qua sử dụng (chấp nhận được)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5 text-foreground">Giá gốc khi mua mới (VNĐ, tuỳ chọn)</label>
            <Input
              type="number"
              placeholder="VD: 150000"
              value={form.originalPrice || ""}
              onChange={set("originalPrice")}
            />
          </div>
        </div>
      )}
    </>
  );
}
