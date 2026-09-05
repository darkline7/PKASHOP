"use client";
import React, { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";
import { formatVND } from "@/lib/utils";
import { Wallet, ArrowDownLeft, ArrowUpRight, QrCode, RefreshCw, Eye, EyeOff, Clock, Sparkles } from "lucide-react";

const AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export default function WalletPage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<any[]>([]);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBal, setShowBal] = useState(true);
  const [tab, setTab] = useState<"overview" | "deposit" | "withdraw">("overview");
  const [amount, setAmount] = useState<number>(100000);
  const [customAmt, setCustomAmt] = useState("100000");
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [wForm, setWForm] = useState({ amount: "", bank: "MB Bank", acc: "", name: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const d = await res.json();
        setBalance(d.balance || 0);
        setTxns(d.transactions || []);
        if (d.bankInfo) setBankInfo(d.bankInfo);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  const copy = (t: string, k: string) => {
    if (navigator.clipboard) { navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(null), 2000); }
  };

  const onDeposit = async () => {
    const val = amount || Number(customAmt);
    if (!val || val < 10000) { setMsg({ ok: false, text: "Tối thiểu 10.000đ" }); return; }
    try {
      setSubmitting(true); setMsg(null);
      const res = await fetch("/api/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "DEPOSIT", amount: val }) });
      const d = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: `Nạp thành công +${formatVND(val)} vào ví!` });
        await load(); setTimeout(() => setTab("overview"), 1500);
      } else setMsg({ ok: false, text: d.error || "Thất bại" });
    } finally { setSubmitting(false); }
  };

  const onWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(wForm.amount);
    if (!val || val < 10000) { setMsg({ ok: false, text: "Rút tối thiểu 10.000đ" }); return; }
    if (val > balance) { setMsg({ ok: false, text: "Số dư không đủ" }); return; }
    try {
      setSubmitting(true); setMsg(null);
      const res = await fetch("/api/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "WITHDRAW", amount: val, bankName: wForm.bank, accountNumber: wForm.acc, accountName: wForm.name }) });
      const d = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: "Tạo yêu cầu rút tiền thành công!" });
        setWForm(p => ({ ...p, amount: "" }));
        await load(); setTimeout(() => setTab("overview"), 1800);
      } else setMsg({ ok: false, text: d.error || "Thất bại" });
    } finally { setSubmitting(false); }
  };

  const bankCode = bankInfo?.bankCode || "MBBANK";
  const accNo = bankInfo?.accountNumber || "0868888999";
  const accName = bankInfo?.accountName || "PKASHOP VIETNAM";
  const note = bankInfo?.transferNote || `PKA NAP ${(user?.username || "USER").toUpperCase()}`;
  const qr = `https://img.vietqr.io/image/${bankCode}-${accNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(accName)}`;


  return (
    <div className="min-h-screen flex flex-col bg-background"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600"><Wallet className="w-5 h-5" /></span>Ví PKASHOP</h1></div>
          <Button variant="outline" size="sm" onClick={load} isLoading={loading} className="gap-1 text-xs"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-700 text-white p-6 shadow-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold opacity-80"><span>Số dư khả dụng</span><button type="button" onClick={() => setShowBal(!showBal)}>{showBal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
            <div className="text-3xl font-extrabold mt-2">{showBal ? formatVND(balance) : "••••••••"}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="gradient" className="bg-white text-primary-700 font-bold" onClick={() => { setTab("deposit"); setMsg(null); }}><ArrowDownLeft className="w-4 h-4 mr-1 text-emerald-600" /> Nạp tiền</Button>
            <Button variant="outline" className="bg-white/15 border-white/25 text-white" onClick={() => { setTab("withdraw"); setMsg(null); }}><ArrowUpRight className="w-4 h-4 mr-1 text-amber-300" /> Rút tiền</Button>
          </div>
        </div>

        {msg && <div className={`p-3.5 rounded-2xl mb-6 text-sm font-medium ${msg.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40" : "bg-red-50 text-red-700 dark:bg-red-950/40"}`}>{msg.text}</div>}

        {tab === "deposit" && (
          <Card className="p-5 rounded-3xl border border-border mb-8 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b"><h2 className="font-bold flex items-center gap-2"><QrCode className="w-5 h-5 text-emerald-600" /> Nạp tiền qua VietQR</h2><Button variant="ghost" size="sm" onClick={() => setTab("overview")}>Hủy</Button></div>
            <div className="grid grid-cols-5 gap-2">
              {AMOUNTS.map(amt => <button key={amt} type="button" onClick={() => { setAmount(amt); setCustomAmt(String(amt)); }} className={`py-1.5 text-xs font-bold rounded-xl border ${amount === amt ? "bg-primary-600 text-white" : "bg-muted/40"}`}>{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}</button>)}
            </div>
            <Input type="number" placeholder="Số tiền khác" value={customAmt} onChange={e => { setCustomAmt(e.target.value); setAmount(Number(e.target.value) || 0); }} />
            <div className="grid md:grid-cols-12 gap-4 p-4 rounded-2xl bg-muted/30">
              <div className="md:col-span-5 flex flex-col items-center"><img src={qr} alt="VietQR" className="w-48 h-auto rounded-xl bg-white p-2 border" /><span className="text-xs text-emerald-600 font-medium mt-2">Quét mã để nạp tự động</span></div>
              <div className="md:col-span-7 space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-background border"><span>Ngân hàng:</span><strong>{bankInfo?.bankName || "MB Bank"} ({bankCode})</strong></div>
                <div className="flex justify-between p-2 rounded-xl bg-background border"><span>STK:</span><div className="flex gap-2"><strong className="font-mono">{accNo}</strong><button type="button" onClick={() => copy(accNo, "acc")} className="text-primary-600 font-bold">{copied === "acc" ? "Đã copy" : "Copy"}</button></div></div>
                <div className="flex justify-between p-2 rounded-xl bg-background border"><span>Chủ TK:</span><strong>{accName}</strong></div>
                <div className="flex justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200"><span>Nội dung:</span><div className="flex gap-2"><strong className="font-mono text-amber-900 dark:text-amber-200">{note}</strong><button type="button" onClick={() => copy(note, "note")} className="text-amber-700 font-bold">{copied === "note" ? "Đã copy" : "Copy"}</button></div></div>
                <Button variant="gradient" size="lg" className="w-full mt-2 font-bold" onClick={onDeposit} isLoading={submitting}><Sparkles className="w-4 h-4 mr-1" /> Xác nhận đã nạp</Button>
              </div>
            </div>
          </Card>
        )}
        {tab === "withdraw" && (
          <Card className="p-5 rounded-3xl border border-border mb-8">
            <div className="flex justify-between items-center pb-3 border-b mb-4"><h2 className="font-bold">Rút tiền về ngân hàng</h2><Button variant="ghost" size="sm" onClick={() => setTab("overview")}>Hủy</Button></div>
            <form onSubmit={onWithdraw} className="space-y-3">
              <Input label="Số tiền rút (VNĐ)" type="number" placeholder="Tối thiểu 10.000đ" value={wForm.amount} onChange={e => setWForm({ ...wForm, amount: e.target.value })} required />
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold block mb-1">Ngân hàng</label><select value={wForm.bank} onChange={e => setWForm({ ...wForm, bank: e.target.value })} className="w-full h-10 rounded-xl border bg-background px-3 text-sm">{["MB Bank", "Vietcombank", "Techcombank", "ACB", "BIDV", "TPBank"].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                <Input label="Số tài khoản" placeholder="STK" value={wForm.acc} onChange={e => setWForm({ ...wForm, acc: e.target.value })} required />
              </div>
              <Input label="Tên chủ tài khoản" placeholder="VD: NGUYEN VAN A" value={wForm.name} onChange={e => setWForm({ ...wForm, name: e.target.value.toUpperCase() })} required />
              <Button variant="gradient" type="submit" isLoading={submitting} className="w-full font-bold">Tạo yêu cầu rút</Button>
            </form>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Lịch sử giao dịch</h2>
          {loading ? <div className="h-16 bg-muted rounded-2xl animate-pulse" />
          : txns.length === 0 ? <Card className="p-8 text-center rounded-3xl"><EmptyState title="Chưa có giao dịch" description="Lịch sử giao dịch của bạn." /></Card>
          : <div className="space-y-2">{txns.map(t => {
            const isPos = t.amount > 0;
            return (
              <Card key={t.id} className="p-3.5 rounded-2xl border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${isPos ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" : "bg-red-100 dark:bg-red-950/40 text-red-600"}`}>{isPos ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}</div>
                  <div className="min-w-0"><p className="text-sm font-semibold truncate">{t.description || (isPos ? "Nạp tiền" : "Thanh toán")}</p><span className="text-[11px] text-muted-foreground">{new Date(t.createdAt).toLocaleString("vi-VN")}</span></div>
                </div>
                <div className={`font-extrabold text-sm ${isPos ? "text-emerald-600" : "text-red-600"}`}>{isPos ? "+" : ""}{formatVND(t.amount)}</div>
              </Card>
            );
          })}</div>}
        </div>
      </main><Footer />
    </div>
  );
}
