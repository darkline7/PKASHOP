"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Button, Input } from "@/components/ui/Button";

declare global {
  interface Window { grecaptcha?: any; }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let recaptchaToken = "";
      if (recaptchaSiteKey && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: "login" });
      }
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Đăng nhập thất bại"); setLoading(false); return; }
      setUser(data.user);
      router.push(returnTo.startsWith("/") ? returnTo : "/");
    } catch { setError("Lỗi kết nối"); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50 dark:from-background dark:to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center"><span className="text-white font-bold">PK</span></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">PKASHOP</span>
          </Link>
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-muted-foreground mt-1">Chào mừng bạn quay trở lại</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">{error}</div>}
            <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Mật khẩu" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Ghi nhớ</label>
              <Link href="/forgot-password" className="text-primary-600 hover:underline">Quên mật khẩu?</Link>
            </div>
            <Button type="submit" variant="gradient" className="w-full" size="lg" isLoading={loading}>Đăng nhập</Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Chưa có tài khoản? <Link href="/register" className="text-primary-600 font-medium hover:underline">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
