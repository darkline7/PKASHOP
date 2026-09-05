"use client";
import { Step2, Step3, Step4 } from "./SellSteps";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import ImageUpload from "@/components/ui/ImageUpload";
import { useAuthStore } from "@/stores";
import type { Category } from "@/types";
import { MapPin, Loader2, ArrowLeft, ArrowRight, Check, UploadCloud, FileText, HelpCircle, ShieldCheck } from "lucide-react";

export default function SellPage() {
  const router = useRouter();
  const { user, isLoading, isInitialized, fetchUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "DOCUMENT", // DOCUMENT, QUIZ, PHYSICAL
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    condition: "NEW",
    thumbnail: "",
    images: "",
    documentUrl: "",
    fileFormat: "PDF",
    proofImages: "",
    quizQuestions: [] as any[],
    rawQuizText: "",
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

  const parseQuizText = (text: string) => {
    const lines = text.split("\n");
    const parsed: any[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const parts = trimmed.split("|").map(p => p.trim());
      if (parts.length >= 6) {
        parsed.push({
          question: parts[0],
          option1: parts[1],
          option2: parts[2],
          option3: parts[3],
          option4: parts[4],
          correctAnswer: Number(parts[5]) || 1,
          explanation: parts[6] || "",
        });
      }
    }
    return parsed;
  };

  const handleRawQuizChange = (text: string) => {
    const questions = parseQuizText(text);
    setForm(prev => ({
      ...prev,
      rawQuizText: text,
      quizQuestions: questions,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.categoryId) {
      alert("Vui lòng điền đầy đủ tiêu đề và danh mục.");
      return;
    }
    if (!form.thumbnail) {
      alert("Vui lòng tải lên ảnh đại diện cho sản phẩm.");
      return;
    }

    if (form.type === "QUIZ") {
      if (form.price !== "15000" && form.price !== "20000") {
        alert("Quiz trắc nghiệm chỉ có 2 mức giá cố định: 15.000đ hoặc 20.000đ.");
        return;
      }
      if (form.quizQuestions.length === 0) {
        alert("Vui lòng nhập danh sách câu hỏi Quiz theo định dạng hướng dẫn.");
        return;
      }
    } else if (form.type === "DOCUMENT") {
      if (!form.documentUrl) {
        alert("Vui lòng tải lên file tài liệu để người mua có thể tải về ngay sau khi thanh toán!");
        return;
      }
      if (!form.proofImages) {
        alert("Vui lòng tải lên ảnh chụp minh chứng tài liệu thật để tạo uy tín!");
        return;
      }
      if (!form.price || Number(form.price) <= 0) {
        alert("Vui lòng nhập giá bán tài liệu.");
        return;
      }
    }

    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: form.type === "PHYSICAL" ? 0 : Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        images: form.images ? form.images.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        proofImages: form.proofImages ? [form.proofImages] : [],
        quizQuestions: form.type === "QUIZ" ? form.quizQuestions : undefined,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">📤 Đăng bán & Chia sẻ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Đăng bán Quiz trắc nghiệm, tài liệu uy tín hoặc pass đồ dùng sinh viên hoàn toàn miễn phí.
          </p>
        </div>

        <Steps step={step} />

        {step === 1 && <Step1 form={form} setForm={setForm} setStep={setStep} />}
        {step === 2 && (
          <Step2
            form={form}
            setForm={setForm}
            set={set}
            cats={cats}
            setStep={setStep}
            handleRawQuizChange={handleRawQuizChange}
          />
        )}
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
        <h2 className="text-lg font-bold text-foreground">Bạn muốn đăng loại nào?</h2>
        <p className="text-xs text-muted-foreground">Chọn hình thức phù hợp để hệ thống thiết lập tính năng chuẩn nhất</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-2">
        {[
          {
            v: "QUIZ",
            badge: "30% hoa hồng • Hạn 7 ngày",
            l: "🧠 Quiz trắc nghiệm",
            d: "Up file txt câu hỏi, người mua làm trắc nghiệm trực tiếp trên web. 2 mức giá: 15.000đ hoặc 20.000đ.",
            action: "Đăng bán Quiz",
          },
          {
            v: "DOCUMENT",
            badge: "30% hoa hồng • Nhận tức thì",
            l: "📄 Tài liệu học tập",
            d: "File PDF/DOCX có ngay khi mua, đính kèm ảnh minh chứng thật uy tín, thanh toán số dư ví.",
            action: "Đăng bán Tài liệu",
          },
          {
            v: "PHYSICAL",
            badge: "Miễn phí 100% • Tự xoá sau 7 ngày",
            l: "🎁 Pass đồ sinh viên",
            d: "Pass giáo trình cũ, máy tính, vật phẩm sinh viên. Người mua chat trực tiếp trên web.",
            action: "Đăng đồ miễn phí",
          },
        ].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => {
              setForm({
                ...form,
                type: t.v,
                price: t.v === "QUIZ" ? "15000" : t.v === "PHYSICAL" ? "0" : "",
              });
              setStep(2);
            }}
            className={`p-5 rounded-2xl border-2 text-left transition-all hover:border-primary-500 hover:shadow-md flex flex-col justify-between ${
              form.type === t.v ? "border-primary-500 bg-primary-500/5 shadow-sm" : "border-border bg-card"
            }`}
          >
            <div>
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 mb-3">
                {t.badge}
              </span>
              <p className="font-bold text-base text-foreground mb-1.5">{t.l}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.d}</p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-bold text-primary-600">
              {t.action} <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

