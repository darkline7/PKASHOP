"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Components";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  GraduationCap,
  Wand2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { formatVND } from "@/lib/utils";

interface AIHumanizerTabProps {
  initialText?: string;
  onRunCheckAgain?: (text: string) => void;
}

export default function AIHumanizerTab({
  initialText = "",
  onRunCheckAgain,
}: AIHumanizerTabProps) {
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<"standard" | "academic" | "creative">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feeNotice, setFeeNotice] = useState<string | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  const outWordCount = outputText.trim() ? outputText.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleHumanize = async () => {
    if (wordCount < 10) {
      setError("Vui lòng nhập văn bản tối thiểu 10 từ để viết lại.");
      return;
    }

    setError(null);
    setFeeNotice(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-check/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, mode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể chuyển đổi văn bản.");
      }

      setOutputText(data.humanized || "");
      if (data.feeDeducted > 0) {
        setFeeNotice(`Đã trừ ${formatVND(data.feeDeducted)} từ Ví PKASHOP cho ${data.originalWordCount} từ.`);
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi kết nối máy chủ AI.");
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-primary-500" />
            <span>Chọn phong cách chuyển đổi (Humanize Style)</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tối ưu hóa cấu trúc câu để vượt qua các thuật toán phát hiện AI (Turnitin, GPTZero).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60">
          {[
            { id: "standard", label: "Chuẩn tự nhiên", icon: Sparkles },
            { id: "academic", label: "Học thuật & Đề án", icon: GraduationCap },
            { id: "creative", label: "Sinh động", icon: ShieldCheck },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === item.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {feeNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feeNotice}</span>
        </div>
      )}

      {/* Editor Comparison Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Original AI text */}
        <Card className="p-4 space-y-3 flex flex-col justify-between border-border bg-card">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Văn bản gốc (Nghi vấn AI)
              </span>
              <span className="text-muted-foreground font-mono">{wordCount} từ</span>
            </div>

            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán văn bản do ChatGPT / Gemini tạo ra tại đây để chuyển đổi sang giọng văn người thật..."
              className="w-full rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <button
              onClick={() => {
                setInputText("");
                setOutputText("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Xóa ô nhập
            </button>

            <Button
              variant="gradient"
              size="sm"
              onClick={handleHumanize}
              isLoading={loading}
              className="text-xs font-semibold shadow-md shadow-primary-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Chuyển đổi thành người thật
            </Button>
          </div>
        </Card>
        {/* Right: Humanized result */}
        <Card className="p-4 space-y-3 flex flex-col justify-between border-border bg-card">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Văn bản đã Humanize (Tự nhiên & Chuẩn người thật)
              </span>
              <span className="text-muted-foreground font-mono">{outWordCount} từ</span>
            </div>

            <textarea
              rows={12}
              value={outputText}
              readOnly
              placeholder="Kết quả văn bản sau khi chuyển đổi tự nhiên sẽ xuất hiện tại đây..."
              className="w-full rounded-xl border border-border bg-muted/20 p-3.5 text-sm leading-relaxed focus:outline-none font-sans resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="text-[11px] text-muted-foreground">
              {outputText ? "✓ Đã phá vỡ khuôn mẫu AI" : "Chờ nhập liệu..."}
            </span>

            <div className="flex items-center gap-2">
              {outputText && onRunCheckAgain && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRunCheckAgain(outputText)}
                  className="text-xs"
                  title="Kiểm tra lại điểm % AI của văn bản mới"
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1" /> Check lại điểm AI
                </Button>
              )}

              <Button
                variant={copied ? "primary" : "gradient"}
                size="sm"
                onClick={copyOutput}
                disabled={!outputText}
                className="text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? "Đã copy!" : "Sao chép"}
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
