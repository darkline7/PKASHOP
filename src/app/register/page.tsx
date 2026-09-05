"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Button, Input } from "@/components/ui/Button";

declare global {
  interface Window { grecaptcha?: any; }
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState("");

  useEffect(() => {
    fetch("/api/admin?action=settings").then(r => r.json()).then(d => {
      const key = d?.settings?.recaptcha_site_key;
      if (key) {
        setRecaptchaSiteKey(key);
        if (!document.querySelector('script[src*="recaptcha"]')) {
          const s = document.createElement("script");
          s.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
          s.async = true;
          document.head.appendChild(s);
        }
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    if (form.password !== form.confirmPassword) { setError("Mật khẩu xác nhận không khớp"); setLoading(false); return; }
    try {
      let recaptchaToken = "";
      if (recaptchaSiteKey && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: "register" });
      }
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, username: form.username, email: form.email, password: form.password, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Đăng ký thất bại"); setLoading(false); return; }
      setUser(data.user);
      router.push("/");
    } catch { setError("Lỗi kết nối"); setLoading(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50 dark:from-background dark:to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center"><span className="text-white font-bold">PK</span></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">PKASHOP</span>
          </Link>
          <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-muted-foreground mt-1">Tham gia cộng đồng sinh viên</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
            <Input label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChange={set("name")} required />
            <Input label="Username" placeholder="nguyenvana" value={form.username} onChange={set("username")} required />
            <Input label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} required />
            <Input label="Mật khẩu" type="password" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={set("password")} required />
            <Input label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={set("confirmPassword")} required />
            <Button type="submit" variant="gradient" className="w-full" size="lg" isLoading={loading}>Đăng ký</Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản? <Link href="/login" className="text-primary-600 font-medium hover:underline">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
