"use client";
import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Components";
import type { Product, Category } from "@/types";

const SORTS = [
  { value: "newest", label: "Mới nhất" }, { value: "price_asc", label: "Giá ↑" },
  { value: "price_desc", label: "Giá ↓" }, { value: "bestselling", label: "Bán chạy" }, { value: "rating", label: "Rating" },
];

export default function MarketplacePage() {
  return <Suspense fallback={<div className="min-h-screen flex flex-col"><Header /><div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8"><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div></div><Footer /></div>}><MarketplaceContent /></Suspense>;
}

function MarketplaceContent() {
  const sp = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(sp.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCat] = useState(sp.get("category") || "");
  const [type, setType] = useState(sp.get("type") || "");
  const [sort, setSort] = useState(sp.get("sort") || "newest");
  const [cond, setCond] = useState("");
  const [showF, setShowF] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce search input 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => setCats(d.categories || [])); }, []);

  const load = useCallback(async () => {
    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (category) p.set("category", category);
    if (type) p.set("type", type); if (sort) p.set("sort", sort);
    if (cond) p.set("condition", cond); p.set("page", String(page)); p.set("limit", "12");
    try {
      const r = await fetch(`/api/products?${p}`, { signal: controller.signal });
      const d = await r.json();
      setProducts(d.items || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1);
    } catch (e: any) {
      if (e?.name !== "AbortError") setProducts([]);
    }
    setLoading(false);
  }, [debouncedSearch, category, type, sort, cond, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold">Marketplace</h1><p className="text-sm text-muted-foreground">{total} sản phẩm</p></div>
          <button onClick={() => setShowF(!showF)} className="lg:hidden text-sm text-primary-600">{showF ? "Ẩn lọc" : "Bộ lọc"}</button>
        </div>
        <div className="flex gap-6">
          <Sidebar show={showF} cats={cats} search={search} setSearch={(s: string) => { setSearch(s); setPage(1); }}
            type={type} setType={(t: string) => { setType(t); setPage(1); }} category={category} setCat={(c: string) => { setCat(c); setPage(1); }}
            cond={cond} setCond={(c: string) => { setCond(c); setPage(1); }} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {loading ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
            : products.length > 0 ? <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
              {totalPages > 1 && <div className="flex justify-center gap-2 mt-8">{Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium ${p === page ? "bg-primary-600 text-white" : "border border-border hover:bg-muted"}`}>{p}</button>
              ))}</div>}
            </> : <div className="text-center py-20 text-muted-foreground"><p className="text-lg">Không tìm thấy sản phẩm</p></div>}
          </div>
        </div>
      </main><Footer />
    </div>
  );
}

function Sidebar({ show, cats, search, setSearch, type, setType, category, setCat, cond, setCond }: any) {
  return (
    <aside className={`w-64 flex-shrink-0 space-y-4 ${show ? "block" : "hidden lg:block"}`}>
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
          <input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Loại</label>
          {[
            { v: "", l: "Tất cả" },
            { v: "QUIZ", l: "🧠 Quiz trắc nghiệm" },
            { v: "DOCUMENT", l: "📄 Tài liệu số" },
            { v: "PHYSICAL", l: "🎁 Đồ sinh viên (Miễn phí)" },
          ].map(t => (
            <button key={t.v} onClick={() => setType(t.v)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${type === t.v ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30" : "hover:bg-muted"}`}>{t.l}</button>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Danh mục</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button onClick={() => setCat("")} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${!category ? "bg-primary-100 text-primary-700" : "hover:bg-muted"}`}>Tất cả</button>
            {cats.map((c: any) => (
              <button key={c.id} onClick={() => setCat(c.slug)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${category === c.slug ? "bg-primary-100 text-primary-700" : "hover:bg-muted"}`}>{c.name}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Tình trạng</label>
          {[{ v: "", l: "Tất cả" }, { v: "NEW", l: "Mới" }, { v: "LIKE_NEW", l: "Như mới" }, { v: "GOOD", l: "Tốt" }, { v: "FAIR", l: "Cũ" }].map(c => (
            <button key={c.v} onClick={() => setCond(c.v)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${cond === c.v ? "bg-primary-100 text-primary-700" : "hover:bg-muted"}`}>{c.l}</button>
          ))}
        </div>
      </div>
    </aside>
  );
}
