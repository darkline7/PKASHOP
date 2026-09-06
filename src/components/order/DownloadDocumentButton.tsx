import React from "react";
import { Download, ExternalLink } from "lucide-react";

interface DownloadDocumentButtonProps {
  documentUrl?: string | null;
  title: string;
}

export default function DownloadDocumentButton({
  documentUrl,
  title,
}: DownloadDocumentButtonProps) {
  if (!documentUrl) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/50">
        File đang được cập nhật
      </span>
    );
  }

  const isExternal = documentUrl.startsWith("http://") || documentUrl.startsWith("https://");

  return (
    <a
      href={documentUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={!isExternal}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow active:scale-95"
      title={`Tải xuống ${title}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Tải tài liệu</span>
      {isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
    </a>
  );
}
