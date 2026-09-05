import { headers } from "next/headers";
import prisma from "../prisma";

export interface AuditOptions {
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}

/**
 * Ghi một bản ghi audit log cho hành động của admin.
 * Tự động bắt IP + User-Agent. Lỗi ghi log không làm gãy hành động chính.
 */
export async function writeAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  options?: AuditOptions
): Promise<void> {
  try {
    const h = headers();
    const forwarded = h.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
    const userAgent = h.get("user-agent")?.slice(0, 300) || null;

    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId: entityId || null,
        oldValue: options?.oldValue !== undefined ? safeStringify(options.oldValue) : null,
        newValue: options?.newValue !== undefined ? safeStringify(options.newValue) : null,
        reason: options?.reason || null,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    // Không được để lỗi audit log chặn nghiệp vụ chính
    console.error("[AuditLog] Failed to write audit log:", error);
  }
}

function safeStringify(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}
