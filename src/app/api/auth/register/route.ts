import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  username: z.string().min(3, "Username tối thiểu 3 ký tự").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username chỉ chứa chữ cái, số và dấu _"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(100),
  phone: z.string().min(8, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  studentId: z.string().optional().or(z.literal("")),
  className: z.string().optional().or(z.literal("")),
  major: z.string().optional().or(z.literal("")),
  telegram: z.string().optional().or(z.literal("")),
  recaptchaToken: z.string().optional(),
});

async function verifyRecaptcha(token?: string): Promise<boolean> {
  if (!token) return true;
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "recaptcha_secret_key" } });
    if (!setting?.value) return true;
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(setting.value)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { email, username, password, name, phone, studentId, className, major, telegram, recaptchaToken } = parsed.data;

    const captchaValid = await verifyRecaptcha(recaptchaToken);
    if (!captchaValid) {
      return NextResponse.json({ error: "Xác minh reCAPTCHA thất bại. Vui lòng thử lại." }, { status: 403 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return NextResponse.json({ error: existing.email === email ? "Email đã được sử dụng" : "Username đã tồn tại" }, { status: 409 });
    }
    const hashedPassword = await hashPassword(password);
    const isVerified = Boolean(studentId && className && major && phone);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        phone: phone || null,
        studentId: studentId || null,
        className: className || null,
        major: major || null,
        telegram: telegram || null,
        isVerified,
      },
    });
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role } }, { status: 201 });
    response.cookies.set("pkashop_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
