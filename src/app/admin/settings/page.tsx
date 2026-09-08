"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button, Input } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { RefreshCw, Save, Zap, Trash2, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Auto-Bank Config state
  const [autoBanks, setAutoBanks] = useState<any[]>([]);
  const [syncingBank, setSyncingBank] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [bankForm, setBankForm] = useState({
    bankCode: "MBBANK",
    apiBaseUrl: "https://api.modtool.fun/historyapimbbankv2/token",
    apiToken: "",
    accountNumber: "",
    accountName: "",
    isActive: true,
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [resSettings, resBanks] = await Promise.all([
        fetch("/api/admin?action=settings"),
        fetch("/api/admin?action=autobank"),
      ]);
      const dSettings = await resSettings.json();
      const dBanks = await resBanks.json();
      setSettings(dSettings.settings || {});
      if (dBanks.configs) {
        setAutoBanks(dBanks.configs);
        if (dBanks.configs.length > 0) {
          const first = dBanks.configs[0];
          setBankForm({
            bankCode: first.bankCode || "MBBANK",
            apiBaseUrl: first.apiBaseUrl || "https://api.modtool.fun/historyapimbbankv2/token",
            apiToken: first.apiToken || "",
            accountNumber: first.accountNumber || "",
            accountName: first.accountName || "",
            isActive: first.isActive ?? true,
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadAutoBanks = async () => {
    try {
      const res = await fetch("/api/admin?action=autobank");
      const d = await res.json();
      if (d.configs) setAutoBanks(d.configs);
    } catch {}
  };

  const handleSaveAutoBank = async () => {
    if (!bankForm.bankCode || !bankForm.apiBaseUrl || !bankForm.apiToken) {
      alert("Vui lòng điền đầy đủ: Mã ngân hàng, API URL và API Token!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_autobank", data: bankForm }),
      });
      if (res.ok) {
        // Also sync basic bank info to settings for VietQR display
        if (bankForm.bankCode) await handleSaveSetting("bank_code", bankForm.bankCode);
        if (bankForm.accountNumber) await handleSaveSetting("bank_account_number", bankForm.accountNumber);
        if (bankForm.accountName) await handleSaveSetting("bank_account_name", bankForm.accountName);

        setMsg("Đã lưu cấu hình Auto-Bank thành công!");
        setTimeout(() => setMsg(""), 3500);
        await loadAutoBanks();
      } else {
        const d = await res.json();
        alert(d.error || "Lỗi lưu cấu hình Auto-Bank");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAutoBank = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cấu hình Auto-Bank này?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_autobank", id }),
      });
      if (res.ok) {
        setMsg("Đã xóa cấu hình Auto-Bank!");
        setTimeout(() => setMsg(""), 3000);
        await loadAutoBanks();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSyncNow = async () => {
    setSyncingBank(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/autobank/sync", { method: "POST" });
      const d = await res.json();
      setSyncResult(d);
      await loadAutoBanks();
    } catch (e: any) {
      setSyncResult({ error: e.message || "Lỗi đồng bộ" });
    } finally {
      setSyncingBank(false);
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
              label="Telegram Admin Chat ID (Nhóm hoặc Cá nhân nhận bản sao tin nhắn)"
              placeholder="VD: -100123456789 hoặc 987654321"
              value={settings["telegram_chat_id"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, telegram_chat_id: e.target.value })
              }
            />
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">💡 Tính năng Telegram hai chiều:</p>
              <p>• <b>Admin Channel:</b> Mọi tin nhắn trao đổi trên web sẽ được copy gửi về Admin Chat ID trên để giám sát.</p>
              <p>• <b>Người dùng cá nhân:</b> Sinh viên vào Cài đặt tài khoản &gt; liên kết Telegram Chat ID (hoặc chat <code>/start</code> với Bot), khi có ai nhắn tin cho họ trên web thì Bot sẽ gửi tin nhắn thẳng vào Telegram riêng của họ.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
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
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/telegram/bot-info", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "set_webhook" }),
                    });
                    const d = await res.json();
                    if (d.success) {
                      alert(`Đã kích hoạt Webhook tự động nhận tin nhắn từ Bot Telegram thành công!\nURL: ${d.webhookUrl}`);
                    } else {
                      alert(`Kích hoạt Webhook thất bại: ${d.description || d.error || "Kiểm tra token hoặc domain https"}`);
                    }
                  } catch (e: any) {
                    alert("Lỗi: " + e.message);
                  }
                }}
              >
                🔗 Bật Webhook nhận diện liên kết tự động (/start)
              </Button>
            </div>
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

        <Card className="p-5 space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>🏦 Cấu hình Auto-Bank MBBank / ACB (Modtool.fun)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                  Tự động nạp tiền 24/7
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tự động kiểm tra lịch sử biến động số dư qua API Modtool và cộng tiền vào ví sinh viên ngay khi quét VietQR.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncNow}
              isLoading={syncingBank}
              className="text-xs font-semibold self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" /> Đồng bộ thử ngay
            </Button>
          </div>

          {syncResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border ${
                syncResult.error
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {syncResult.error ? (
                <span>⚠️ {syncResult.error}</span>
              ) : (
                <span>
                  ✓ Đồng bộ hoàn tất: {syncResult.synced ?? 0} giao dịch mới được ghi nhận thành công!
                  {syncResult.message && ` (${syncResult.message})`}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Ngân hàng (Bank Code):</label>
              <select
                value={bankForm.bankCode}
                onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="MBBANK">MB Bank (MBBANK) - modtool v2</option>
                <option value="ACB">ACB Bank (Á Châu)</option>
                <option value="VCB">Vietcombank (VCB)</option>
                <option value="TECHCOMBANK">Techcombank</option>
              </select>
            </div>

            <Input
              label="API Base URL (Modtool History API)"
              placeholder="https://api.modtool.fun/historyapimbbankv2/token"
              value={bankForm.apiBaseUrl}
              onChange={(e: any) => setBankForm({ ...bankForm, apiBaseUrl: e.target.value })}
            />

            <Input
              label="API Token Modtool (Chuỗi token bảo mật)"
              placeholder="Dán token API từ modtool.fun tại đây..."
              type="password"
              value={bankForm.apiToken}
              onChange={(e: any) => setBankForm({ ...bankForm, apiToken: e.target.value })}
            />

            <Input
              label="Số tài khoản MBBank nhận tiền"
              placeholder="VD: 0868888999"
              value={bankForm.accountNumber}
              onChange={(e: any) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            />

            <Input
              label="Chủ tài khoản ngân hàng"
              placeholder="VD: NGUYEN VAN A"
              value={bankForm.accountName}
              onChange={(e: any) => setBankForm({ ...bankForm, accountName: e.target.value })}
            />

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="autobank-active"
                checked={bankForm.isActive}
                onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
                className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
              />
              <label htmlFor="autobank-active" className="text-xs font-semibold text-foreground cursor-pointer">
                Kích hoạt Auto-Bank (Đang {bankForm.isActive ? "BẬT" : "TẮT"})
              </label>
            </div>
          </div>

          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 space-y-1 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">💡 Hướng dẫn cấu hình API Modtool MBBank v2:</p>
            <p>• API URL chuẩn: <code>https://api.modtool.fun/historyapimbbankv2/token</code></p>
            <p>• Bạn chỉ cần dán token từ modtool.fun vào ô <b>API Token Modtool</b>, hệ thống sẽ tự động ghép đường dẫn.</p>
            <p>• Khi sinh viên quét mã VietQR trên trang Ví với cú pháp <code>PKA NAP &lt;username&gt;</code>, số tiền sẽ được tự động cộng vào ví sinh viên trong tích tắc.</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="gradient"
              onClick={handleSaveAutoBank}
              isLoading={saving}
              className="font-bold text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Lưu cấu hình Auto-Bank
            </Button>
          </div>

          {autoBanks.length > 0 && (
            <div className="pt-4 border-t border-border/60 space-y-3">
              <h4 className="text-xs font-bold text-foreground">Danh sách cấu hình Auto-Bank đã lưu:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {autoBanks.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {b.bankCode}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          b.isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {b.isActive ? "Đang hoạt động" : "Đang tắt"}
                      </span>
                    </div>

                    <div className="space-y-1 text-muted-foreground text-[11px]">
                      <p>
                        STK: <strong className="text-foreground">{b.accountNumber}</strong> ({b.accountName})
                      </p>
                      <p className="truncate">URL: {b.apiBaseUrl}</p>
                      <p>
                        Đồng bộ lần cuối:{" "}
                        <span className="font-mono">
                          {b.lastSyncAt ? new Date(b.lastSyncAt).toLocaleString("vi-VN") : "Chưa đồng bộ"}
                        </span>
                      </p>
                      {b.lastTransactionId && (
                        <p>
                          Mã GD gần nhất: <span className="font-mono">{b.lastTransactionId}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => {
                          setBankForm({
                            bankCode: b.bankCode,
                            apiBaseUrl: b.apiBaseUrl,
                            apiToken: b.apiToken,
                            accountNumber: b.accountNumber,
                            accountName: b.accountName,
                            isActive: b.isActive,
                          });
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                        className="text-[11px] font-semibold text-primary-600 hover:underline"
                      >
                        Sửa thông tin
                      </button>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAutoBank(b.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-foreground text-sm border-b border-border/60 pb-2">
            🤖 Cấu hình AI Core (Google Gemini API cho Check AI &amp; Humanizer)
          </h3>
          <div className="space-y-3">
            <Input
              label="Google Gemini API Key"
              placeholder="AIzaSy..."
              type="password"
              value={settings["gemini_api_key"] || ""}
              onChange={(e: any) =>
                setSettings({ ...settings, gemini_api_key: e.target.value })
              }
            />
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">💡 Lưu ý tính năng AI Core:</p>
              <p>• Dùng để tăng cường thuật toán Viết lại tự nhiên (Humanizer) và phân tích sâu văn bản chống phát hiện AI.</p>
              <p>• Nếu để trống, hệ thống sẽ tự động dùng bộ phân tích Perplexity &amp; Burstiness nội bộ (chạy offline 100% không phụ thuộc API ngoài).</p>
            </div>
            <Button
              size="sm"
              variant="gradient"
              onClick={() =>
                handleSaveSetting("gemini_api_key", settings["gemini_api_key"] || "")
              }
              isLoading={saving}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Lưu Gemini API Key
            </Button>
          </div>
        </Card>

      </div>
    </>
  );
}
