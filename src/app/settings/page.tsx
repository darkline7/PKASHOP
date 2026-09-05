"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input, Textarea } from "@/components/ui/Button";
import { Card, Avatar } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";

export default function SettingsPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    avatar: "",
    university: "",
    faculty: "",
    city: "",
    studentId: "",
    className: "",
    major: "",
    telegram: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      university: user.university || "",
      faculty: user.faculty || "",
      city: user.city || "",
      studentId: (user as any).studentId || "",
      className: (user as any).className || "",
      major: (user as any).major || "",
      telegram: (user as any).telegram || "",
    });
  }, [user, router]);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });
  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setMsg("Đã lưu thay đổi!"); fetchUser(); }
    else setMsg("Lỗi cập nhật");
    setLoading(false); setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">⚙️ Cài đặt tài khoản</h1>
        {msg && <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">{msg}</div>}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4"><Avatar src={form.avatar} name={form.name} size="xl" /><div><p className="font-semibold">{user?.name}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div></div>
          <Input label="Họ tên" value={form.name} onChange={set("name")} />
          <Input label="Số điện thoại" value={form.phone} onChange={set("phone")} />
          <Textarea label="Giới thiệu" value={form.bio} onChange={set("bio")} placeholder="Giới thiệu bản thân..." />
          <Input label="URL Avatar" value={form.avatar} onChange={set("avatar")} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Trường" value={form.university} onChange={set("university")} />
            <Input label="Khoa" value={form.faculty} onChange={set("faculty")} />
          </div>
          <Input label="Thành phố" value={form.city} onChange={set("city")} />
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">🎓 Xác minh danh tính sinh viên Phenikaa</h3>
              {user?.isVerified ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ Đã xác minh
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Chưa xác minh
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mã sinh viên (MSV)" value={form.studentId} onChange={set("studentId")} placeholder="VD: 21010001" />
              <Input label="Lớp sinh hoạt" value={form.className} onChange={set("className")} placeholder="VD: K15-CNTT1" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Input label="Chuyên ngành" value={form.major} onChange={set("major")} placeholder="VD: Kỹ thuật phần mềm" />
              <Input label="Telegram Username (để liên hệ)" value={form.telegram} onChange={set("telegram")} placeholder="VD: @phenikaa_user" />
            </div>
          </div>
          <Button variant="gradient" size="lg" className="w-full" onClick={handleSave} isLoading={loading}>Lưu thay đổi</Button>
        </Card>
      </main><Footer />
    </div>
  );
}
