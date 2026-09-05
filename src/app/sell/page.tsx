"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import ImageUpload from "@/components/ui/ImageUpload";
import { useAuthStore } from "@/stores";
import type { Category } from "@/types";
import { MapPin, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function SellPage() {
  const router = useRouter();
  const { user, isLoading, isInitialized, fetchUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "DOCUMENT",
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    condition: "NEW",
    thumbnail: "",
    images: "",
    fileFormat: "PDF",
    faculty: "",
    courseCode: "",
    semester: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.push("/login?returnTo=/sell");
    }
  }, [user, isLoading, isInitialized, router]);

  useEffect(() => {
    if (user?.phone && !form.phone) {
      setForm((prev) => ({ ...prev, phone: user.phone || "" }));
    }
  }, [user]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCats(d.categories || []));
  }, []);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.categoryId) {
      alert("Vui lòng điền đầy đủ tiêu đề, danh mục và giá bán.");
      return;
    }
    if (!form.thumbnail) {
      alert("Vui lòng tải lên ảnh đại diện cho sản phẩm.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        images: form.images ? form.images.split(",").map((s: string) => s.trim()) : [],
      }),
    });
    if (res.ok) {
      setStep(4);
    } else {
      const d = await res.json();
      alert(d.error || "Có lỗi xảy ra khi tạo sản phẩm");
    }
    setLoading(false);
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-sm font-medium">Đang tải thông tin đăng bán...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">📤 Đăng bán sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chia sẻ tài liệu học tập, giáo trình hoặc pass lại đồ dùng học tập cho sinh viên Phenikaa.
          </p>
        </div>

        <Steps step={step} />

        {step === 1 && <Step1 form={form} setForm={setForm} setStep={setStep} />}
        {step === 2 && <Step2 form={form} setForm={setForm} set={set} cats={cats} setStep={setStep} />}
        {step === 3 && <Step3 form={form} setStep={setStep} handleSubmit={handleSubmit} loading={loading} />}
        {step === 4 && <Step4 router={router} />}
      </main>
      <Footer />
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const steps = [
    { num: 1, label: "Loại hàng" },
    { num: 2, label: "Chi tiết & Hình ảnh" },
    { num: 3, label: "Xem trước" },
    { num: 4, label: "Hoàn tất" },
  ];

  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-8 relative">
      <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-muted -z-0" />
      {steps.map((s) => {
        const isDone = step > s.num;
        const isCurrent = step === s.num;
        return (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isDone
                  ? "bg-emerald-600 text-white shadow-sm"
                  : isCurrent
                  ? "bg-primary-600 text-white ring-4 ring-primary-500/20 shadow-sm"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {isDone ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-[11px] font-medium transition-colors hidden sm:block ${
                isCurrent ? "text-primary-600 font-bold" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Step1({ form, setForm, setStep }: any) {
  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="text-lg font-bold text-foreground">Chọn hình thức đăng bán</h2>
        <p className="text-xs text-muted-foreground">Bạn muốn chia sẻ tài liệu số hay thanh lý đồ dùng học tập thực tế?</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        {[
          {
            v: "DOCUMENT",
            badge: "Tài liệu số",
            l: "📄 Tài liệu số & Đề thi",
            d: "Đề thi, bài tập lớn, slide bài giảng, giáo trình PDF, DOCX, PPTX...",
            action: "Đăng tài liệu số",
          },
          {
            v: "PHYSICAL",
            badge: "Vật phẩm thực",
            l: "📦 Pass đồ dùng & Sách",
            d: "Máy tính Casio, giáo trình giấy, laptop, chuột máy tính, đồng phục...",
            action: "Đăng pass đồ dùng",
          },
        ].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => {
              setForm({ ...form, type: t.v });
              setStep(2);
            }}
            className={`p-6 rounded-2xl border-2 text-left transition-all hover:border-primary-500 hover:shadow-md flex flex-col justify-between ${
              form.type === t.v ? "border-primary-500 bg-primary-500/5 shadow-sm" : "border-border bg-card"
            }`}
          >
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-muted text-muted-foreground mb-3">
                {t.badge}
              </span>
              <p className="font-bold text-lg text-foreground mb-1.5">{t.l}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.d}</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary-600">
              {t.action} <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({ form, setForm, set, cats, setStep }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-foreground mb-1">Thông tin cơ bản</h2>
          <p className="text-xs text-muted-foreground">Điền thông tin chi tiết giúp sản phẩm dễ tiếp cận người mua hơn</p>
        </div>

        <Input
          label="Tên sản phẩm / Tiêu đề tài liệu *"
          placeholder="VD: Tổng hợp đề thi Giải tích 1 Phenikaa có đáp án chi tiết"
          value={form.title}
          onChange={set("title")}
          required
        />

        <Textarea
          label="Mô tả chi tiết *"
          placeholder="Mô tả nội dung tài liệu, tình trạng sử dụng, thời gian học, lưu ý cho người mua..."
          rows={4}
          value={form.description}
          onChange={set("description")}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Giá bán (VNĐ) *"
            type="number"
            placeholder="VD: 30000"
            value={form.price}
            onChange={set("price")}
            required
          />
          <Input
            label="Giá gốc (nếu có giảm giá)"
            type="number"
            placeholder="VD: 50000"
            value={form.originalPrice}
            onChange={set("originalPrice")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5 text-foreground">Danh mục *</label>
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

          {form.type === "PHYSICAL" ? (
            <div>
              <label className="text-sm font-medium block mb-1.5 text-foreground">Tình trạng vật phẩm</label>
              <select
                value={form.condition}
                onChange={set("condition")}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[
                  ["NEW", "Mới 100% (Chưa qua sử dụng)"],
                  ["LIKE_NEW", "Như mới (95% - 99%)"],
                  ["GOOD", "Đã qua sử dụng tốt (80% - 90%)"],
                  ["FAIR", "Cũ / Đã dùng nhiều (dưới 80%)"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium block mb-1.5 text-foreground">Định dạng file tài liệu</label>
              <select
                value={form.fileFormat}
                onChange={set("fileFormat")}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {["PDF", "DOCX", "PPTX", "ZIP", "IMAGE", "KHAC"].map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Direct Image Upload Component */}
        <div className="pt-2 border-t border-border/60">
          <ImageUpload
            label="Ảnh đại diện (Thumbnail) *"
            placeholder="Tải ảnh bìa tài liệu hoặc ảnh chụp thực tế sản phẩm"
            value={form.thumbnail}
            onChange={(url) => setForm((prev: any) => ({ ...prev, thumbnail: url }))}
            aspectRatio="video"
          />
        </div>

        {/* Replaced school and city inputs with address and phone number */}
        <div className="pt-2 border-t border-border/60 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-primary-600" /> Địa chỉ giao nhận & Liên hệ
            </h3>
            <p className="text-xs text-muted-foreground">
              Thông tin giúp người mua tại Phenikaa liên hệ hoặc hẹn nhận trực tiếp thuận tiện
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Địa chỉ cụ thể"
              placeholder="VD: KTX Tòa A Phenikaa, hoặc Yên Nghĩa, Hà Đông"
              value={form.address}
              onChange={set("address")}
            />
            <Input
              label="Số điện thoại liên hệ"
              placeholder="VD: 0987654321"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
        </div>
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

function Step3({ form, setStep, handleSubmit, loading }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground pb-2 border-b border-border/60">
          Kiểm tra thông tin trước khi đăng
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
              {form.price ? Number(form.price).toLocaleString("vi-VN") + " VNĐ" : "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Loại sản phẩm</p>
            <p className="font-semibold text-foreground">
              {form.type === "DOCUMENT" ? "📄 Tài liệu số" : "📦 Vật phẩm thực tế"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Địa chỉ & SĐT</p>
            <p className="font-semibold text-foreground">
              {form.address || "Tại Phenikaa"} {form.phone ? `(${form.phone})` : ""}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 space-y-1 text-sm">
          <p className="text-xs text-muted-foreground font-medium">Mô tả sản phẩm</p>
          <p className="text-foreground whitespace-pre-wrap text-xs sm:text-sm">{form.description || "—"}</p>
        </div>
      </Card>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200">
        ℹ️ Sản phẩm sẽ được gửi lên hệ thống và chuyển sang trạng thái <strong>Chờ duyệt</strong> để đảm bảo nội dung tuân thủ chính sách sinh viên Phenikaa.
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Quay lại chỉnh sửa
        </Button>
        <Button variant="gradient" onClick={handleSubmit} isLoading={loading} className="gap-1.5 px-8">
          Xác nhận đăng bán
        </Button>
      </div>
    </div>
  );
}

function Step4({ router }: any) {
  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
        ✓
      </div>
      <h2 className="text-2xl font-bold mb-2 text-foreground">Đăng bán thành công!</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Sản phẩm của bạn đã được tiếp nhận và đang chờ Admin duyệt. Bạn có thể theo dõi tiến độ trong Seller Dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="gradient" onClick={() => window.location.reload()}>
          Đăng sản phẩm khác
        </Button>
        <Button variant="outline" onClick={() => router.push("/seller")}>
          Seller Dashboard
        </Button>
      </div>
    </div>
  );
}

