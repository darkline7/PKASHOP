"use client";
import React, { useState, useRef } from "react";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import ImageUpload from "@/components/ui/ImageUpload";
import { MapPin, ArrowLeft, ArrowRight, UploadCloud, FileText, HelpCircle, ShieldCheck } from "lucide-react";

export function Step2PartA({ form, set, cats, setForm }: any) {
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
          <label className="text-sm font-medium block mb-1.5 text-foreground">Danh mục môn / ngành *</label>
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
