"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Moon,
  Sun,
  X,
  Plus,
  LogOut,
  Settings,
  Package,
  Heart,
  Wallet,
  LayoutDashboard,
  Store,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/Components";
import { formatVND } from "@/lib/utils";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  user: any;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  categories: {
    name: string;
    href: string;
    desc: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export default function MobileDrawer({
  open,
  onClose,
  user,
  logout,
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  handleSearch,
  categories,
}: MobileDrawerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard Escape support
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const content = (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />
      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 left-0 w-[84%] max-w-xs bg-background border-r border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/80 bg-muted/20 flex-shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xs tracking-wider">PKA</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-foreground">
                PKA<span className="text-primary-600">SHOP</span>
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase -mt-1">Campus Hub</span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-lg border border-border/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Đổi giao diện"
            >
              {theme === "light" ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-border/60 hover:bg-muted flex items-center justify-center text-foreground transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
          {/* Search form */}
          <form
            onSubmit={(e) => {
              handleSearch(e);
              onClose();
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tài liệu, giáo trình, đề thi..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-muted/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>

          {/* User profile or Auth banner */}
          {user ? (
            <div className="p-3 bg-card rounded-2xl border border-border/80 shadow-sm space-y-2.5">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-foreground truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <span className="text-muted-foreground">Số dư ví:</span>
                <span className="font-bold text-emerald-600">{formatVND(user.walletBalance || 0)}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sinh viên PKASHOP</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                Đăng ký để mua bán tài liệu &amp; pass đồ dùng sinh viên!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="py-2 text-center text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground hover:bg-muted"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="py-2 text-center text-xs font-bold rounded-xl bg-primary-600 text-white shadow-sm hover:bg-primary-700"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          )}

          {/* Sell Button */}
          <Link
            href="/sell"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 hover:opacity-95"
          >
            <Plus className="w-4 h-4" /> Đăng bán tài liệu / Pass đồ
          </Link>

          {/* Categories */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">
              Kho danh mục
            </div>
            <div className="space-y-1">
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.name}
                    href={c.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary-600">
                        {c.name}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Links */}
          {user && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">
                Tài khoản &amp; Hoạt động
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary-500" />
                  <span>Bảng điều khiển</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                >
                  <Package className="w-4 h-4 text-primary-500" />
                  <span>Đơn hàng đã mua</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                >
                  <Heart className="w-4 h-4 text-primary-500" />
                  <span>Sản phẩm yêu thích</span>
                </Link>
                <Link
                  href="/wallet"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                >
                  <Wallet className="w-4 h-4 text-primary-500" />
                  <span>Ví PKASHOP</span>
                </Link>
                <Link
                  href="/messages"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                >
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  <span>Tin nhắn</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium hover:bg-muted/70 text-foreground"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Cài đặt tài khoản</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {user && (
          <div className="p-3 border-t border-border/80 bg-muted/10 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
                router.push("/");
              }}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
