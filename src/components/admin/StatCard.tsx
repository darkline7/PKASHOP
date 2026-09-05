"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Components";

type Accent = "indigo" | "emerald" | "amber" | "sky" | "red" | "violet";

const ACCENTS: Record<Accent, string> = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
};

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Phần trăm thay đổi so với kỳ trước; null/undefined = không hiển thị */
  deltaPct?: number | null;
  subtitle?: string;
  href?: string;
  loading?: boolean;
  accent?: Accent;
}

export function StatCard({ icon: Icon, label, value, deltaPct, subtitle, href, loading, accent = "indigo" }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="mt-3.5 h-3.5 w-24" />
        <Skeleton className="mt-2 h-6 w-28" />
      </div>
    );
  }

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", ACCENTS[accent])}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {deltaPct != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              deltaPct >= 0
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            )}
          >
            {deltaPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(deltaPct)}%
          </span>
        )}
      </div>
      <p className="mt-3 truncate text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {subtitle && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
    </>
  );

  const base =
    "block h-full rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900";

  if (href) {
    return (
      <Link href={href} className={cn(base, "transition-colors hover:border-indigo-300 dark:hover:border-indigo-700")}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}
