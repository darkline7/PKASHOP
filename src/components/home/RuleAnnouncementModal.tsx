"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, X, BookOpen, AlertTriangle, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RuleAnnouncementModalProps {
  enabled?: boolean;
  title?: string;
  content?: string;
}

export default function RuleAnnouncementModal({
  enabled = true,
  title = "QUY ĐỊNH & CẨM NANG SỬ DỤNG AN TOÀN",
  content = "",
}: RuleAnnouncementModalProps) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const dismissedUntil = localStorage.getItem("pka_rules_dismissed_until");
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;
    } catch {}

    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, [enabled]);

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(
          "pka_rules_dismissed_until",
          String(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
      } catch {}
    }
    setOpen(false);
  };

  if (!open || !enabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 pr-6">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-wide line-clamp-1">
                {title || "QUY ĐỊNH & CẨM NANG SỬ DỤNG AN TOÀN"}
              </h3>
              <p className="text-[11px] text-white/80">Cộng đồng sinh viên Phenikaa</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Bar */}
        <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Quy tắc 3 KHÔNG: KHÔNG cọc – KHÔNG chuyển khoản trước – Gặp trực tiếp tại trường!</span>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {content ? (
            <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {content}
            </div>
          ) : (
            <div className="space-y-3">
              <p>Chào mừng bạn đến với Nền tảng Trao đổi Tài liệu &amp; Đồ cũ của cộng đồng sinh viên Phenikaa.</p>
              <div className="p-3 rounded-xl border border-border/80 bg-muted/30">
                <p className="font-bold text-foreground mb-1">1. Đối với Tài liệu &amp; Quiz ôn tập</p>
                <p className="text-muted-foreground text-xs">Phục vụ mục đích học tập. Nghiêm cấm gian lận thi cử.</p>
              </div>
              <div className="p-3 rounded-xl border border-border/80 bg-muted/30">
                <p className="font-bold text-foreground mb-1">2. Đối với Giao dịch Đồ cũ</p>
                <p className="text-muted-foreground text-xs">Quy tắc 3 KHÔNG: Không cọc, không chuyển khoản trước, gặp trực tiếp tại trường.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/40 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded accent-primary-600 cursor-pointer w-4 h-4"
            />
            <span>Không hiển thị lại trong 7 ngày</span>
          </label>
          <Button variant="gradient" size="sm" onClick={handleClose} className="w-full sm:w-auto px-6">
            Tôi đã đọc &amp; Hiểu rõ quy định <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
