import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Webhook endpoint to receive updates from Telegram Bot
// Users can link their account by messaging the Bot: "/start [username]" or "/link [username]"
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body?.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat?.id || "");
    const text = (message.text || "").trim();
    const fromUsername = message.from?.username ? `@${message.from.username}` : "";
    const fromName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Bạn";

    // Read bot token for sending replies
    const botSetting = await prisma.systemSetting.findFirst({
      where: { key: "telegram_bot_token" },
    });
    const botToken = botSetting?.value || process.env.TELEGRAM_BOT_TOKEN;

    const replyTelegram = async (msg: string) => {
      if (!botToken || !chatId) return;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: "Markdown",
          }),
        });
      } catch (e) {
        console.error("Failed to send telegram reply:", e);
      }
    };

    // Check commands: /start [username] or /link [username]
    if (text.startsWith("/start") || text.startsWith("/link")) {
      const parts = text.split(" ");
      const usernameArg = parts[1]?.trim()?.replace(/^@/, "");

      if (!usernameArg) {
        await replyTelegram(
          `👋 *Xin chào ${fromName}!*\n\n` +
          `Đây là bot thông báo tin nhắn của *PKASHOP* (Tạp hóa & Tài liệu Phenikaa).\n\n` +
          `📌 *Cách kết nối tài khoản web để nhận tin nhắn:*\n` +
          `1. Soạn: \`/link <tên_đăng_nhập_web>\` (Ví dụ: \`/link nguyenvana\`)\n` +
          `2. Hoặc gửi trực tiếp Chat ID này: \`${chatId}\` vào phần Cài đặt tài khoản trên website.\n\n` +
          `Sau khi kết nối, mỗi khi có khách nhắn tin cho bạn trên web, bot sẽ báo ngay vào đây!`
        );
        return NextResponse.json({ ok: true });
      }

      // Find user by username
      const user = await prisma.user.findFirst({
        where: {
          username: { equals: usernameArg },
        },
      });

      if (!user) {
        await replyTelegram(
          `❌ Không tìm thấy tài khoản PKASHOP có username: \`${usernameArg}\`.\n` +
          `Vui lòng kiểm tra lại tên đăng nhập trên web!`
        );
        return NextResponse.json({ ok: true });
      }

      // Link user with this chatId
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramChatId: chatId,
          ...(fromUsername && !user.telegram ? { telegram: fromUsername } : {}),
        },
      });

      await replyTelegram(
        `🎉 *Kết nối thành công!*\n\n` +
        `Tài khoản web *${user.name}* (@${user.username}) đã được liên kết với Telegram của bạn.\n\n` +
        `🔔 Từ giờ, khi có sinh viên nhắn tin mua tài liệu hoặc hỏi đồ pass, bot sẽ lập tức thông báo kèm nội dung và link trả lời trực tiếp!`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/myid") {
      await replyTelegram(`🆔 *Telegram Chat ID của bạn:* \`${chatId}\`\n\nBạn có thể copy ID này dán vào mục *Cài đặt tài khoản* trên web.`);
      return NextResponse.json({ ok: true });
    }

    // Default response for other messages
    await replyTelegram(
      `🤖 *PKASHOP Bot*\n\n` +
      `• Gõ \`/link <tên_đăng_nhập>\` để liên kết nhận tin nhắn từ website.\n` +
      `• Gõ \`/myid\` để lấy Chat ID của bạn.\n` +
      `• Chat ID hiện tại: \`${chatId}\``
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
