"use client";
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  FileText,
  Laptop,
  GraduationCap,
  Wallet,
  Plus,
  ShieldCheck,
  Zap,
  HelpCircle,
  LogOut,
  Settings,
  Package,
  Heart,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Store,
  Sparkles,
  Home,
  Grid,
  CheckCheck,
  User as UserIcon,
  MessageSquare,
} from "lucide-react";
import { useAuthStore, useCartStore, useNotificationStore, useUIStore } from "@/stores";
import { Avatar } from "@/components/ui/Components";
import { formatVND } from "@/lib/utils";
import MobileDrawer from "./MobileDrawer";

const NAV_CATEGORIES = [
  {
    name: "Tài liệu học tập",
    href: "/marketplace?type=DOCUMENT",
    desc: "Đề thi, giáo trình, slide bài giảng Đại học",
    icon: BookOpen,
    badge: "Hot",
  },
  {
    name: "Đề thi & Đáp án",
    href: "/marketplace?category=de-thi",
    desc: "Tổng hợp đề thi giữa kỳ, cuối kỳ các trường ĐH",
    icon: FileText,
  },
  {
    name: "Giáo trình & Sách",
    href: "/marketplace?category=giao-trinh",
    desc: "Giáo trình chuẩn, sách tham khảo chuyên ngành",
    icon: GraduationCap,
  },
  {
    name: "Pass đồ sinh viên",
    href: "/marketplace?category=pass-do",
    desc: "Đồ dùng học tập, máy tính, phụ kiện giá sinh viên",
    icon: Laptop,
    badge: "Tiết kiệm",
  },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, fetchUser, logout } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { theme, toggleTheme, mobileMenuOpen, setMobileMenu } = useUIStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchNotifications();
    }
  }, [user, fetchCart, fetchNotifications]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      useUIStore.setState({ theme: "dark" });
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
  }, [pathname, setMobileMenu]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalCartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 hidden md:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/20 px-2 py-0.5 text-[11px] font-medium text-primary-300 border border-primary-500/30">
              <Sparkles className="w-3 h-3 text-primary-400" />
              Mới 2026
            </span>
            <span className="text-slate-300">
              Nền tảng chia sẻ tài liệu & pass đồ số 1 sinh viên Phenikaa và các trường Đại học
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Giao dịch đảm bảo 100%
            </span>
            <span className="text-slate-600">|</span>
            <Link href="/help" className="hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Hỗ trợ
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "glass-panel shadow-md shadow-black/5"
            : "border-b border-border/80 bg-background/90 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-black text-base tracking-wider">PKA</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground flex items-center">
                  PKA<span className="text-primary-600">SHOP</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase -mt-1 hidden sm:block">
                  Student Campus Hub
                </span>
              </div>
            </Link>

            {/* Navigation & Mega Menu Trigger */}
            <nav className="hidden lg:flex items-center gap-1">
              <div className="relative" ref={catMenuRef}>
                <button
                  type="button"
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    catDropdownOpen
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Grid className="w-4 h-4 text-primary-500" />
                  <span>Danh mục</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      catDropdownOpen ? "rotate-180 text-primary-600" : ""
                    }`}
                  />
                </button>

                {/* Mega Dropdown */}
                {catDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 glass-dropdown rounded-2xl p-2 border border-border z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 mb-1">
                      Kho danh mục học tập
                    </div>
                    {NAV_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          onClick={() => setCatDropdownOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                                {cat.name}
                              </span>
                              {cat.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  {cat.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {cat.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="mt-1 pt-2 border-t border-border/60">
                      <Link
                        href="/marketplace"
                        onClick={() => setCatDropdownOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Khám phá tất cả tài nguyên →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/marketplace"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/marketplace"
                    ? "text-primary-600 bg-primary-50 dark:bg-primary-950/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                Chợ sinh viên
              </Link>
            </nav>

            {/* Search Bar with Ctrl+K */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary-600 transition-colors" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tài liệu, đề thi, giáo trình, giáo án..."
                  className="w-full h-10 pl-10 pr-16 rounded-full border border-border/80 bg-muted/40 hover:bg-muted/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-background transition-all shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 pointer-events-none">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded shadow-xs">
                    Ctrl
                  </kbd>
                  <kbd className="px-1 py-0.5 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded shadow-xs">
                    K
                  </kbd>
                </div>
              </div>
            </form>

            {/* Actions: Theme Toggle, Notifications, Cart, Profile */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                title="Chuyển chế độ sáng/tối"
                className="h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {user ? (
                <>
                  <Link
                    href="/wallet"
                    className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {formatVND(user.walletBalance || 0)}
                    </span>
                  </Link>

                  <Link
                    href="/sell"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Đăng bán</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    title="Thông báo"
                    className="relative h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    title="Giỏ hàng"
                    className="relative h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {totalCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                        {totalCartCount > 9 ? "9+" : totalCartCount}
                      </span>
                    )}
                  </Link>

                  {/* User Profile Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1 pl-1.5 rounded-full border border-border/80 hover:bg-muted/60 transition-colors"
                    >
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 glass-dropdown rounded-2xl border border-border p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-3 bg-muted/40 rounded-xl mb-1.5 border border-border/40">
                          <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Số dư ví:</span>
                            <span className="font-bold text-emerald-600">
                              {formatVND(user.walletBalance || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-primary-500" />
                            <span>Bảng điều khiển</span>
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <Package className="w-4 h-4 text-primary-500" />
                            <span>Đơn hàng đã mua</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-primary-500" />
                            <span>Sản phẩm yêu thích</span>
                          </Link>
                          <Link
                            href="/wallet"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <Wallet className="w-4 h-4 text-primary-500" />
                            <span>Nạp / Rút tiền</span>
                          </Link>

                          {user.role === "ADMIN" && (
                            <Link
                              href="/seller"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                            >
                              <Store className="w-4 h-4 text-amber-500" />
                              <span>Kênh người bán</span>
                            </Link>
                          )}

                          {user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-purple-500" />
                              <span>Quản trị hệ thống</span>
                            </Link>
                          )}

                          <Link
                            href="/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <span>Cài đặt tài khoản</span>
                          </Link>
                        </div>

                        <div className="border-t border-border/60 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                              router.push("/");
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg w-full transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border/80 hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/20 transition-all hover:scale-[1.02]"
                  >
                    Tạo tài khoản
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenu(!mobileMenuOpen)}
                className="lg:hidden h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Category Strip below Header */}
        <div className="hidden md:block border-t border-border/60 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-9 text-xs">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                <Link
                  href="/marketplace?type=DOCUMENT"
                  className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-primary-500" />
                  <span>Tài liệu môn học</span>
                </Link>
                <Link
                  href="/marketplace?category=de-thi"
                  className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Đề thi & Lời giải</span>
                </Link>
                <Link
                  href="/marketplace?category=giao-trinh"
                  className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Giáo trình & Sách</span>
                </Link>
                <Link
                  href="/marketplace?category=pass-do"
                  className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <Laptop className="w-3.5 h-3.5 text-purple-500" />
                  <span>Pass đồ điện tử & học tập</span>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground flex-shrink-0">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Tải về tức thì
                </span>
                <span className="flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-emerald-500" /> Đã kiểm duyệt
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Left-side Slide-in Drawer - Placed outside header to avoid stacking context / z-index conflicts */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenu(false)}
        user={user}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        categories={NAV_CATEGORIES}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border flex items-center justify-around py-1.5 px-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors ${
            pathname === "/" ? "text-primary-600" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </Link>
        <Link
          href="/marketplace"
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors ${
            pathname.startsWith("/marketplace") ? "text-primary-600" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Khám phá</span>
        </Link>
        <Link
          href="/sell"
          aria-label="Đăng bán tài liệu"
          className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-tr from-primary-600 to-indigo-600 text-white rounded-full w-12 h-12 shadow-lg shadow-primary-500/40 border-4 border-background active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Link>
        <Link
          href="/cart"
          className={`relative flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors ${
            pathname === "/cart" ? "text-primary-600" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Giỏ hàng</span>
          {totalCartCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
              {totalCartCount > 9 ? "9+" : totalCartCount}
            </span>
          )}
        </Link>
        <Link
          href={user ? "/dashboard" : "/login"}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors ${
            pathname === "/dashboard" || pathname === "/login"
              ? "text-primary-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{user ? "Tài khoản" : "Đăng nhập"}</span>
        </Link>
      </nav>

    </>
  );
}
