import prisma from "@/lib/prisma";

export interface BankTransaction {
  transactionID: string | number;
  amount: string | number;
  description: string;
  transactionDate: string;
  type: "IN" | "OUT";
}

export interface BankApiResponse {
  status: string | number;
  message?: string;
  transactions?: BankTransaction[];
  data?: BankTransaction[];
}

export function buildBankApiUrl(baseUrl: string, token: string): string {
  let url = (baseUrl || "").trim();
  const tok = (token || "").trim();

  // If baseUrl is empty, fallback to default MBBANK v2 URL
  if (!url && tok) {
    return `https://api.modtool.fun/historyapimbbankv2/${tok}`;
  }

  // If baseUrl ends with literal "/token" placeholder
  if (url.endsWith("/token")) {
    if (tok && tok.toLowerCase() !== "token") {
      return url.replace(/\/token$/, `/${tok}`);
    }
    return url;
  }

  // If baseUrl already ends with the actual token
  if (tok && url.endsWith(`/${tok}`)) {
    return url;
  }

  // If token is separate and valid
  if (tok && tok.toLowerCase() !== "token") {
    return `${url.replace(/\/+$/, "")}/${tok}`;
  }

  return url;
}

export async function fetchBankHistory(baseUrl: string, token: string): Promise<BankTransaction[]> {
  const url = buildBankApiUrl(baseUrl, token);
  if (!url) throw new Error("Chưa có URL API ngân hàng hợp lệ");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "PKASHOP-AutoBank/1.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Bank API HTTP ${res.status}: ${errorText.slice(0, 120)}`);
  }

  const data: BankApiResponse = await res.json();
  const isSuccess =
    data.status === "success" ||
    data.status === 200 ||
    Array.isArray(data.transactions) ||
    Array.isArray(data.data);

  if (!isSuccess) {
    throw new Error(data.message || "Bank API trả về trạng thái thất bại");
  }

  const rawList: any[] = data.transactions || data.data || [];
  return rawList.map((t) => {
    const rawType = String(t.type || t.transactionType || "").toUpperCase();
    const parsedAmt = parseAmount(t.amount ?? t.creditAmount ?? t.money ?? 0);
    let isIn = true;
    if (rawType === "OUT" || rawType === "DR" || rawType === "-") {
      isIn = false;
    } else if (rawType === "IN" || rawType === "CR" || rawType === "+") {
      isIn = true;
    } else {
      isIn = parsedAmt > 0;
    }

    return {
      transactionID: String(t.transactionID || t.refNo || t.id || t.transactionId || ""),
      amount: parsedAmt,
      description: String(t.description || t.descriptionTransaction || t.remark || ""),
      transactionDate: String(t.transactionDate || t.date || new Date().toISOString()),
      type: (isIn ? "IN" : "OUT") as "IN" | "OUT",
    };
  });
}

export function parseAmount(val: string | number): number {
  if (typeof val === "number") return Math.abs(val);
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export async function matchUserFromDescription(desc: string): Promise<{
  id: string;
  username: string;
  walletBalance: number;
} | null> {
  if (!desc) return null;
  const upper = desc.toUpperCase();

  // 1. Explicit pattern: PKA NAP <USERNAME> or NAP <USERNAME> or PKA <USERNAME>
  const prefixMatch = upper.match(/(?:PKA\s*NAP|NAP|PKA)\s+([A-Z0-9_.-]+)/i);
  if (prefixMatch && prefixMatch[1]) {
    const candidate = prefixMatch[1].trim();
    const user = await prisma.user.findFirst({
      where: { username: candidate },
      select: { id: true, username: true, walletBalance: true },
    });
    if (user) return user;

    const allUsers = await prisma.user.findMany({
      select: { id: true, username: true, walletBalance: true },
    });
    const found = allUsers.find(
      (u) => u.username.toLowerCase() === candidate.toLowerCase()
    );
    if (found) return found;
  }

  // 2. Standalone username search (minimum length 3)
  const allUsers = await prisma.user.findMany({
    select: { id: true, username: true, walletBalance: true },
  });
  for (const u of allUsers) {
    if (u.username && u.username.length >= 3) {
      const escaped = u.username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|[^A-Za-z0-9_])${escaped}(?:$|[^A-Za-z0-9_])`, "i");
      if (regex.test(upper)) {
        return u;
      }
    }
  }

  return null;
}
