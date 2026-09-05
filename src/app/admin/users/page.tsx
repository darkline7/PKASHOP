"use client";

import React, { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Avatar } from "@/components/ui/Components";
import { Button } from "@/components/ui/Button";
import { formatVND, formatRelativeTime } from "@/lib/utils";
import { RefreshCw, Shield, User } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=users");
      const d = await res.json();
      setUsers(d.users || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Bạn có chắc muốn chuyển quyền tài khoản này sang ${nextRole}?`)) return;

    setUpdating(id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_user_role", id, data: { role: nextRole } }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: nextRole } : u))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quản lý Người dùng"
        subtitle="Danh sách sinh viên Phenikaa và phân quyền tài khoản quản trị viên"
        actions={
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Số dư ví</th>
                <th className="px-4 py-3">Đã bán</th>
                <th className="px-4 py-3">Ngày tham gia</th>
                <th className="px-4 py-3 text-right">Phân quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name} size="md" />
                        <div>
                          <p className="font-semibold text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-600">
                      {formatVND(u.walletBalance || 0)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">
                      {u.totalSales || 0} sản phẩm
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleChangeRole(u.id, u.role)}
                        isLoading={updating === u.id}
                      >
                        Đổi sang {u.role === "ADMIN" ? "USER" : "ADMIN"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
