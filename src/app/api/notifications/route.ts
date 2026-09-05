import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  } catch { return NextResponse.json({ notifications: [], unreadCount: 0 }); }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { id, markAll } = await req.json();
    if (markAll) {
      await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
    } else if (id) {
      await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Lỗi server" }, { status: 500 }); }
}
