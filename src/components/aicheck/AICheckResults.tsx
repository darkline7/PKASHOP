"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Components";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Download,
} from "lucide-react";
import type { AIDetectorResult, SentenceAnalysis } from "@/lib/aiDetector";

interface AICheckResultsProps {
  result: AIDetectorResult;
  fileName?: string;
  onApplySuggestion: (sentenceId: number, newText: string) => void;
  onGoToHumanizer: (text: string) => void;
}

export default function AICheckResults({
  result,
  fileName,
  onApplySuggestion,
  onGoToHumanizer,
}: AICheckResultsProps) {
  const [selectedSentence, setSelectedSentence] = useState<SentenceAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [rewritingId, setRewritingId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { overallScore, isAiGenerated, label, verdict, stats, sentences } = result;

  const isHigh = overallScore >= 70;
  const isMedium = overallScore >= 40 && overallScore < 70;
  const scoreColor = isHigh ? "text-rose-600" : isMedium ? "text-amber-500" : "text-emerald-600";
  const strokeColor = isHigh ? "#e11d48" : isMedium ? "#f59e0b" : "#10b981";

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const handleRewriteSingle = async (sentence: SentenceAnalysis) => {
    setRewritingId(sentence.id);
    try {
      const res = await fetch("/api/ai-check/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentence.text, isSingleSentence: true }),
      });
      const data = await res.json();
      if (data.humanized) {
        onApplySuggestion(sentence.id, data.humanized);
        setSelectedSentence(null);
      }
    } catch {
      // ignore
    } finally {
      setRewritingId(null);
    }
  };

  const fullText = sentences.map((s) => s.text).join(" ");

  const copyFull = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportReportDocx = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/ai-check/file/export-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileName || "VanBan_KiemTra.docx",
          result,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Không thể xuất file báo cáo.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = (fileName || "VanBan_KiemTra.docx").replace(/\.[^/.]+$/, "");
      a.download = `[KetQua-CheckAI]_${baseName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err?.message || "Lỗi khi tải file kết quả.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Circular Gauge Card */}
        <Card className="p-5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-card/70 border-border/80">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="stroke-muted"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${scoreColor}`}>{overallScore}%</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Xác suất AI
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isHigh
                  ? "bg-rose-500/15 text-rose-600 border border-rose-500/20"
                  : isMedium
                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                  : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              {isHigh ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {label}
            </span>
          </div>
        </Card>

        {/* Verdict & Metrics Card */}
        <Card className="p-5 md:col-span-2 flex flex-col justify-between space-y-4 bg-card/70 border-border/80">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1.5">
              <span>📊 Đánh giá chi tiết từ Lõi AI</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{verdict}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/60">
            <div className="p-2.5 rounded-xl bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground font-medium">Tổng số từ</p>
              <p className="text-base font-bold text-foreground mt-0.5">{stats.wordCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground font-medium">Câu nghi vấn AI</p>
              <p className={`text-base font-bold mt-0.5 ${stats.aiSentenceCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {stats.aiSentenceCount} / {stats.sentenceCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground font-medium" title="Độ đột biến độ dài & cấu trúc câu">
                Độ đột biến
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">{stats.burstinessScore}/100</p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground font-medium" title="Độ phong phú & khó đoán từ vựng">
                Đa dạng từ ngữ
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">{stats.perplexityScore}/100</p>
            </div>
          </div>

          {/* Action CTA to Humanizer & Export */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/40">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportReportDocx}
              isLoading={isExporting}
              className="text-xs font-semibold"
              title="Tải về file Word (.docx) tương tự chứa kết quả phân tích & câu nghi vấn"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
              <span>Tải file kết quả (.docx)</span>
            </Button>

            {overallScore >= 40 && (
              <Button
                size="sm"
                variant="gradient"
                onClick={() => onGoToHumanizer(fullText)}
                className="text-xs font-semibold shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Chuyển sang Humanizer <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Interactive Highlighted Text Editor */}
      <Card className="p-5 space-y-4 bg-card border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>📝 Phân tích từng câu trong bài viết</span>
              {fileName && (
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {fileName}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bấm vào bất kỳ câu nào được tô màu để xem lý do và gợi ý viết lại tự nhiên.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportReportDocx}
              isLoading={isExporting}
              className="text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-primary-500" />
              <span>Tải kết quả (.docx)</span>
            </Button>
            <button
              onClick={copyFull}
              className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              <span>{copied ? "Đã copy" : "Sao chép toàn bài"}</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground font-medium">Chú thích màu sắc:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Khả năng cao AI (&gt;75%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Nghi vấn AI (50-74%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-muted border border-border" />
            <span className="text-muted-foreground">Văn phong người viết</span>
          </span>
        </div>

        {/* Text paragraph with highlighted sentence spans */}
        <div className="p-4 rounded-xl border border-border/80 bg-background/80 text-sm leading-relaxed max-h-[500px] overflow-y-auto space-x-1 font-normal">
          {sentences.map((sentence) => {
            const isSelected = selectedSentence?.id === sentence.id;
            let bgClass = "hover:bg-muted/60 transition-colors";
            if (sentence.severity === "high") {
              bgClass = "bg-rose-500/15 hover:bg-rose-500/25 text-rose-950 dark:text-rose-100 border-b-2 border-rose-500/40";
            } else if (sentence.severity === "medium") {
              bgClass = "bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 dark:text-amber-100 border-b-2 border-amber-500/40";
            }

            if (isSelected) {
              bgClass += " ring-2 ring-primary-500 rounded-sm";
            }

            return (
              <span
                key={sentence.id}
                onClick={() => setSelectedSentence(sentence)}
                className={`cursor-pointer px-1 py-0.5 rounded transition-all inline ${bgClass}`}
                title={`Câu #${sentence.id} (${sentence.aiScore}% AI) - Bấm để xem phân tích`}
              >
                {sentence.text}{" "}
              </span>
            );
          })}
        </div>
        {/* Active Sentence Inspector Modal / Popover */}
        {selectedSentence && (
          <div className="p-4 rounded-xl border border-primary-500/30 bg-primary-50/20 dark:bg-primary-950/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-600 font-bold text-xs">
                  Câu #{selectedSentence.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    selectedSentence.severity === "high"
                      ? "bg-rose-500/15 text-rose-600"
                      : selectedSentence.severity === "medium"
                      ? "bg-amber-500/15 text-amber-600"
                      : "bg-emerald-500/15 text-emerald-600"
                  }`}
                >
                  {selectedSentence.aiScore}% Khả năng AI
                </span>
              </div>

              <button
                onClick={() => setSelectedSentence(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-0.5 rounded hover:bg-muted"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="text-muted-foreground font-medium">Nội dung câu:</p>
              <p className="p-2.5 rounded-lg bg-background border border-border text-foreground font-medium">
                "{selectedSentence.text}"
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Lý do gắn cờ:
              </p>
              <p className="text-muted-foreground pl-4.5">{selectedSentence.reason}</p>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-border/60">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Đề xuất viết lại chuẩn tự nhiên:
              </p>
              <p className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-foreground font-medium">
                "{selectedSentence.suggestion}"
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRewriteSingle(selectedSentence)}
                isLoading={rewritingId === selectedSentence.id}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> AI Viết lại câu khác
              </Button>
              <Button
                size="sm"
                variant="gradient"
                onClick={() => {
                  onApplySuggestion(selectedSentence.id, selectedSentence.suggestion);
                  setSelectedSentence(null);
                }}
                className="text-xs font-semibold"
              >
                <Check className="w-3 h-3 mr-1" /> Áp dụng câu này
              </Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}

