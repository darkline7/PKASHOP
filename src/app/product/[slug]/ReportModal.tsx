"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { Flag, Check, AlertTriangle } from "lucide-react";

export default function ReportModal({
  productId,
  isOwner = false,
}: {
  productId: string;
  isOwner?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(isOwner ? "Đã bán" : "Tài liệu / Quiz chất lượng kém");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const ownerReasons = ["Đã bán", "Hỏng", "Khác"];
  const buyerReasons = [
    "Tài liệu / Quiz lởm, sai đáp án",
    "Nội dung bậy bạ, không đúng môn học",
    "Có dấu hiệu lừa đảo, giả mạo",
    "File lỗi không mở được",
    "Khác",
  ];

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reason, description }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Báo cáo thành công!");
        setTimeout(() => {
          setOpen(false);
          setSuccessMsg("");
          if (isOwner) window.location.reload();
        }, 1800);
      } else {
        alert(data.error || "Gửi báo cáo thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors py-1"
      >
        <Flag className="w-3.5 h-3.5" />
        {isOwner ? "Cập nhật tình trạng tin (Đã bán / Hỏng)" : "Báo cáo nội dung xấu / lởm"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 relative">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {isOwner ? "Báo cáo tình trạng tin đăng" : "Báo cáo sản phẩm vi phạm"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {isOwner
                ? "Chọn Đã bán hoặc Hỏng để hệ thống tự động ẩn hoặc cập nhật trạng thái."
                : "Giúp sinh viên Phenikaa tránh tài liệu lởm, quiz kém chất lượng hoặc gian lận."}
            </p>

            {successMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium flex items-center gap-2">
                <Check className="w-5 h-5" /> {successMsg}
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5">Lý do *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {(isOwner ? ownerReasons : buyerReasons).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5">Chi tiết phản ánh (tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả cụ thể để BQT kiểm tra và giải quyết nhanh chóng..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Đóng
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" isLoading={loading}>
                    Gửi phản hồi
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
