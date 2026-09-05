// ============ Types riêng cho khu vực Admin ============

export type DashboardPeriod = "today" | "7d" | "30d" | "month" | "custom";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

export interface KpiValue {
  value: number;
  prevValue?: number;
  /** Phần trăm thay đổi so với kỳ trước (null nếu không tính được) */
  deltaPct?: number | null;
}

export interface DashboardKpis {
  revenue: KpiValue;
  orders: KpiValue;
  pendingOrders: number;
  pendingProducts: number;
  newUsers: KpiValue;
  pendingWithdrawals: { total: number; count: number };
  attention: { total: number; complaints: number; withdrawals: number; failedTx: number };
}

export interface ChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface DashboardData {
  period: DashboardPeriod;
  range: { start: string; end: string };
  kpis: DashboardKpis;
  chart: ChartPoint[];
  orderStatusBreakdown: { status: string; count: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    buyer: { id: string; name: string; avatar: string | null };
    total: number;
    paymentMethod: string;
    status: string;
    paymentStatus: string;
    items: { title: string }[];
    createdAt: string;
  }[];
  pendingTasks: { id: string; label: string; count: number; href: string }[];
  topProducts: {
    id: string;
    title: string;
    thumbnail: string;
    sellerName: string;
    soldCount: number;
    revenue: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    adminName: string | null;
    newValue?: string | null;
    reason?: string | null;
    createdAt: string;
  }[];
}

export interface AdminMeta {
  pendingProducts: number;
  pendingWithdrawals: number;
  openReports: number;
}

export interface AdminToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}
