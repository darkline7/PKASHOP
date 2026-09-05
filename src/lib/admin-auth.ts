import { getCurrentUser } from "./auth";
import type { User } from "@/types";

/**
 * Bảo mật & phân quyền khu vực admin.
 * - Guard route: chỉ ADMIN / SUPER_ADMIN được vào /admin (quyết định đã xác nhận).
 * - Permission map 6 role: xây sẵn để mở rộng RBAC (moderator, finance, support, content).
 */

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export type AdminPermission =
  | "dashboard.view"
  | "products.view"
  | "products.approve"
  | "orders.view"
  | "orders.manage"
  | "users.view"
  | "users.manage"
  | "finance.view"
  | "finance.withdrawals.approve"
  | "finance.wallet.adjust"
  | "reports.view"
  | "reports.resolve"
  | "categories.manage"
  | "settings.manage"
  | "audit.view";

type PermissionSet = AdminPermission[] | "*";

const ROLE_PERMISSIONS: Record<string, PermissionSet> = {
  SUPER_ADMIN: "*",
  ADMIN: "*",
  MODERATOR: [
    "dashboard.view",
    "products.view",
    "products.approve",
    "orders.view",
    "users.view",
    "reports.view",
    "reports.resolve",
  ],
  FINANCE_STAFF: [
    "dashboard.view",
    "orders.view",
    "finance.view",
    "finance.withdrawals.approve",
    "finance.wallet.adjust",
  ],
  SUPPORT_STAFF: ["dashboard.view", "users.view", "reports.view", "reports.resolve"],
  CONTENT_MANAGER: ["dashboard.view", "products.view", "products.approve", "categories.manage"],
};

export function isAdminRole(role?: string | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

export function hasPermission(role: string, permission: AdminPermission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms === "*" || perms.includes(permission);
}

/**
 * Guard cho API admin: trả về user nếu là admin, ngược lại trả null.
 * Route handler: `const admin = await requireAdmin(); if (!admin) return 403`.
 */
export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!isAdminRole(user.role)) return null;
  return user as unknown as User;
}

/**
 * Guard theo permission (dùng khi một admin role mở rộng được cấp hạn chế quyền).
 */
export async function requirePermission(
  permission: AdminPermission
): Promise<{ admin: User | null; hasPermission: boolean }> {
  const admin = await requireAdmin();
  return { admin, hasPermission: admin ? hasPermission(admin.role, permission) : false };
}
