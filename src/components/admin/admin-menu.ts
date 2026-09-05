import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  ShoppingCart,
  Users,
  ArrowLeftRight,
  Landmark,
  FolderTree,
  ShieldAlert,
  Settings,
  History,
} from "lucide-react";

export type BadgeKey = "pendingProducts" | "pendingWithdrawals" | "openReports";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Chỉ active khi đúng exact path (không phải prefix) */
  exact?: boolean;
  /** Badge số liệu từ /api/admin/meta */
  badgeKey?: BadgeKey;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/**
 * Menu sidebar admin.
 * Chỉ các mục có dữ liệu thật trong database.
 * Các mục chưa có data model (bài viết, banner, ticket...) được ẩn theo quyết định đã xác nhận.
 */
export const ADMIN_MENU: AdminNavSection[] = [
  {
    title: "Tổng quan",
    items: [{ label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Vận hành",
    items: [
      { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
      { label: "Sản phẩm", href: "/admin/products", icon: Package },
      {
        label: "Chờ duyệt",
        href: "/admin/products/pending",
        icon: ClipboardCheck,
        exact: true,
        badgeKey: "pendingProducts",
      },
    ],
  },
  {
    title: "Người dùng",
    items: [{ label: "Tất cả người dùng", href: "/admin/users", icon: Users }],
  },
  {
    title: "Tài chính",
    items: [
      { label: "Giao dịch", href: "/admin/transactions", icon: ArrowLeftRight },
      {
        label: "Rút tiền",
        href: "/admin/withdrawals",
        icon: Landmark,
        badgeKey: "pendingWithdrawals",
      },
    ],
  },
  {
    title: "Nội dung & Hỗ trợ",
    items: [
      { label: "Danh mục", href: "/admin/categories", icon: FolderTree },
      { label: "Khiếu nại", href: "/admin/reports", icon: ShieldAlert, badgeKey: "openReports" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { label: "Cài đặt", href: "/admin/settings", icon: Settings },
      { label: "Nhật ký hoạt động", href: "/admin/audit-logs", icon: History },
    ],
  },
];
