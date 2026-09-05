import { cn } from "@/lib/utils";

/**
 * Badge trạng thái duy nhất cho toàn bộ khu vực admin.
 * Map mọi status (product / order / payment / transaction / role / report)
 * sang nhãn tiếng Việt + màu nhất quán.
 */

export type StatusKind = "product" | "order" | "payment" | "transaction" | "role" | "report" | "generic";

const TONES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400",
  error: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400",
};

interface Entry {
  label: string;
  tone: keyof typeof TONES;
}

const KIND_MAP: Record<StatusKind, Record<string, Entry>> = {
  product: {
    DRAFT: { label: "Bản nháp", tone: "neutral" },
    PENDING: { label: "Chờ duyệt", tone: "warning" },
    REVIEWING: { label: "Đang xem xét", tone: "info" },
    ACTIVE: { label: "Đang bán", tone: "success" },
    REJECTED: { label: "Từ chối", tone: "error" },
    SOLD: { label: "Đã bán", tone: "info" },
    HIDDEN: { label: "Đã ẩn", tone: "neutral" },
  },
  order: {
    PENDING: { label: "Chờ thanh toán", tone: "warning" },
    PAID: { label: "Đã thanh toán", tone: "info" },
    PROCESSING: { label: "Đang xử lý", tone: "info" },
    SHIPPING: { label: "Đang giao", tone: "success" },
    COMPLETED: { label: "Hoàn thành", tone: "success" },
    CANCELLED: { label: "Đã hủy", tone: "neutral" },
    REFUNDED: { label: "Đã hoàn tiền", tone: "purple" },
  },
  payment: {
    UNPAID: { label: "Chưa thanh toán", tone: "warning" },
    PAID: { label: "Đã thanh toán", tone: "success" },
    FAILED: { label: "Thanh toán thất bại", tone: "error" },
    REFUNDED: { label: "Đã hoàn tiền", tone: "purple" },
  },
  transaction: {
    SUCCESS: { label: "Thành công", tone: "success" },
    PENDING: { label: "Đang chờ", tone: "warning" },
    FAILED: { label: "Thất bại", tone: "error" },
    CANCELLED: { label: "Đã hủy", tone: "neutral" },
  },
  role: {
    USER: { label: "Người dùng", tone: "neutral" },
    SELLER: { label: "Người bán", tone: "info" },
    MODERATOR: { label: "Điều hành", tone: "warning" },
    ADMIN: { label: "Quản trị", tone: "purple" },
    SUPER_ADMIN: { label: "Quản trị tối cao", tone: "purple" },
  },
  report: {
    PENDING: { label: "Chờ xử lý", tone: "warning" },
    RESOLVED: { label: "Đã xử lý", tone: "success" },
    REJECTED: { label: "Từ chối", tone: "neutral" },
  },
  generic: {},
};

export function StatusBadge({
  status,
  kind = "generic",
  className,
}: {
  status: string;
  kind?: StatusKind;
  className?: string;
}) {
  const entry = KIND_MAP[kind]?.[status] || KIND_MAP.generic[status] || { label: status, tone: "neutral" as const };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        TONES[entry.tone],
        className
      )}
    >
      {entry.label}
    </span>
  );
}
