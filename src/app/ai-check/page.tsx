"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import {
  Sparkles,
  Search,
  Wand2,
  Wallet,
  AlertCircle,
  FileText,
  RotateCcw,
  ClipboardPaste,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AICheckResults from "@/components/aicheck/AICheckResults";
import AIHumanizerTab from "@/components/aicheck/AIHumanizerTab";
import FileUploadBox from "@/components/aicheck/FileUploadBox";
import { useAuthStore } from "@/stores";
import { formatVND } from "@/lib/utils";
import type { AIDetectorResult } from "@/lib/aiDetector";

const SAMPLE_AI_TEXT = `Trong bối cảnh hiện nay, công nghệ trí tuệ nhân tạo đang ngày càng trở nên phổ biến và đóng vai trò quan trọng trong việc thúc đẩy sự phát triển của giáo dục đại học. Hơn nữa, các công cụ học tập thông minh không chỉ mang lại nhiều lợi ích to lớn cho sinh viên trong việc tra cứu tài liệu mà còn góp phần không nhỏ vào việc nâng cao hiệu quả nghiên cứu khoa học. Bên cạnh đó, các trường đại học cũng đang tích cực triển khai các nền tảng số hóa nhằm tối ưu hóa quy trình quản lý học tập một cách toàn diện và bền vững. Tóm lại, việc áp dụng công nghệ là chìa khóa then chốt mở ra kỷ nguyên mới cho nền giáo dục tương lai.`;

const SAMPLE_HUMAN_TEXT = `Kỳ này mình học Giải tích 1 của thầy Phú, nói thật là khó nhăn răng. Mấy tuần đầu vào nghe đạo hàm với chuỗi số mà lú hết cả đầu, chả hiểu gì luôn. May mà có bộ đề cương ôn tập của mấy anh K66 truyền lại, giải chi tiết từng bước với chỉ mẹo bấm máy Casio 580. Mình cày mất đúng 4 đêm trước hôm thi, cuối cùng qua môn được B+, mừng rớt nước mắt.`;

export default function AICheckPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"detector" | "humanizer">("detector");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIDetectorResult | null>(null);
  const [humanizerInputText, setHumanizerInputText] = useState("");

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleScan = async () => {
    if (wordCount < 10) {
      setError("Vui lòng nhập văn bản tối thiểu 10 từ để hệ thống phân tích.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai-check/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể phân tích văn bản.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi kiểm tra văn bản.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setError(null);
      }
    } catch {
      // fallback
    }
  };

  const handleApplySuggestion = (sentenceId: number, newSentenceText: string) => {
    if (!result) return;
    const updatedSentences = result.sentences.map((s) =>
      s.id === sentenceId ? { ...s, text: newSentenceText, aiScore: 15, severity: "low" as const } : s
    );
    const newFullText = updatedSentences.map((s) => s.text).join(" ");
    setText(newFullText);
    setResult({
      ...result,
      sentences: updatedSentences,
      overallScore: Math.max(10, result.overallScore - 12),
    });
  };

  const handleGoToHumanizer = (content: string) => {
    setHumanizerInputText(content);
    setActiveTab("humanizer");
  };

  const handleRunCheckAgain = (newText: string) => {
    setText(newText);
    setActiveTab("detector");
    // Trigger check
    setTimeout(() => {
      fetch("/api/ai-check/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setResult(d);
        })
        .catch(() => {});
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero title banner */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-600 border border-primary-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PKASHOP Campus AI Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Kiểm tra Đạo văn &amp; Xác suất AI
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tải lên tài liệu Word/PDF hoặc dán bài viết để phát hiện AI &amp; đạo văn bằng thuật toán Perplexity &amp; Burstiness, kèm tính năng Humanize xuất file kết quả tự nhiên.
          </p>
        </div>

        {/* Tab Switcher & Wallet Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/60 border border-border/60 self-start">
            <button
              onClick={() => setActiveTab("detector")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "detector"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>1. Kiểm tra Đạo văn &amp; AI</span>
            </button>
            <button
              onClick={() => setActiveTab("humanizer")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "humanizer"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>2. Viết lại tự nhiên (Humanizer)</span>
            </button>
          </div>

          {/* Wallet Balance Pill */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
              <Wallet className="w-3.5 h-3.5" />
              <span>Số dư ví: {formatVND(user?.walletBalance || 0)}</span>
            </div>
            <Link href="/wallet" className="text-primary-600 font-semibold hover:underline text-xs">
              + Nạp tiền
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === "detector" && (
          <div className="space-y-6">
            <Card className="p-4 sm:p-5 space-y-3.5 bg-card border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary-500" />
                  Nhập văn bản hoặc tải file kiểm tra AI &amp; Đạo văn
                </span>
                <span className="text-muted-foreground font-mono">
                  {wordCount} từ · {wordCount <= 250 ? "Miễn phí" : "500đ / 1.000 từ"}
                </span>
              </div>

              {/* File Upload Box */}
              <FileUploadBox
                onFileLoaded={(loadedText, loadedName) => {
                  setText(loadedText);
                  setFileName(loadedName);
                  setError(null);
                  setResult(null);
                }}
                currentFileName={fileName}
                onClearFile={() => {
                  setFileName(null);
                }}
              />

              <textarea
                rows={9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Dán bài tiểu luận, báo cáo, đoạn văn bài viết hoặc tải file Word/PDF ở trên (tối thiểu 10 từ)..."
                className="w-full rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1 transition-colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" /> Dán văn bản
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText(SAMPLE_AI_TEXT);
                      setError(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                  >
                    Thử mẫu AI (ChatGPT)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText(SAMPLE_HUMAN_TEXT);
                      setError(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                  >
                    Thử mẫu Người viết
                  </button>
                  {text && (
                    <button
                      type="button"
                      onClick={() => {
                        setText("");
                        setResult(null);
                      }}
                      className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Xóa
                    </button>
                  )}
                </div>

                <Button
                  variant="gradient"
                  onClick={handleScan}
                  isLoading={loading}
                  className="font-bold text-xs sm:text-sm px-6 shadow-md shadow-primary-500/25"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" /> Quét &amp; Phân tích AI ngay
                </Button>
              </div>
            </Card>

            {/* Results Section */}
            {result && (
              <AICheckResults
                result={result}
                fileName={fileName || undefined}
                onApplySuggestion={handleApplySuggestion}
                onGoToHumanizer={handleGoToHumanizer}
              />
            )}
          </div>
        )}

        {activeTab === "humanizer" && (
          <AIHumanizerTab
            initialText={humanizerInputText || text}
            initialFileName={fileName || undefined}
            onRunCheckAgain={handleRunCheckAgain}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
