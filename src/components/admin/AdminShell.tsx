"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { useAdminToast, ToastViewport } from "./toast";
import type { AdminUser } from "@/app/admin/types";

/**
 * Khung shell admin — sidebar cố định + topbar + vùng nội dung.
 * Không dùng Header/Footer public; tự đồng bộ theme từ localStorage.
 */
export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toasts, push, remove } = useAdminToast();
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  // Đồng bộ theme (admin không render Header public nên cần tự áp class)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    document.documentElement.classList.toggle("dark", dark);
    useUIStore.setState({ theme: dark ? "dark" : "light" });
  }, []);

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Khóa scroll body khi drawer mobile mở
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Bỏ qua lỗi — vẫn chuyển hướng
    }
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F1A] dark:text-slate-100">
      <AdminSidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"
        )}
      >
        <AdminTopbar
          user={user}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={handleLogout}
          notify={push}
        />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 md:px-6 lg:px-8">{children}</main>
      </div>
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </div>
  );
}