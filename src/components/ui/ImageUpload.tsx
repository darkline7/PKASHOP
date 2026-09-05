"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "banner";
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "Chọn ảnh từ thiết bị hoặc kéo thả vào đây",
  className = "",
  aspectRatio = "video",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chỉ chọn file định dạng hình ảnh (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa là 15MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tải ảnh lên thất bại");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err?.message || "Lỗi tải ảnh lên");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const ratioClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "banner"
      ? "aspect-[21/9]"
      : "aspect-[16/9]";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="text-sm font-medium block text-foreground">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className={`relative ${ratioClass} w-full rounded-xl overflow-hidden border border-border bg-muted/40 group`}>
          <Image
            src={value}
            alt="Preview ảnh"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold hover:bg-white shadow"
            >
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow"
              title="Xoá ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative ${ratioClass} w-full rounded-xl border-2 border-dashed border-border hover:border-primary-500 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all flex flex-col items-center justify-center p-4 text-center`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium">Đang tải ảnh lên...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-foreground">{placeholder}</p>
              <p className="text-[11px] text-muted-foreground">Hỗ trợ JPG, PNG, WEBP tối đa 15MB</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
