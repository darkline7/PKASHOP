"use client";
import React, { useRef, useState } from "react";
import { Button, Textarea, Input } from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import { MapPin, UploadCloud, FileText, HelpCircle, ShieldCheck } from "lucide-react";

export function Step2UploadsSection({ form, setForm, set, handleRawQuizChange }: any) {
  const [docUploading, setDocUploading] = useState(false);
  const docFileRef = useRef<HTMLInputElement>(null);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi tải file");
      setForm((p: any) => ({
        ...p,
        documentUrl: data.url,
        fileFormat: file.name.split(".").pop()?.toUpperCase() || "PDF",
      }));
    } catch (err: any) {
      alert(err?.message || "Lỗi tải file");
    } finally {
      setDocUploading(false);
    }
  };

  const handleTxtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    handleRawQuizChange(text);
  };

  return (
    <>
      {form.type === "QUIZ" && (
        <div className="pt-3 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-600" /> Nhập câu hỏi Quiz (.txt)
            </h3>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold">
              Chọn file .txt
              <input type="file" accept=".txt" className="hidden" onChange={handleTxtUpload} />
            </label>
          </div>
          <Textarea
            rows={4}
            placeholder="câu hỏi | đáp án 1 | đáp án 2 | đáp án 3 | đáp án 4 | đáp án đúng (1-4)"
            value={form.rawQuizText}
            onChange={(e: any) => handleRawQuizChange(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
      )}

      {form.type === "DOCUMENT" && (
        <div className="pt-3 border-t border-border/60 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" /> Tải lên tài liệu gốc (nhận ngay sau khi mua) *
          </h3>
          <div className="flex items-center gap-3">
            <input ref={docFileRef} type="file" accept=".pdf,.docx,.pptx,.zip" className="hidden" onChange={handleDocUpload} />
            <Button type="button" variant="outline" onClick={() => docFileRef.current?.click()} isLoading={docUploading}>
              <UploadCloud className="w-4 h-4 mr-1" /> Chọn file tài liệu
            </Button>
            {form.documentUrl && <span className="text-xs text-emerald-600">✓ Đã tải file</span>}
          </div>
          <ImageUpload
            label="Ảnh minh chứng tài liệu thật (Bảng điểm / Slide trường)"
            placeholder="Tải ảnh minh chứng uy tín"
            value={form.proofImages}
            onChange={(url) => setForm((p: any) => ({ ...p, proofImages: url }))}
          />
        </div>
      )}

      <div className="pt-2 border-t border-border/60">
        <ImageUpload
          label="Ảnh đại diện bài đăng *"
          placeholder="Tải ảnh bìa tài liệu hoặc ảnh chụp đồ thật"
          value={form.thumbnail}
          onChange={(url) => setForm((p: any) => ({ ...p, thumbnail: url }))}
        />
      </div>

      <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-3">
        <Input label="Địa chỉ" placeholder="VD: KTX Tòa A Phenikaa" value={form.address} onChange={set("address")} />
        <Input label="Số điện thoại" placeholder="VD: 0987654321" type="tel" value={form.phone} onChange={set("phone")} />
      </div>
    </>
  );
}
