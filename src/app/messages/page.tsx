"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, Input } from "@/components/ui/Button";
import { Card, Avatar, EmptyState } from "@/components/ui/Components";
import { useAuthStore } from "@/stores";
import { formatRelativeTime } from "@/lib/utils";

export default function MessagesPage() {
  return <Suspense fallback={<div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div><Footer /></div>}><MessagesContent /></Suspense>;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [convos, setConvos] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const msgEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const urlId = searchParams.get("id");
    const toUserId = searchParams.get("to");

    fetch("/api/chat").then(r => r.json()).then(async (d) => {
      const list = d.conversations || [];
      setConvos(list);

      if (urlId) {
        setActive(urlId);
      } else if (toUserId) {
        // Find existing conversation with this recipient
        const existing = list.find((c: any) =>
          (c.participant1Id === toUserId && c.participant2Id === user.id) ||
          (c.participant2Id === toUserId && c.participant1Id === user.id)
        );
        if (existing) {
          setActive(existing.id);
        } else {
          // Send a greeting/init conversation
          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recipientId: toUserId, content: "Xin chào!" }),
            });
            const created = await res.json();
            if (created.conversationId) {
              setActive(created.conversationId);
              // Refresh convos
              fetch("/api/chat").then(r => r.json()).then(newData => setConvos(newData.conversations || []));
            }
          } catch {}
        }
      } else if (list.length) {
        setActive(list[0].id);
      }
    });
  }, [user, searchParams]);

  useEffect(() => {
    if (!active) return;
    let isVisible = !document.hidden;
    const fetchMessages = () => {
      fetch(`/api/chat?conversationId=${active}`).then(r => r.json()).then(d => setMessages(d.conversation?.messages || []));
    };
    fetchMessages();

    // Only poll when tab is visible, use longer interval (8s) to reduce load
    let iv: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => { if (!iv) iv = setInterval(fetchMessages, 8000); };
    const stopPolling = () => { if (iv) { clearInterval(iv); iv = null; } };
    if (isVisible) startPolling();

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) { fetchMessages(); startPolling(); } else { stopPolling(); }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { stopPolling(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [active]);

  // Only scroll when new messages are added (not on every re-render)
  const prevLenRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      msgEnd.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !active) return;
    setSending(true);
    const conv = convos.find(c => c.id === active);
    const recipientId = conv?.participant1Id === user?.id ? conv?.participant2Id : conv?.participant1Id;
    await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId, content: text, productId: conv?.productId }) });
    setText("");
    const d = await fetch(`/api/chat?conversationId=${active}`).then(r => r.json());
    setMessages(d.conversation?.messages || []);
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">💬 Tin nhắn</h1>
        <div className="grid md:grid-cols-3 gap-4 h-[60vh]">
          {/* Sidebar */}
          <Card className="p-2 overflow-y-auto">
            {convos.length === 0 ? <p className="text-sm text-center py-8 text-muted-foreground">Chưa có hội thoại</p>
            : convos.map(c => {
              const other = c.participant1Id === user?.id ? c.participant2 : c.participant1;
              return (
                <button key={c.id} onClick={() => setActive(c.id)} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 ${active === c.id ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-muted"}`}>
                  <Avatar src={other?.avatar} name={other?.name || "?"} size="md" />
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{other?.name}</p>
                    {c.lastMessage && <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>}
                  </div>
                </button>
              );
            })}
          </Card>
          {/* Chat area */}
          <Card className="md:col-span-2 flex flex-col">
            {!active ? <div className="flex-1 flex items-center justify-center text-muted-foreground">Chọn hội thoại</div>
            : <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.senderId === user?.id ? "bg-primary-600 text-white" : "bg-muted"}`}>
                      <p>{m.content}</p><p className={`text-[10px] mt-1 ${m.senderId === user?.id ? "text-white/70" : "text-muted-foreground"}`}>{formatRelativeTime(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={msgEnd} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Nhập tin nhắn..." className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <Button variant="gradient" onClick={send} isLoading={sending}>Gửi</Button>
              </div>
            </>}
          </Card>
        </div>
      </main><Footer />
    </div>
  );
}
