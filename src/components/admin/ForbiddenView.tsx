import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Màn hình 403 cho người dùng không có quyền quản trị.
 */
export function ForbiddenView({ name }: { name?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#0B0F1A]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
          <ShieldX className="h-7 w-7" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">403</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Bạn không có quyền truy cập</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Tài khoản {name ? `“${name}” ` : "của bạn"} chưa được cấp quyền quản trị. Nếu bạn cho rằng đây là
          sai sót, vui lòng liên hệ quản trị viên hệ thống.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}