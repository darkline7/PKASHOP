"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, ChevronDown, Clock, FileText, KeyRound, LogOut, Megaphone, Menu, Moon,
  Package, Plus, Search, Sun, Tag, User as UserIcon,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Components";
import { useUIStore, useNotificationStore } from "@/stores";
import type { AdminUser } from "@/app/admin/types";

const CRUMB_LABELS: Record<string, string> = {
  dashboard: "Tổng quan",
  products: "Sản phẩm",
  pending: "Chờ duyệt",
  orders: "Đơn hàng",
  users: "Người dùng",
  transactions: "Giao dịch",
  withdrawals: "Rút tiền",
  categories: "Danh mục",
  reports: "Khiếu nại",
  settings: "Cài đặt",
  "audit-logs": "Nhật ký hoạt động",
};

function crumbLabel(segment: string): string {
  return CRUMB_LABELS[segment] || "Chi tiết";
}

interface TopbarProps {
  user: AdminUser;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  notify: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

type DropdownKey = "quick" | "notifications" | "account" | null;

/**
 * Topbar admin — breadcrumb, tìm kiếm, quick action, thông báo, theme, tài khoản.
 */
export function AdminTopbar({ user, onOpenMobileMenu, onLogout, notify }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const [open, setOpen] = useState<DropdownKey>(null);
  const [query, setQuery] = useState("");
  const barRef = useRef<HTMLElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open === "notifications") fetchNotifications();
  }, [open, fetchNotifications]);

  const toggle = (key: Exclude<DropdownKey, null>) => setOpen((cur) => (cur === key ? null : key));

  const crumbs = pathname.split("/").filter(Boolean).slice(1); // bỏ "admin"

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/admin/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      ref={barRef}
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#0B0F1A]/90"
    >
      <div className="flex h-16 items-center gap-2.5 px-4 md:px-6">
        {/* Nút mở menu (mobile) */}
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          title="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden min-w-0 items-center gap-1.5 text-[13px] sm:flex" aria-label="Breadcrumb">
          <span className="shrink-0 font-semibold text-slate-400 dark:text-slate-500">Admin</span>
          {crumbs.length === 0 ? (
            <>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">Tổng quan</span>
            </>
          ) : (
            crumbs.map((seg, i) => (
              <React.Fragment key={`${seg}-${i}`}>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span
                  className={cn(
                    "truncate",
                    i === crumbs.length - 1
                      ? "font-semibold text-slate-800 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {crumbLabel(seg)}
                </span>
              </React.Fragment>
            ))
          )}
        </nav>

        <div className="min-w-2 flex-1" />

        {/* Tìm kiếm */}
        <form onSubmit={submitSearch} className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm đơn hàng, người dùng, sản phẩm…"
            className="h-9 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 lg:w-72 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
        </form>

        {/* Quick action */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => toggle("quick")}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Mới
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
          {open === "quick" && (
            <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <QuickAction
                icon={Package}
                label="Thêm sản phẩm"
                onClick={() => {
                  setOpen(null);
                  router.push("/admin/products?new=1");
                }}
              />
              <QuickAction icon={Tag} label="Tạo mã giảm giá" soon onClick={() => notify("Chức năng đang phát triển", "info")} />
              <QuickAction icon={Megaphone} label="Gửi thông báo" soon onClick={() => notify("Chức năng đang phát triển", "info")} />
              <QuickAction icon={FileText} label="Tạo bài viết" soon onClick={() => notify("Chức năng đang phát triển", "info")} />
            </div>
          )}
        </div>

        {/* Thông báo */}
        <div className="relative">
          <button
            onClick={() => toggle("notifications")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Thông báo"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {open === "notifications" && (
            <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
                <p className="text-[13px] font-semibold">Thông báo</p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-slate-400">Chưa có thông báo nào</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) {
                          router.push(n.link);
                          setOpen(null);
                        }
                      }}
                      className={cn(
                        "flex w-full flex-col gap-0.5 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/40",
                        !n.isRead && "bg-indigo-50/60 dark:bg-indigo-500/5"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />}
                        <span
                          className={cn(
                            "truncate text-[13px]",
                            !n.isRead ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                          )}
                        >
                          {n.title}
                        </span>
                      </span>
                      <span className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.message}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Đổi giao diện sáng/tối"
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Tài khoản */}
        <div className="relative">
          <button
            onClick={() => toggle("account")}
            className="flex items-center gap-1.5 rounded-lg p-1 pr-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Tài khoản"
          >
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>
          {open === "account" && (
            <div className="absolute right-0 top-11 z-40 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-700">
                <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <MenuItem
                icon={UserIcon}
                label="Trang cá nhân"
                onClick={() => {
                  setOpen(null);
                  router.push("/settings");
                }}
              />
              <MenuItem
                icon={KeyRound}
                label="Đổi mật khẩu"
                onClick={() => {
                  setOpen(null);
                  router.push("/settings");
                }}
              />
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <MenuItem icon={LogOut} label="Đăng xuất" danger onClick={onLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function QuickAction({
  icon: Icon,
  label,
  soon,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  soon?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
        soon ? "text-slate-400 dark:text-slate-500" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {soon && (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-700 dark:text-slate-400">
          Sắp có
        </span>
      )}
    </button>
  );
}

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}