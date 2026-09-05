"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, Store, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Components";
import { ADMIN_MENU, type BadgeKey } from "./admin-menu";
import { fetchAdminMeta } from "@/app/admin/services/adminDashboardService";
import type { AdminMeta, AdminUser } from "@/app/admin/types";

interface SidebarProps {
  user: AdminUser;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}

/**
 * Sidebar admin — fixed, collapsible (desktop), off-canvas drawer (mobile).
 * Badge số liệu đếm thật từ /api/admin/meta, refresh theo navigation.
 */
export function AdminSidebar({ user, collapsed, mobileOpen, onToggleCollapse, onCloseMobile, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [meta, setMeta] = useState<AdminMeta | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAdminMeta().then((m) => {
      if (alive) setMeta(m);
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

  const allItems = ADMIN_MENU.flatMap((s) => s.items);
  const matches = (href: string) => pathname === href || pathname.startsWith(href + "/");
  // Active = mục khớp dài nhất (tránh highlight cả "Sản phẩm" và "Chờ duyệt" cùng lúc)
  const activeHref =
    allItems.filter((i) => matches(i.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href || null;

  const badgeCount = (key?: BadgeKey) => (key && meta ? meta[key] : 0);

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#0F172A] text-slate-300 shadow-xl transition-all duration-200",
          collapsed ? "lg:w-[76px]" : "lg:w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-2.5 border-b border-white/5 px-4",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-950/50"
            title="Về trang chủ"
          >
            <Store className="h-5 w-5" />
          </Link>
          <div className={cn("min-w-0 leading-tight", collapsed && "lg:hidden")}>
            <p className="truncate text-sm font-bold tracking-wide text-white">PKASHOP</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300/80">Admin</p>
          </div>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "ml-auto hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200 lg:flex",
              collapsed && "lg:hidden"
            )}
            title="Thu gọn menu"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.25)_transparent]">
          {ADMIN_MENU.map((section) => (
            <div key={section.title}>
              <p
                className={cn(
                  "mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500",
                  collapsed && "lg:hidden"
                )}
              >
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = activeHref === item.href;
                  const badge = badgeCount(item.badgeKey);
                  return (
                    <li key={item.href} className="group relative">
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                          collapsed && "lg:justify-center lg:px-0",
                          active
                            ? "bg-indigo-500/15 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                        )}
                      >
                        <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-indigo-400")} />
                        <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.label}</span>
                        {badge > 0 && (
                          <span
                            className={cn(
                              "rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white",
                              collapsed &&
                                "lg:absolute lg:right-2 lg:top-1 lg:rounded-full lg:bg-indigo-400/90 lg:px-1 lg:py-0.5"
                            )}
                          >
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </Link>
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 max-lg:hidden">
                          {item.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: thông tin admin + đăng xuất */}
        <div className={cn("shrink-0 border-t border-white/5 p-3", collapsed && "lg:p-2")}>
          <div className={cn("flex items-center gap-2.5 rounded-lg p-1.5", collapsed && "lg:justify-center lg:p-0")}>
            <Avatar src={user.avatar} name={user.name} size="sm" className="ring-2 ring-indigo-500/30" />
            <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "lg:hidden")}>
              <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-slate-500">
                {user.role === "SUPER_ADMIN" ? "Quản trị tối cao" : "Quản trị viên"}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className={cn(
                "hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400 lg:flex",
                collapsed && "lg:hidden"
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
