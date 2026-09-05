import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { ForbiddenView } from "@/components/admin/ForbiddenView";
import type { AdminUser } from "./types";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

/**
 * Root layout khu vực /admin.
 * - Chưa đăng nhập → chuyển về /login?returnTo=/admin/...
 * - Đã đăng nhập nhưng không phải ADMIN/SUPER_ADMIN → hiện 403.
 * - OK → render shell + children.
 */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("pkashop_token")?.value;

  if (!token) {
    redirect("/login?returnTo=/admin");
  }

  let payload: { userId?: string; role?: string } | null = null;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?returnTo=/admin");
  }

  if (!payload?.userId) {
    redirect("/login?returnTo=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, avatar: true, role: true, blocked: true },
  });

  if (!user || user.blocked || !ADMIN_ROLES.has(user.role)) {
    return <ForbiddenView name={user?.name} />;
  }

  const adminUser: AdminUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };

  return <AdminShell user={adminUser}>{children}</AdminShell>;
}