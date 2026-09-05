"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCartStore, useAuthStore } from "@/stores";

export default function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAdd = async () => {
    if (!user) { router.push("/login"); return; }
    setAdding(true);
    const ok = await addToCart(productId);
    setMsg(ok ? "Đã thêm vào giỏ hàng!" : "Không thể thêm");
    setAdding(false);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <>
      {msg && <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-green-600 text-white text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">{msg}</div>}
      <div className="flex gap-3">
        <Button variant="gradient" size="lg" className="flex-1" onClick={handleAdd} isLoading={adding}>🛒 Thêm giỏ hàng</Button>
        <Button variant="outline" size="lg" onClick={() => { handleAdd(); router.push("/cart"); }}>Mua ngay</Button>
      </div>
    </>
  );
}