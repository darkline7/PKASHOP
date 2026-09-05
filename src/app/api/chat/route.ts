import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");

    if (conversationId) {
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participant1: { select: { id: true, name: true, avatar: true } },
          participant2: { select: { id: true, name: true, avatar: true } },
          product: { select: { id: true, title: true, thumbnail: true, price: true, slug: true } },
          messages: { orderBy: { createdAt: "asc" }, take: 100, include: { sender: { select: { id: true, name: true, avatar: true } } } },
        },
      });
      if (!conv || (conv.participant1Id !== user.id && conv.participant2Id !== user.id)) {
        return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
      }
      // Mark as read
      await prisma.message.updateMany({ where: { conversationId, senderId: { not: user.id }, isRead: false }, data: { isRead: true } });
      return NextResponse.json({ conversation: conv });
    }

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ participant1Id: user.id }, { participant2Id: user.id }] },
      include: {
        participant1: { select: { id: true, name: true, avatar: true } },
        participant2: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, title: true, thumbnail: true, slug: true } },
      },
      orderBy: { lastMessageAt: "desc" },
    });
    return NextResponse.json({ conversations });
  } catch { return NextResponse.json({ error: "Lỗi server" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { recipientId, productId, content } = await req.json();
    if (!recipientId || !content) return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    if (recipientId === user.id) return NextResponse.json({ error: "Không thể nhắn tin cho chính mình" }, { status: 400 });

    // Find or create conversation
    let conv = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: user.id, participant2Id: recipientId },
          { participant1Id: recipientId, participant2Id: user.id },
        ],
        ...(productId ? { productId } : {}),
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { participant1Id: user.id, participant2Id: recipientId, productId, lastMessage: content, lastMessageAt: new Date() },
      });
    }

    const message = await prisma.message.create({
      data: { conversationId: conv.id, senderId: user.id, content },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    await prisma.conversation.update({ where: { id: conv.id }, data: { lastMessage: content, lastMessageAt: new Date() } });

    // Notification
    await prisma.notification.create({
      data: { userId: recipientId, title: "Tin nhắn mới", message: `${user.name}: ${content.substring(0, 50)}`, type: "CHAT", link: `/messages?id=${conv.id}` },
    });

    return NextResponse.json({ success: true, message, conversationId: conv.id });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
