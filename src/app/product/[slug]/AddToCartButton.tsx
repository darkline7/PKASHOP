"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Download, ExternalLink, CheckCircle } from "lucide-react";
import { useCartStore, useAuthStore } from "@/stores";

interface AddToCartButtonProps {
  productId: string;
  isDocument?: boolean;
}

export default function AddToCartButton({ productId, isDocument = false }: AddToCartButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [purchasedDoc, setPurchasedDoc] = useState<{ purchased: boolean; documentUrl?: string | null } | null>(null);

  useEffect(() => {
    if (!user || !productId) return;
    fetch(`/api/orders?role=buyer&status=PAID`)
      .then((r) => r.json())
      .then((d) => {
        const orders = d.orders || [];
        for (const o of orders) {
          const matchedItem = o.items?.find((it: any) => it.productId === productId);
          if (matchedItem) {
            setPurchasedDoc({
              purchased: true,
              documentUrl: matchedItem.documentUrl || matchedItem.product?.documentUrl,
            });
            break;
          }
        }
      })
      .catch(() => {});
  }, [user, productId]);

  const handleAdd = async () => {
    if (!user) { router.push("/login"); return; }
    setAdding(true);
    const ok = await addToCart(productId);
    setMsg(ok ? "Đã thêm vào giỏ hàng!" : "Không thể thêm");
    setAdding(false);
    setTimeout(() => setMsg(""), 3000);
  };

  if (purchasedDoc?.purchased) {
    const isExternal =
      purchasedDoc.documentUrl?.startsWith("http://") ||
      purchasedDoc.documentUrl?.startsWith("https://");

    return (
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Bạn đã mua sản phẩm này</span>
        </div>
        {isDocument && (
          <div>
            {purchasedDoc.documentUrl ? (
              <a
                href={purchasedDoc.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={!isExternal}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Tải tài liệu ngay</span>
                {isExternal && <ExternalLink className="w-3.5 h-3.5 opacity-80" />}
              </a>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                File tài liệu đang được người bán / quản trị viên cập nhật. Bạn có thể kiểm tra lại trong mục Đơn hàng.
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Link href="/orders" className="text-xs text-primary-600 hover:underline">
            Xem trong đơn hàng của tôi →
          </Link>
        </div>
      </div>
    );
  }

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