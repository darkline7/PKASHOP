import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

/**
 * Catch-all cho các route admin chưa xây dựng.
 */
export default function AdminCatchAll({ params }: { params: { slug: string[] } }) {
  const path = params.slug?.join("/") || "";
  return (
    <>
      <AdminPageHeader title="Trang đang phát triển" subtitle={`/admin/${path}`} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">🚧 Khu vực này đang được xây dựng</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Chức năng <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">/admin/{path}</code> sẽ sớm ra mắt trong các phase tiếp theo.
        </p>
      </div>
    </>
  );
}