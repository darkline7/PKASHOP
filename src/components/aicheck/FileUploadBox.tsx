"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, X } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FileUploadBoxProps {
  onFileLoaded: (text: string, fileName: string) => void;
  currentFileName?: string | null;
  onClearFile?: () => void;
  disabled?: boolean;
}

export default function FileUploadBox({
  onFileLoaded,
  currentFileName,
  onClearFile,
  disabled = false,
}: FileUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; wordCount: number } | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["docx", "pdf", "txt", "md"].includes(ext)) {
      setError("Chỉ hỗ trợ file Word (.docx), PDF (.pdf) hoặc Text (.txt).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File quá lớn (tối đa 20MB).");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ai-check/file/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể đọc nội dung file.");

      setFileMeta({ name: file.name, size: file.size, wordCount: data.wordCount || 0 });
      onFileLoaded(data.text, file.name);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi trích xuất file.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFileMeta(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClearFile) onClearFile();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.txt,.md"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        className="hidden"
        disabled={disabled || uploading}
      />

      {fileMeta || currentFileName ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">{fileMeta?.name || currentFileName}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span>{fileMeta ? `${fileMeta.wordCount.toLocaleString("vi-VN")} từ` : "Đã nạp"}</span>
                {fileMeta?.size ? <span>• {formatFileSize(fileMeta.size)}</span> : null}
                <span className="text-emerald-600 font-medium inline-flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-2 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Đổi
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-rose-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!disabled && e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed p-3 text-center border-border hover:border-primary-500 bg-muted/20"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600">
              {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            </div>
            <p className="text-xs font-bold text-foreground">
              {uploading ? "Đang đọc file..." : "Tải file lên để kiểm tra / viết lại"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Hỗ trợ <span className="font-semibold text-foreground">.docx</span>, <span className="font-semibold text-foreground">.pdf</span>, <span className="font-semibold text-foreground">.txt</span> (Dưới 20MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 rounded-xl bg-rose-50 text-[11px] text-rose-700 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
