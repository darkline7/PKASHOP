"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { useCartStore, useAuthStore } from "@/stores";
import { formatVND } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, fetchCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ shippingName: "", shippingPhone: "", shippingAddress: "", shippingCity: "", note: "" });
  const [method, setMethod] = useState("WALLET");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchCart();
      setForm(f => ({ ...f, shippingName: user.name, shippingPhone: user.phone || "" }));
    }
  }, [user, fetchCart, router]);

  const hasPhysical = items.some(i => i.product.type === "PHYSICAL");
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method, ...form }),
      });
      const data = await res.json();
      if (res.ok) { clearCart(); setStep(3); }
      else alert(data.error || "Lỗi thanh toán");
    } catch { alert("Lỗi kết nối"); }
    setLoading(false);
  };

  if (!user) return null;
  if (items.length === 0 && step < 3) return null;

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["Xác nhận", "Thanh toán", "Hoàn tất"].map((s, i) => (
            <div key={s} className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i ? "bg-green-500 text-white" : step === i + 1 ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</div><span className="text-sm hidden sm:block">{s}</span>{i < 2 && <div className="w-8 h-0.5 bg-border" />}</div>
          ))}
        </div>
        {step === 1 && (
          <div className="space-y-4">
            <Card className="p-4"><h2 className="font-semibold mb-3">Sản phẩm ({items.length})</h2>
              {items.map(i => <div key={i.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0"><div className="w-12 h-12 rounded-lg overflow-hidden relative bg-muted flex-shrink-0"><Image src={i.product.thumbnail || "/placeholder.jpg"} alt="" fill className="object-cover" sizes="48px" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{i.product.title}</p><p className="text-xs text-muted-foreground">x{i.quantity}</p></div><span className="font-semibold text-sm">{formatVND(i.product.price * i.quantity)}</span></div>)}
              <div className="flex justify-between mt-3 pt-3 border-t"><span className="font-semibold">Tổng</span><span className="text-xl font-bold text-primary-600">{formatVND(total)}</span></div>
            </Card>
            {hasPhysical && <Card className="p-4 space-y-3"><h2 className="font-semibold">Thông tin giao hàng</h2>
              <Input label="Họ tên" value={form.shippingName} onChange={set("shippingName")} required />
              <Input label="Số điện thoại" value={form.shippingPhone} onChange={set("shippingPhone")} required />
              <Input label="Địa chỉ" value={form.shippingAddress} onChange={set("shippingAddress")} required />
              <Input label="Thành phố" value={form.shippingCity} onChange={set("shippingCity")} required />
            </Card>}
            <Button variant="gradient" size="lg" className="w-full" onClick={() => setStep(2)}>Tiếp tục</Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Card className="p-4"><h2 className="font-semibold mb-3">Phương thức thanh toán</h2>
              {(() => {
                const hasDigital = items.some(i => i.product.type === "DOCUMENT" || i.product.type === "QUIZ");
                const methods = hasDigital
                  ? [{ v: "WALLET", l: `💰 Ví PKASHOP trên web (${formatVND(user.walletBalance)}) - Bắt buộc cho Quiz & Tài liệu` }]
                  : [
                      { v: "WALLET", l: `💰 Ví PKASHOP (${formatVND(user.walletBalance)})` },
                      { v: "BANK_TRANSFER", l: "🏦 Chuyển khoản" },
                      { v: "COD", l: "📦 COD (Nhận hàng trả tiền)" },
                    ];
                return methods.map(m => (
                  <button key={m.v} onClick={() => setMethod(m.v)} className={`w-full text-left px-4 py-3 rounded-xl mb-2 border-2 transition-all ${method === m.v ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:border-primary-300"}`}>{m.l}</button>
                ));
              })()}
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}>Quay lại</Button>
              <Button variant="gradient" size="lg" className="flex-1" onClick={handleCheckout} isLoading={loading}>Thanh toán {formatVND(total)}</Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center py-12"><div className="text-6xl mb-4">🎉</div><h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2><p className="text-muted-foreground mb-6">Cảm ơn bạn đã mua hàng trên PKASHOP</p>
            <div className="flex gap-3 justify-center"><Link href="/orders"><Button variant="gradient">Xem đơn hàng</Button></Link><Link href="/marketplace"><Button variant="outline">Tiếp tục mua</Button></Link></div>
          </div>
        )}
      </main><Footer />
    </div>
  );
}
