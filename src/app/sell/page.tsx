"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";
import type { Category } from "@/types";

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "DOCUMENT", title: "", description: "", price: "", originalPrice: "", categoryId: "", condition: "NEW", thumbnail: "", images: "", fileFormat: "PDF", university: "", faculty: "", courseCode: "", semester: "", city: "" });

  useEffect(() => { if (!user) router.push("/login"); }, [user, router]);
  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => setCats(d.categories || [])); }, []);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.categoryId) { alert("Điền đầy đủ thông tin"); return; }
    setLoading(true);
    const thumb = form.thumbnail || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format";
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null, thumbnail: thumb, images: form.images ? form.images.split(",").map((s: string) => s.trim()) : [] }) });
    if (res.ok) setStep(4); else { const d = await res.json(); alert(d.error || "Lỗi"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">📤 Đăng bán</h1>
        <Steps step={step} />
        {step === 1 && <Step1 form={form} setForm={setForm} setStep={setStep} />}
        {step === 2 && <Step2 form={form} set={set} cats={cats} setStep={setStep} />}
        {step === 3 && <Step3 form={form} setStep={setStep} handleSubmit={handleSubmit} loading={loading} />}
        {step === 4 && <Step4 router={router} />}
      </main><Footer />
    </div>
  );
}

function Steps({ step }: { step: number }) {
  return <div className="flex items-center justify-center gap-3 mb-8">{["Loại", "Chi tiết", "Xác nhận", "Xong"].map((s, i) => (
    <div key={s} className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i ? "bg-green-500 text-white" : step === i + 1 ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</div><span className="text-xs hidden sm:block">{s}</span>{i < 3 && <div className="w-6 h-0.5 bg-border" />}</div>
  ))}</div>;
}

function Step1({ form, setForm, setStep }: any) {
  return <div className="grid sm:grid-cols-2 gap-4">{[
    { v: "DOCUMENT", l: "📄 Tài liệu số", d: "PDF, DOCX, PPTX" },
    { v: "PHYSICAL", l: "📦 Vật phẩm", d: "Sách, đồ dùng, điện tử" },
  ].map(t => (
    <button key={t.v} onClick={() => { setForm({ ...form, type: t.v }); setStep(2); }}
      className="p-6 rounded-xl border-2 border-border text-left hover:border-primary-500 hover:shadow-md transition-all">
      <p className="font-semibold text-lg">{t.l}</p><p className="text-sm text-muted-foreground mt-1">{t.d}</p>
    </button>
  ))}</div>;
}

function Step2({ form, set, cats, setStep }: any) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <Input label="Tên sản phẩm *" placeholder="VD: Giáo trình Toán A1" value={form.title} onChange={set("title")} />
        <Textarea label="Mô tả *" placeholder="Chi tiết..." value={form.description} onChange={set("description")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Giá (VNĐ) *" type="number" value={form.price} onChange={set("price")} />
          <Input label="Giá gốc" type="number" value={form.originalPrice} onChange={set("originalPrice")} />
        </div>
        <div><label className="text-sm font-medium block mb-1.5">Danh mục *</label>
          <select value={form.categoryId} onChange={set("categoryId")} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="">Chọn</option>{cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        {form.type === "PHYSICAL" && <div><label className="text-sm font-medium block mb-1.5">Tình trạng</label>
          <select value={form.condition} onChange={set("condition")} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {[["NEW","Mới"],["LIKE_NEW","Như mới"],["GOOD","Đã dùng"],["FAIR","Cũ"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select></div>}
        <Input label="URL ảnh thumbnail" placeholder="https://..." value={form.thumbnail} onChange={set("thumbnail")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Trường" value={form.university} onChange={set("university")} />
          <Input label="Thành phố" value={form.city} onChange={set("city")} />
        </div>
      </Card>
      <div className="flex gap-3"><Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button><Button variant="gradient" className="flex-1" onClick={() => setStep(3)}>Xem trước</Button></div>
    </div>
  );
}

function Step3({ form, setStep, handleSubmit, loading }: any) {
  return (
    <div className="space-y-4">
      <Card className="p-4"><h2 className="font-semibold mb-3">Xem trước</h2>
        <div className="space-y-2 text-sm"><p><strong>Tên:</strong> {form.title}</p><p><strong>Giá:</strong> {Number(form.price).toLocaleString("vi-VN")}đ</p><p><strong>Loại:</strong> {form.type === "DOCUMENT" ? "Tài liệu" : "Vật phẩm"}</p><p><strong>Mô tả:</strong> {form.description?.substring(0, 200)}</p></div>
      </Card>
      <p className="text-sm text-muted-foreground text-center">Sản phẩm sẽ chờ Admin duyệt trước khi hiển thị</p>
      <div className="flex gap-3"><Button variant="outline" onClick={() => setStep(2)}>Sửa</Button><Button variant="gradient" className="flex-1" onClick={handleSubmit} isLoading={loading}>Đăng bán</Button></div>
    </div>
  );
}

function Step4({ router }: any) {
  return (
    <div className="text-center py-12"><div className="text-6xl mb-4">✅</div><h2 className="text-2xl font-bold mb-2">Đã gửi!</h2><p className="text-muted-foreground mb-6">Sản phẩm đang chờ duyệt</p>
      <div className="flex gap-3 justify-center"><Button variant="gradient" onClick={() => router.push("/sell")}>Đăng tiếp</Button><Button variant="outline" onClick={() => router.push("/seller")}>Seller Dashboard</Button></div>
    </div>
  );
}

