"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { formatVND } from "@/lib/utils";

export function QuizLockedCard({ product, questionCount, onBuy, buying }: any) {
  return (
    <Card className="p-8 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto">
        🔒
      </div>
      <h2 className="text-xl font-bold">Bạn chưa kích hoạt Quiz này</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Bài trắc nghiệm gồm <strong>{questionCount || 0} câu hỏi</strong>. Mua để làm trực tiếp trên web không giới hạn số lần trong <strong>7 ngày</strong>.
      </p>
      <div className="p-3 bg-muted rounded-xl font-semibold text-lg text-primary-600">
        Giá: {formatVND(product.price)} (Trừ từ Ví PKASHOP)
      </div>
      <Button variant="gradient" size="lg" className="w-full" onClick={onBuy} isLoading={buying}>
        Mở khóa Quiz ngay ({formatVND(product.price)})
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Thanh toán trực tiếp bằng số dư ví. Phí hoa hồng sàn 30%.
      </p>
    </Card>
  );
}
