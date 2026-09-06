import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const botSetting = await prisma.systemSetting.findFirst({
      where: { key: "telegram_bot_token" },
    });
    const botToken = botSetting?.value || process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ botUsername: null, configured: false });
    }

    // Call Telegram getMe
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    if (data.ok && data.result?.username) {
      return NextResponse.json({
        configured: true,
        botUsername: data.result.username,
        botFirstName: data.result.first_name,
      });
    }

    return NextResponse.json({ configured: true, botUsername: null });
  } catch (error) {
    console.error("Telegram bot info error:", error);
    return NextResponse.json({ configured: false, botUsername: null });
  }
}

// POST endpoint to register or test webhook
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action } = await req.json();
    const botSetting = await prisma.systemSetting.findFirst({
      where: { key: "telegram_bot_token" },
    });
    const botToken = botSetting?.value || process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Chưa cấu hình Telegram Bot Token" }, { status: 400 });
    }

    if (action === "set_webhook") {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://taphoapka.shop").replace(/\/+$/, "");
      const webhookUrl = `${appUrl}/api/telegram/webhook`;
      const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const data = await res.json();
      return NextResponse.json({ success: data.ok, description: data.description, webhookUrl });
    }

    if (action === "webhook_info") {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const data = await res.json();
      return NextResponse.json({ info: data.result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Telegram bot action error:", error);
    return NextResponse.json({ error: "Lỗi kết nối Telegram" }, { status: 500 });
  }
}
