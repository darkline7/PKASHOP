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
