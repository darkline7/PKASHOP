import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const data = await req.json();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name || undefined,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        avatar: data.avatar || undefined,
        university: data.university || undefined,
        faculty: data.faculty || undefined,
        city: data.city || undefined,
        studentId: data.studentId !== undefined ? data.studentId : undefined,
        className: data.className !== undefined ? data.className : undefined,
        major: data.major !== undefined ? data.major : undefined,
        telegram: data.telegram !== undefined ? data.telegram : undefined,
        telegramChatId: data.telegramChatId !== undefined ? data.telegramChatId : undefined,
        isVerified: (data.studentId && data.className && data.major && (data.phone || user.phone)) ? true : undefined,
      },
    });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

