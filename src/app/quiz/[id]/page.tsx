"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores";
import { Clock } from "lucide-react";
import { QuizLockedCard } from "./QuizLockedCard";
import { QuizResultBanner, QuizQuestionList } from "./QuizQuestionList";

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [buying, setBuying] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/${productId}`);
      const d = await res.json();
      setData(d);
    } catch {
      alert("Lỗi tải thông tin Quiz");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (productId) fetchQuiz();
  }, [productId]);

  const handleSelectOption = (qId: string, optNum: number) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qId]: optNum }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length === 0) {
      alert("Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await res.json();
      if (res.ok) {
        setResult(d);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(d.error || "Nộp bài thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    }
    setSubmitting(false);
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push(`/login?returnTo=/quiz/${productId}`);
      return;
    }
    setBuying(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "WALLET" }),
      });
      const orderData = await orderRes.json();
      if (orderRes.ok) {
        alert("Thanh toán thành công! Bạn có 7 ngày để làm Quiz này.");
        fetchQuiz();
      } else {
        alert(orderData.error || "Số dư ví không đủ");
      }
    } catch {
      alert("Lỗi khi mua Quiz");
    }
    setBuying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 max-w-xl mx-auto py-16 text-center">
          <p className="text-lg font-bold">Không tìm thấy bài Quiz này.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              🧠 QUIZ ONLINE
            </span>
            {data.hasAccess && data.expiresAt && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" /> Hạn dùng: {new Date(data.expiresAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{data.product.title}</h1>
        </div>

        {!data.hasAccess ? (
          <QuizLockedCard
            product={data.product}
            questionCount={data.questionCount}
            onBuy={handleBuyNow}
            buying={buying}
          />
        ) : (
          <div className="space-y-6">
            {result && (
              <QuizResultBanner
                result={result}
                onReset={() => {
                  setResult(null);
                  setAnswers({});
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}

            <QuizQuestionList
              questions={result ? result.results : data.questions}
              answers={answers}
              result={result}
              onSelect={handleSelectOption}
            />

            {!result && (
              <div className="sticky bottom-4 bg-background/95 backdrop-blur-md p-4 rounded-2xl border border-border shadow-lg flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Đã trả lời: <strong>{Object.keys(answers).length} / {data.questions.length}</strong> câu
                </span>
                <Button variant="gradient" size="lg" onClick={handleSubmitQuiz} isLoading={submitting}>
                  Nộp bài chấm điểm
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
