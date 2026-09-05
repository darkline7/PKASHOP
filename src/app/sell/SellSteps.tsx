"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Step2PartA } from "./Step2PartA";
import { Step2UploadsSection } from "./Step2UploadsSection";

export function Step2({ form, setForm, set, cats, setStep, handleRawQuizChange }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6 space-y-5">
        <Step2PartA form={form} set={set} cats={cats} setForm={setForm} />
        <Step2UploadsSection form={form} setForm={setForm} set={set} handleRawQuizChange={handleRawQuizChange} />
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Chọn lại hình thức
        </Button>
        <Button variant="gradient" onClick={() => setStep(3)} className="gap-1.5 px-6">
          Xem trước <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function Step3({ form, setStep, handleSubmit, loading }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground pb-2 border-b border-border/60">
          Kiểm tra thông tin trước khi gửi duyệt
        </h2>

        {form.thumbnail && (
          <div className="relative aspect-video w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-border bg-muted">
            <img src={form.thumbnail} alt={form.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Tên sản phẩm</p>
            <p className="font-semibold text-foreground">{form.title || "—"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Giá bán</p>
            <p className="font-bold text-primary-600 text-base">
              {Number(form.price) === 0 && form.type === "PHYSICAL"
                ? "Miễn phí (0đ)"
                : form.price
                ? Number(form.price).toLocaleString("vi-VN") + " VNĐ"
                : "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Hình thức</p>
            <p className="font-semibold text-foreground">
              {form.type === "QUIZ"
                ? `🧠 Quiz trắc nghiệm (${form.quizQuestions?.length || 0} câu - hạn 7 ngày)`
                : form.type === "DOCUMENT"
                ? "📄 Tài liệu số (Tự động cấp file)"
                : "🎁 Pass đồ sinh viên (7 ngày tự xoá)"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Địa chỉ & SĐT</p>
            <p className="font-semibold text-foreground">
              {form.address || "Tại Phenikaa"} {form.phone ? `(${form.phone})` : ""}
            </p>
          </div>
        </div>

        {form.proofImages && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              ✓ Đã đính kèm ảnh minh chứng uy tín
            </p>
            <img src={form.proofImages} alt="Proof" className="max-h-40 rounded-lg border object-cover" />
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/40 space-y-1 text-sm">
          <p className="text-xs text-muted-foreground font-medium">Mô tả sản phẩm</p>
          <p className="text-foreground whitespace-pre-wrap text-xs sm:text-sm">{form.description || "—"}</p>
        </div>
      </Card>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200">
        🛡️ Bắt buộc qua kiểm duyệt: Bài đăng sẽ được gửi tới Ban Quản Trị duyệt kỹ lưỡng để tránh tài liệu lởm, quiz bậy bạ hoặc gian lận trước khi hiển thị công khai.
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Quay lại chỉnh sửa
        </Button>
        <Button variant="gradient" onClick={handleSubmit} isLoading={loading} className="gap-1.5 px-8">
          Gửi duyệt bài đăng
        </Button>
      </div>
    </div>
  );
}

export function Step4({ router }: any) {
  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
        ✓
      </div>
      <h2 className="text-2xl font-bold mb-2 text-foreground">Đã gửi duyệt thành công!</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Sản phẩm đã được tiếp nhận và đang chờ BQT kiểm duyệt nội dung. Sau khi được duyệt, bài viết sẽ chính thức xuất hiện trên website!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="gradient" onClick={() => window.location.reload()}>
          Đăng bài khác
        </Button>
        <Button variant="outline" onClick={() => router.push("/seller")}>
          Seller Dashboard
        </Button>
      </div>
    </div>
  );
}
