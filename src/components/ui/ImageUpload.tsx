"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Link as LinkIcon, ExternalLink } from "lucide-react";

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
  placeholder = "Chọn ảnh từ thiết bị hoặc dán link URL",
  className = "",
  aspectRatio = "video",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");
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
    setUrlInput("");
  };

  const handleApplyUrl = () => {
    const clean = urlInput.trim();
    if (!clean) return;
    if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("/")) {
      setError("Link ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    setError(null);
    onChange(clean);
    setShowUrl(false);
  };

  const ratioClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "banner"
      ? "aspect-[21/9]"
      : "aspect-[16/9]";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium block text-foreground">{label}</label>}
        <button
          type="button"
          onClick={() => {
            setShowUrl(!showUrl);
            if (!showUrl) setUrlInput(value || "");
          }}
          className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrl ? "Đóng nhập URL" : "Dán link ảnh (URL)"}
        </button>
      </div>

      {showUrl && (
        <div className="p-2.5 rounded-xl border border-primary-500/30 bg-primary-500/5 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Dán link ảnh: https://i.imgur.com/xyz.jpg"
              className="flex-1 h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="h-8 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm"
            >
              Lấy ảnh
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex-wrap gap-1">
            <span>Chưa có link? Tải ảnh lên trang này để lấy link:</span>
            <div className="flex items-center gap-2 font-medium">
              <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline flex items-center gap-0.5">
                Postimages <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline flex items-center gap-0.5">
                Imgur <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a href="https://imgbb.com/" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline flex items-center gap-0.5">
                ImgBB <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

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
            unoptimized={value.startsWith("http://") || value.startsWith("https://")}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold hover:bg-white shadow"
            >
              Chọn từ máy
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrl(true);
                setUrlInput(value);
              }}
              className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 shadow flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Sửa URL
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
              <p className="text-[11px] text-muted-foreground">
                Tải ảnh từ máy hoặc bấm <strong>"Dán link ảnh (URL)"</strong> ở trên
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
