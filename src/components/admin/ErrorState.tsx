"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 py-14 text-center dark:border-red-900/40 dark:bg-red-950/20">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Không thể tải dữ liệu</h3>
      <p className="mt-1 max-w-sm px-4 text-sm text-slate-500 dark:text-slate-400">
        {message || "Đã có lỗi xảy ra khi kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry} isLoading={retrying}>
          <RefreshCw className={cn("mr-2 h-4 w-4", retrying && "animate-spin")} />
          Thử lại
        </Button>
      )}
    </div>
  );
}
