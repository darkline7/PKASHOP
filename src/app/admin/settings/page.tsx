"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button, Input } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { RefreshCw, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=settings");
      const d = await res.json();
      setSettings(d.settings || {});
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_setting", data: { key, value } }),
      });
      if (res.ok) {
        setMsg(`Đã lưu "${key}" thành công!`);
        setTimeout(() => setMsg(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Cài đặt Hệ thống"
        subtitle="Cấu hình hệ thống, thanh toán ngân hàng tự động và bảo mật reCAPTCHA Phenikaa"
        actions={
          <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      {msg && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          ✓ {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 md:col-span-2">
          <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2">
            📢 Thông báo nổi Trang chủ (Quy định &amp; Cẩm nang an toàn)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Bật thông báo nổi:</label>
              <input
                type="checkbox"
                checked={settings["home_popup_enabled"] !== "false"}
                onChange={(e) =>
                  setSettings({ ...settings, home_popup_enabled: e.target.checked ? "true" : "false" })
                }
                className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">
                {settings["home_popup_enabled"] !== "false" ? "Đang bật (Hiển thị cho khách & sinh viên)" : "Đang tắt"}
              </span>
            </div>

            <Input
              label="Tiêu đề thông báo nổi"
              placeholder="QUY ĐỊNH & CẨM NANG SỬ DỤNG AN TOÀN"
              value={settings["home_popup_title"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, home_popup_title: e.target.value })
              }
            />

            <div>
              <label className="text-sm font-medium block mb-1 text-foreground">
                Nội dung quy định &amp; cẩm nang (Hỗ trợ xuống dòng)
              </label>
              <textarea
                rows={8}
                value={settings["home_popup_content"] || ""}
                onChange={(e: any) =>
                  setSettings({ ...settings, home_popup_content: e.target.value })
                }
                placeholder="Nhập nội dung quy định mua bán, trách nhiệm nội dung, quy tắc 3 KHÔNG..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono leading-relaxed"
              />
            </div>

            <Button
              size="sm"
              variant="gradient"
              onClick={async () => {
                await handleSaveSetting("home_popup_enabled", settings["home_popup_enabled"] || "true");
                await handleSaveSetting("home_popup_title", settings["home_popup_title"] || "");
                await handleSaveSetting("home_popup_content", settings["home_popup_content"] || "");
              }}
              isLoading={saving}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Lưu thông báo nổi trang chủ
            </Button>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2">
            ✈️ Cấu hình Telegram Bot (Nhận tin nhắn & Thông báo)
          </h3>
          <div className="space-y-3">
            <Input
              label="Telegram Bot Token"
              placeholder="VD: 123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
              value={settings["telegram_bot_token"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, telegram_bot_token: e.target.value })
              }
            />
            <Input
              label="Telegram Chat ID (Nhóm hoặc Cá nhân nhận tin nhắn)"
              placeholder="VD: -100123456789 hoặc 987654321"
              value={settings["telegram_chat_id"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, telegram_chat_id: e.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Mỗi khi có tin nhắn chat giữa người mua và người bán, Bot sẽ gửi bản sao thông báo trực tiếp đến Telegram để bạn đọc ngay trên điện thoại!
            </p>
            <Button
              size="sm"
              variant="gradient"
              onClick={async () => {
                await handleSaveSetting("telegram_bot_token", settings["telegram_bot_token"] || "");
                await handleSaveSetting("telegram_chat_id", settings["telegram_chat_id"] || "");
              }}
              isLoading={saving}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Lưu cấu hình Telegram
            </Button>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2">
            🛡️ Bảo mật & Xác thực reCAPTCHA
          </h3>
          <div className="space-y-3">
            <Input
              label="Google reCAPTCHA v3 Site Key"
              placeholder="6L..."
              value={settings["recaptcha_site_key"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, recaptcha_site_key: e.target.value })
              }
            />
            <Button
              size="sm"
              variant="gradient"
              onClick={() =>
                handleSaveSetting("recaptcha_site_key", settings["recaptcha_site_key"] || "")
              }
              isLoading={saving}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Lưu Site Key
            </Button>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2">
            🏦 Tài khoản Ngân hàng Nhận tiền Phenikaa
          </h3>
          <div className="space-y-3">
            <Input
              label="Tên ngân hàng (Bank Code)"
              placeholder="MBBANK, VCB, TECHCOMBANK"
              value={settings["bank_code"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, bank_code: e.target.value })
              }
            />
            <Input
              label="Số tài khoản"
              placeholder="VD: 0987654321"
              value={settings["bank_account_number"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, bank_account_number: e.target.value })
              }
            />
            <Input
              label="Chủ tài khoản"
              placeholder="VD: NGUYEN VAN A"
              value={settings["bank_account_name"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, bank_account_name: e.target.value })
              }
            />
            <Button
              size="sm"
              variant="gradient"
              onClick={async () => {
                await handleSaveSetting("bank_code", settings["bank_code"] || "");
                await handleSaveSetting("bank_account_number", settings["bank_account_number"] || "");
                await handleSaveSetting("bank_account_name", settings["bank_account_name"] || "");
              }}
              isLoading={saving}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Lưu thông tin ngân hàng
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
