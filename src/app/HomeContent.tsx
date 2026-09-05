"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge, Skeleton } from "@/components/ui/Components";
import type { Product, Category } from "@/types";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Laptop,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  DownloadCloud,
  Layers,
  ChevronRight,
  Tag,
  Star,
} from "lucide-react";

const CATEGORY_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; desc: string }
> = {
  "tai-lieu-hoc-tap": {
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    desc: "Đề thi, giáo trình, slide bài giảng",
  },
  "de-thi": {
    icon: FileText,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    desc: "Đề thi giữa kỳ & cuối kỳ có giải",
  },
  "giao-trinh": {
    icon: GraduationCap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    desc: "Giáo trình chuẩn các trường ĐH",
  },
  "slide-bai-giang": {
    icon: Layers,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    desc: "Slide bài giảng tóm tắt dễ hiểu",
  },
  "pass-do": {
    icon: Laptop,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
    desc: "Máy tính Casio, phụ kiện, laptop SV",
  },
  "do-dung-hoc-tap": {
    icon: Tag,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    desc: "Bút, vở, thước kẻ, đồ án mẫu",
  },
};

export default function HomePage({ initialFeatured, initialLatest, initialCategories }: {
  initialFeatured?: Product[]; initialLatest?: Product[]; initialCategories?: Category[];
} = {}) {
  const router = useRouter();
  const [featured, setFeatured] = useState<Product[]>(initialFeatured || []);
  const [latest, setLatest] = useState<Product[]>(initialLatest || []);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialFeatured);
  const [heroSearch, setHeroSearch] = useState("");

  // Only fetch client-side if no SSR data was provided
  useEffect(() => {
    if (initialFeatured && initialLatest && initialCategories) return;
    Promise.all([
      fetch("/api/products?featured=true&limit=8").then((r) => r.json()),
      fetch("/api/products?limit=8&sort=newest").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([f, l, c]) => {
        setFeatured(f.items || []);
        setLatest(l.items || []);
        setCategories(c.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [initialFeatured, initialLatest, initialCategories]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-border/60">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary-500/15 via-indigo-500/10 to-purple-500/15 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Cộng đồng học tập & Marketplace sinh viên số 1 Phenikaa</span>
              <span className="hidden sm:inline-block text-muted-foreground">•</span>
              <span className="hidden sm:inline-block text-xs font-bold text-amber-500">2026 Edition</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.2] sm:leading-[1.15]">
              Chia sẻ tài liệu học tập &amp;{" "}
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pass đồ sinh viên
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Truy cập hàng ngàn đề thi có lời giải, slide bài giảng, giáo trình Đại học và mua bán đồ dùng sinh viên với giá tiết kiệm nhất.
            </p>

            <form onSubmit={handleHeroSearch} className="mt-6 sm:mt-8 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-lg shadow-primary-500/5 rounded-2xl bg-card border border-border p-1 sm:p-1.5 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground ml-2.5 sm:ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Nhập tên môn học, mã môn..."
                  className="w-full bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Button type="submit" variant="gradient" size="sm" className="flex-shrink-0 text-xs sm:text-sm">
                  Tìm kiếm
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground text-[11px] sm:text-xs">Gợi ý:</span>
                {["Giải tích 1", "Vật lý", "Đại số tuyến tính", "Xác suất", "Casio 580"].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => router.push(`/marketplace?search=${encodeURIComponent(kw)}`)}
                    className="px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted border border-border/60 hover:text-primary-600 transition-colors text-[11px] sm:text-xs"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 mt-6 sm:mt-8 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="w-full shadow-md shadow-primary-500/25">
                  <BookOpen className="w-4 h-4 mr-2" /> Khám phá tài liệu
                </Button>
              </Link>
              <Link href="/sell" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-border/80">
                  Đăng bán kiếm thêm thu nhập <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
              <div className="p-2 sm:p-0 rounded-xl bg-card/40 sm:bg-transparent border border-border/40 sm:border-none">
                <p className="text-xl sm:text-3xl font-black text-foreground">15,000+</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">Tài liệu &amp; Đề thi</p>
              </div>
              <div className="p-2 sm:p-0 rounded-xl bg-card/40 sm:bg-transparent border border-border/40 sm:border-none">
                <p className="text-xl sm:text-3xl font-black text-foreground">8,500+</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">Sinh viên tin dùng</p>
              </div>
              <div className="p-2 sm:p-0 rounded-xl bg-card/40 sm:bg-transparent border border-border/40 sm:border-none">
                <p className="text-xl sm:text-3xl font-black text-foreground">60+</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">Trường ĐH cả nước</p>
              </div>
              <div className="p-2 sm:p-0 rounded-xl bg-card/40 sm:bg-transparent border border-border/40 sm:border-none">
                <p className="text-xl sm:text-3xl font-black text-emerald-600">100%</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">Giao dịch an toàn</p>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES GRID SECTION */}
        <section className="py-14 sm:py-20 border-b border-border/60 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" /> Khám phá theo môn &amp; ngành
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Danh mục tài liệu &amp; Sản phẩm nổi bật
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                Xem tất cả danh mục <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-2xl" />
                  ))
                : categories.slice(0, 6).map((c) => {
                    const meta = CATEGORY_META[c.slug] || {
                      icon: BookOpen,
                      color: "text-primary-500",
                      bg: "bg-primary-500/10 border-primary-500/20",
                      desc: "Tài liệu & sản phẩm sinh viên",
                    };
                    const IconComp = meta.icon;

                    return (
                      <Link
                        key={c.id}
                        href={`/marketplace?category=${c.slug}`}
                        className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary-500/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                      >
                        <div>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border ${meta.bg} ${meta.color} group-hover:scale-110 transition-transform`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary-600 transition-colors line-clamp-1">
                            {c.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                            {meta.desc}
                          </p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span>{c._count?.products || 0} sản phẩm</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-primary-500" />
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS SECTION */}
        <section className="py-14 sm:py-20 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Được đánh giá cao nhất
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-foreground">
                  Tài liệu &amp; Sản phẩm nổi bật
                </h2>
              </div>
              <Link href="/marketplace?sort=bestselling">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  Xem tất cả →
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : featured.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có sản phẩm nổi bật</p>
              </div>
            )}
          </div>
        </section>

        {/* LATEST PRODUCTS SECTION */}
        <section className="py-14 sm:py-20 border-b border-border/60 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Cập nhật liên tục
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-foreground">
                  Mới đăng tải hôm nay
                </h2>
              </div>
              <Link href="/marketplace?sort=newest">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  Xem tất cả →
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : latest.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {latest.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có tài liệu mới</p>
              </div>
            )}
          </div>
        </section>

        {/* WHY CHOOSE PKASHOP SECTION */}
        <section className="py-12 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Lợi ích vượt trội
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Tại sao sinh viên tin dùng PKASHOP?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Mô hình mua bán tài liệu &amp; đồ dùng an toàn, bảo vệ quyền lợi sinh viên tuyệt đối
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center mb-3 sm:mb-4">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Giao dịch đảm bảo 100%</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tiền được giữ tạm thời qua ví PKASHOP. Bạn chỉ bị trừ tiền khi tài liệu đã tải thành công và chuẩn xác.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Tải tài liệu ngay lập tức</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hệ thống số hoá tự động mở khoá link tải file ngay khi thanh toán xong, không cần đợi người bán duyệt.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 sm:mb-4">
                  <DownloadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Kiếm tiền từ tài liệu</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Đăng tải đề thi, tóm tắt môn học của bạn để có nguồn thu nhập thụ động mỗi kỳ thi. Rút tiền về ngân hàng 24/7.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">Cộng đồng sinh viên thật</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hàng ngàn sinh viên Phenikaa và các trường Đại học cùng trao đổi tài liệu và pass đồ dùng tin cậy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 p-6 sm:p-12 text-white shadow-xl shadow-primary-500/20">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-white text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" /> Tham gia ngay hôm nay
              </span>
              <h2 className="text-xl sm:text-4xl font-black tracking-tight leading-tight">
                Bạn có tài liệu hay hoặc đồ dùng không dùng đến?
              </h2>
              <p className="text-white/80 text-xs sm:text-base mt-2 sm:mt-3 leading-relaxed">
                Đăng bán chỉ mất 2 phút. Tiếp cận hàng ngàn bạn sinh viên có nhu cầu mua ngay trong campus!
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <Link href="/sell" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg">
                    Đăng bán tài liệu ngay
                  </Button>
                </Link>
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full border-white/40 text-white hover:bg-white/10">
                    Khám phá chợ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
