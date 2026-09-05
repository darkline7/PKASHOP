"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminToastItem } from "@/app/admin/types";

let toastId = 0;

/** Toast cho khu vực admin — stacking, tự biến mất sau 4s. */
export function useAdminToast() {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);

  const push = useCallback((message: string, type: AdminToastItem["type"] = "info") => {
    toastId += 1;
    const id = toastId;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, push, remove };
}

const TOAST_STYLES: Record<AdminToastItem["type"], string> = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-amber-500 text-white",
  info: "bg-slate-800 text-white dark:bg-slate-700",
};

const TOAST_ICONS: Record<AdminToastItem["type"], React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastCard({ toast, onDismiss }: { toast: AdminToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon = TOAST_ICONS[toast.type];
  return (
    <div
      className={cn(
        "flex w-80 max-w-[calc(100vw-2rem)] items-start gap-2.5 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
        TOAST_STYLES[toast.type]
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 opacity-70 transition-opacity hover:opacity-100" aria-label="Đóng">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastViewport({ toasts, onDismiss }: { toasts: AdminToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
